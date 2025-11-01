import { expect } from "chai";
import { ethers, fhevm } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { FhevmType } from "@fhevm/hardhat-plugin";

import { ERC7984Coin, SecretAPRStaking, ERC7984Coin__factory, SecretAPRStaking__factory } from "../types";

describe("SecretAPRStaking", function () {
  let coin: ERC7984Coin;
  let staking: SecretAPRStaking;
  let deployer: any;
  let alice: any;
  let bob: any;

  before(async function () {
    [deployer, alice, bob] = await ethers.getSigners();
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      this.skip();
    }

    coin = await new ERC7984Coin__factory(deployer).deploy();
    await coin.waitForDeployment();

    staking = await new SecretAPRStaking__factory(deployer).deploy(await coin.getAddress());
    await staking.waitForDeployment();

    await coin.connect(deployer).setMinter(await staking.getAddress());
  });

  it("stores stake details", async function () {
    const stakeAmount = ethers.parseEther("1");

    await staking.connect(alice).stake({ value: stakeAmount });

    const [amount, depositedAt, lastClaimAt, totalClaimed, pending] = await staking.getStake(alice.address);

    expect(amount).to.equal(stakeAmount);
    expect(depositedAt).to.be.gt(0n);
    expect(lastClaimAt).to.be.eq(depositedAt);
    expect(totalClaimed).to.equal(0n);
    expect(pending).to.equal(0n);
    expect(await staking.totalStaked()).to.equal(stakeAmount);
  });

  it("accrues and mints interest after one day", async function () {
    const stakeAmount = ethers.parseEther("1");

    await staking.connect(alice).stake({ value: stakeAmount });

    await time.increase(24 * 60 * 60);

    const pending = await staking.pendingInterest(alice.address);
    const expectedReward = 1_000_000_000n;
    const tolerance = 12_000n;
    expect(pending).to.be.gte(expectedReward);
    expect(pending).to.be.lte(expectedReward + tolerance);

    const tx = await staking.connect(alice).claimInterest();
    await tx.wait();

    const encryptedBalance = await coin.confidentialBalanceOf(alice.address);
    const clearBalance = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encryptedBalance,
      await coin.getAddress(),
      alice,
    );

    expect(clearBalance).to.be.gte(expectedReward);
    expect(clearBalance).to.be.lte(expectedReward + tolerance);

    const [, , lastClaimAt, totalClaimed, outstanding] = await staking.getStake(alice.address);
    expect(totalClaimed).to.be.gte(expectedReward);
    expect(totalClaimed).to.be.lte(expectedReward + tolerance);
    expect(outstanding).to.equal(0n);
    expect(lastClaimAt).to.be.gt(0n);
  });

  it("allows unstaking with interest settlement", async function () {
    const stakeAmount = ethers.parseEther("2");
    await staking.connect(alice).stake({ value: stakeAmount });

    await time.increase(12 * 60 * 60);

    const unstakeTx = await staking.connect(alice).unstake(ethers.parseEther("1"));
    const receipt = await unstakeTx.wait();

    expect(await staking.totalStaked()).to.equal(ethers.parseEther("1"));

    const [amount] = await staking.getStake(alice.address);
    expect(amount).to.equal(ethers.parseEther("1"));
    expect(receipt?.status).to.equal(1n);
  });

  it("reverts when claiming without stake", async function () {
    await expect(staking.connect(bob).claimInterest()).to.be.revertedWithCustomError(staking, "NoStake");
  });

  it("reverts when staking zero", async function () {
    await expect(staking.connect(alice).stake({ value: 0 })).to.be.revertedWithCustomError(staking, "ZeroAmount");
  });
});
