import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const coinDeployment = await deploy("ERC7984Coin", {
    from: deployer,
    log: true,
  });

  const stakingDeployment = await deploy("SecretAPRStaking", {
    from: deployer,
    log: true,
    args: [coinDeployment.address],
  });

  await hre.deployments.execute(
    "ERC7984Coin",
    { from: deployer, log: true },
    "setMinter",
    stakingDeployment.address,
  );

  console.log(`ERC7984Coin deployed at ${coinDeployment.address}`);
  console.log(`SecretAPRStaking deployed at ${stakingDeployment.address}`);
};
export default func;
func.id = "deploy_secret_apr"; // id required to prevent reexecution
func.tags = ["SecretAPR"];
