// packages/hardhat/deploy/03_deploy_tokenBalanceHelper.ts
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, getOrNull } = hre.deployments;

  console.log("\n💰 Deploying / Reusing TokenBalanceHelper...");

  const existing = await getOrNull("TokenBalanceHelper");
  if (existing) {
    console.log("ℹ️  Reusing TokenBalanceHelper at:", existing.address);
    return;
  }

  const deployment = await deploy("TokenBalanceHelper", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  console.log("✅ TokenBalanceHelper deployed at:", deployment.address);
};

export default func;
func.tags = ["TokenBalanceHelper"];
