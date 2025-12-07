import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get } = hre.deployments;

  console.log("\n📊 Deploying UserDashboard...");

  const stakingManager = await get("StakingManager");
  const eventPoolManager = await get("EventPoolManager");
  const rewardsManager = await get("RewardsManager");

  const deployment = await deploy("UserDashboard", {
    from: deployer,
    args: [stakingManager.address, eventPoolManager.address, rewardsManager.address],
    log: true,
    autoMine: true,
  });

  console.log("✅ UserDashboard deployed at:", deployment.address);
};

export default func;
func.tags = ["UserDashboard"];
