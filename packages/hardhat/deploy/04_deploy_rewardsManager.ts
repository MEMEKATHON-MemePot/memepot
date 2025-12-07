import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, getOrNull } = hre.deployments;

  console.log("\n💰 Deploying / Reusing RewardsManager...");

  const existing = await getOrNull("RewardsManager");
  if (existing) {
    console.log("ℹ️  Reusing RewardsManager at:", existing.address);
    return;
  }

  const deployment = await deploy("RewardsManager", {
    from: deployer,
    args: [deployer], // admin
    log: true,
    autoMine: true,
  });

  console.log("✅ RewardsManager deployed at:", deployment.address);
};

export default func;
func.tags = ["RewardsManager"];
