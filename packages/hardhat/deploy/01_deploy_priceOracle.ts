// packages/hardhat/deploy/02_deploy_priceOracle.ts
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, getOrNull } = hre.deployments;

  console.log("\n🧮 Deploying / Reusing PriceOracle...");

  const existing = await getOrNull("PriceOracle");
  if (existing) {
    console.log("ℹ️  Reusing PriceOracle at:", existing.address);
    return;
  }

  const deployment = await deploy("PriceOracle", {
    from: deployer,
    args: [deployer], // constructor(address initialOwner)
    log: true,
    autoMine: true,
  });

  console.log("✅ PriceOracle deployed at:", deployment.address);
};

export default func;
func.tags = ["PriceOracle"];
