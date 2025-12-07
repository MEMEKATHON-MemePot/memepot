import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { get } = hre.deployments;
  const { ethers } = hre;

  console.log("\n🔗 Wiring RewardsManager into StakingManager & EventPoolManager...");

  const stakingManagerDep = await get("StakingManager");
  const eventPoolManagerDep = await get("EventPoolManager");
  const rewardsManagerDep = await get("RewardsManager");

  const stakingManager = await ethers.getContractAt("StakingManager", stakingManagerDep.address);
  const eventPoolManager = await ethers.getContractAt("EventPoolManager", eventPoolManagerDep.address);
  const rewardsManager = await ethers.getContractAt("RewardsManager", rewardsManagerDep.address);

  // setRewardsManager on StakingManager
  const tx1 = await stakingManager
    .connect(await ethers.getSigner(deployer))
    .setRewardsManager(rewardsManagerDep.address);
  await tx1.wait();
  console.log("✅ StakingManager.setRewardsManager:", rewardsManagerDep.address);

  // setRewardsManager on EventPoolManager
  const tx2 = await eventPoolManager
    .connect(await ethers.getSigner(deployer))
    .setRewardsManager(rewardsManagerDep.address);
  await tx2.wait();
  console.log("✅ EventPoolManager.setRewardsManager:", rewardsManagerDep.address);

  // setStakingManager on RewardsManager (authorize StakingManager to credit rewards)
  const tx3 = await rewardsManager
    .connect(await ethers.getSigner(deployer))
    .setStakingManager(stakingManagerDep.address);
  await tx3.wait();
  console.log("✅ RewardsManager.setStakingManager:", stakingManagerDep.address);

  // setEventPoolManager on RewardsManager (authorize EventPoolManager to credit prizes)
  const tx4 = await rewardsManager
    .connect(await ethers.getSigner(deployer))
    .setEventPoolManager(eventPoolManagerDep.address);
  await tx4.wait();
  console.log("✅ RewardsManager.setEventPoolManager:", eventPoolManagerDep.address);
};

export default func;
func.tags = ["WireRewards"];
