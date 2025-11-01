// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.27;

import {ERC7984} from "@openzeppelin/confidential-contracts/token/ERC7984/ERC7984.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {FHE, euint64} from "@fhevm/solidity/lib/FHE.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract ERC7984Coin is ERC7984, SepoliaConfig, Ownable {
    error UnauthorizedMinter(address caller);
    error InvalidMinter();

    address public minter;

    event MinterUpdated(address indexed previousMinter, address indexed newMinter);

    constructor() ERC7984("Coin", "COIN", "") Ownable(msg.sender) {}

    function setMinter(address newMinter) external onlyOwner {
        if (newMinter == address(0)) {
            revert InvalidMinter();
        }

        address previousMinter = minter;
        minter = newMinter;
        emit MinterUpdated(previousMinter, newMinter);
    }

    function mint(address to, uint64 amount) external {
        if (msg.sender != minter) {
            revert UnauthorizedMinter(msg.sender);
        }

        euint64 encryptedAmount = FHE.asEuint64(amount);
        FHE.allowThis(encryptedAmount);
        FHE.allow(encryptedAmount, to);
        _mint(to, encryptedAmount);
    }
}
