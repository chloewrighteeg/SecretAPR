import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";
import { FhevmType } from "@fhevm/hardhat-plugin";

task("task:staking-address", "Print staking and coin contract addresses").setAction(async (_args, hre) => {
  const stakingDeployment = await hre.deployments.get("SecretAPRStaking");
  const coinDeployment = await hre.deployments.get("ERC7984Coin");

  console.log(`SecretAPRStaking: ${stakingDeployment.address}`);
  console.log(`ERC7984Coin     : ${coinDeployment.address}`);
});

task("task:stake", "Stake ETH into the protocol")
  .addParam("amount", "Amount of ETH to stake (in ether)")
  .setAction(async (args: TaskArguments, hre) => {
    const stakingDeployment = await hre.deployments.get("SecretAPRStaking");
    const stakingContract = await hre.ethers.getContractAt("SecretAPRStaking", stakingDeployment.address);

    const amountInWei = hre.ethers.parseEther(args.amount);

    const [signer] = await hre.ethers.getSigners();
    const tx = await stakingContract.connect(signer).stake({ value: amountInWei });
    console.log(`Stake tx: ${tx.hash}`);
    await tx.wait();
  });

task("task:claim", "Claim accrued COIN interest")
  .addOptionalParam("address", "Staking contract address override")
  .setAction(async (args: TaskArguments, hre) => {
    const stakingDeployment = args.address
      ? { address: args.address }
      : await hre.deployments.get("SecretAPRStaking");

    const stakingContract = await hre.ethers.getContractAt("SecretAPRStaking", stakingDeployment.address);

    const [signer] = await hre.ethers.getSigners();
    const tx = await stakingContract.connect(signer).claimInterest();
    console.log(`Claim tx: ${tx.hash}`);
    await tx.wait();
  });

task("task:unstake", "Withdraw staked ETH")
  .addParam("amount", "Amount of ETH to withdraw (in ether)")
  .setAction(async (args: TaskArguments, hre) => {
    const stakingDeployment = await hre.deployments.get("SecretAPRStaking");
    const stakingContract = await hre.ethers.getContractAt("SecretAPRStaking", stakingDeployment.address);

    const amountInWei = hre.ethers.parseEther(args.amount);

    const [signer] = await hre.ethers.getSigners();
    const tx = await stakingContract.connect(signer).unstake(amountInWei);
    console.log(`Unstake tx: ${tx.hash}`);
    await tx.wait();
  });

task("task:pending", "Preview pending interest for a user")
  .addOptionalParam("user", "Address of the user")
  .setAction(async (args: TaskArguments, hre) => {
    const stakingDeployment = await hre.deployments.get("SecretAPRStaking");
    const stakingContract = await hre.ethers.getContractAt("SecretAPRStaking", stakingDeployment.address);

    const [signer] = await hre.ethers.getSigners();
    const target = args.user ?? signer.address;

    const pending = await stakingContract.pendingInterest(target);
    console.log(`Pending interest for ${target}: ${pending.toString()} (scaled by 1e6)`);
  });

task("task:decrypt-balance", "Decrypt the user's confidential COIN balance")
  .addOptionalParam("user", "Address of the user")
  .addOptionalParam("coin", "COIN contract address override")
  .setAction(async (args: TaskArguments, hre) => {
    await hre.fhevm.initializeCLIApi();

    const coinDeployment = args.coin ? { address: args.coin } : await hre.deployments.get("ERC7984Coin");
    const coinContract = await hre.ethers.getContractAt("ERC7984Coin", coinDeployment.address);

    const [signer] = await hre.ethers.getSigners();
    const target = args.user ?? signer.address;

    const encryptedBalance = await coinContract.confidentialBalanceOf(target);
    if (encryptedBalance === hre.ethers.ZeroHash) {
      console.log(`Encrypted balance for ${target}: ${encryptedBalance}`);
      console.log("Clear balance : 0");
      return;
    }

    const clearBalance = await hre.fhevm.userDecryptEuint(
      FhevmType.euint64,
      encryptedBalance,
      coinDeployment.address,
      signer,
    );
    console.log(`Encrypted balance: ${encryptedBalance}`);
    console.log(`Clear balance   : ${clearBalance.toString()} (scaled by 1e6)`);
  });
