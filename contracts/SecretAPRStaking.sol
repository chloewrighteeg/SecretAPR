// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.27;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

import {ERC7984Coin} from "./ERC7984Coin.sol";

contract SecretAPRStaking is ReentrancyGuard {
    struct StakeInfo {
        uint256 amount;
        uint256 depositedAt;
        uint256 lastClaimAt;
        uint256 totalClaimed;
    }

    error ZeroAmount();
    error NoStake();
    error RewardTooLarge(uint256 amount);
    error InsufficientStake(uint256 requested, uint256 available);
    error FailedToSend();
    error InvalidCoin();

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event InterestClaimed(address indexed user, uint256 amount);

    uint256 private constant TOKENS_PER_ETH_PER_DAY = 1_000_000_000;
    uint256 private constant SECONDS_PER_DAY = 1 days;

    ERC7984Coin public immutable coin;
    uint256 public totalStaked;

    mapping(address user => StakeInfo) private stakes;

    constructor(address coinAddress) {
        if (coinAddress == address(0)) {
            revert InvalidCoin();
        }
        coin = ERC7984Coin(coinAddress);
    }

    function stake() external payable nonReentrant {
        if (msg.value == 0) {
            revert ZeroAmount();
        }

        StakeInfo storage info = stakes[msg.sender];

        if (info.amount > 0) {
            _claim(msg.sender, info);
        } else {
            info.depositedAt = block.timestamp;
            info.lastClaimAt = block.timestamp;
        }

        info.amount += msg.value;
        info.lastClaimAt = block.timestamp;
        totalStaked += msg.value;

        emit Staked(msg.sender, msg.value);
    }

    function claimInterest() external nonReentrant returns (uint256 claimed) {
        StakeInfo storage info = stakes[msg.sender];
        if (info.amount == 0) {
            revert NoStake();
        }

        claimed = _claim(msg.sender, info);
        emit InterestClaimed(msg.sender, claimed);
    }

    function unstake(uint256 amount) external nonReentrant {
        if (amount == 0) {
            revert ZeroAmount();
        }

        StakeInfo storage info = stakes[msg.sender];
        uint256 stakedAmount = info.amount;
        if (stakedAmount == 0 || amount > stakedAmount) {
            revert InsufficientStake(amount, stakedAmount);
        }

        _claim(msg.sender, info);

        info.amount = stakedAmount - amount;
        totalStaked -= amount;

        if (info.amount == 0) {
            info.depositedAt = 0;
            info.lastClaimAt = 0;
        } else {
            info.lastClaimAt = block.timestamp;
        }

        (bool success, ) = msg.sender.call{value: amount}("");
        if (!success) {
            revert FailedToSend();
        }

        emit Unstaked(msg.sender, amount);
    }

    function getStake(address user)
        external
        view
        returns (uint256 amount, uint256 depositedAt, uint256 lastClaimAt, uint256 totalClaimed, uint256 pending)
    {
        StakeInfo storage info = stakes[user];
        amount = info.amount;
        depositedAt = info.depositedAt;
        lastClaimAt = info.lastClaimAt;
        totalClaimed = info.totalClaimed;
        pending = _pendingInterest(info);
    }

    function pendingInterest(address user) external view returns (uint256) {
        StakeInfo storage info = stakes[user];
        return _pendingInterest(info);
    }

    function _claim(address user, StakeInfo storage info) internal returns (uint256) {
        uint256 rewards = _pendingInterest(info);

        info.lastClaimAt = block.timestamp;

        if (rewards == 0) {
            return 0;
        }

        if (rewards > type(uint64).max) {
            revert RewardTooLarge(rewards);
        }

        coin.mint(user, uint64(rewards));
        info.totalClaimed += rewards;

        return rewards;
    }

    function _pendingInterest(StakeInfo storage info) internal view returns (uint256) {
        uint256 amount = info.amount;
        if (amount == 0) {
            return 0;
        }

        uint256 lastClaimAt = info.lastClaimAt;
        if (lastClaimAt == 0) {
            return 0;
        }

        uint256 elapsed = block.timestamp - lastClaimAt;
        if (elapsed == 0) {
            return 0;
        }

        uint256 normalized = Math.mulDiv(amount, elapsed, 1e18);
        return Math.mulDiv(normalized, TOKENS_PER_ETH_PER_DAY, SECONDS_PER_DAY);
    }
}
