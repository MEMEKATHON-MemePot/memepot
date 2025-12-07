import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const deploySwapAndBridge: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("\n📦 Deploying Swap and Bridge contracts...");
  console.log("Deployer:", deployer);

  // Deploy SimpleSwap
  console.log("\n🔄 Deploying SimpleSwap...");
  const simpleSwap = await deploy("SimpleSwap", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
  console.log("✅ SimpleSwap deployed to:", simpleSwap.address);

  // Deploy SimpleBridge
  console.log("\n🌉 Deploying SimpleBridge...");
  const simpleBridge = await deploy("SimpleBridge", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
  console.log("✅ SimpleBridge deployed to:", simpleBridge.address);

  // Get contract instances
  const swapContract = await ethers.getContractAt("SimpleSwap", simpleSwap.address);
  const bridgeContract = await ethers.getContractAt("SimpleBridge", simpleBridge.address);

  // Get token addresses
  const usdtDeployment = await hre.deployments.get("USDT");
  const usdcDeployment = await hre.deployments.get("USDC");

  console.log("\n⚙️  Setting up Swap pools...");

  // Create MEME/USDT pool
  console.log("Creating MEME/USDT pool...");
  const createPool1Tx = await swapContract.createPool(
    ethers.ZeroAddress, // MEME (native token placeholder)
    usdtDeployment.address
  );
  await createPool1Tx.wait();
  console.log("✅ MEME/USDT pool created (Pool ID: 1)");

  // Create MEME/USDC pool
  console.log("Creating MEME/USDC pool...");
  const createPool2Tx = await swapContract.createPool(
    ethers.ZeroAddress, // MEME (native token placeholder)
    usdcDeployment.address
  );
  await createPool2Tx.wait();
  console.log("✅ MEME/USDC pool created (Pool ID: 2)");

  // Create USDT/USDC pool
  console.log("Creating USDT/USDC pool...");
  const createPool3Tx = await swapContract.createPool(usdtDeployment.address, usdcDeployment.address);
  await createPool3Tx.wait();
  console.log("✅ USDT/USDC pool created (Pool ID: 3)");

  console.log("\n⚙️  Setting up Bridge...");

  // Add supported chains
  const supportedChains = [
    { id: 1, name: "Ethereum Mainnet" },
    { id: 137, name: "Polygon" },
    { id: 42161, name: "Arbitrum" },
  ];

  for (const chain of supportedChains) {
    console.log(`Adding support for ${chain.name} (Chain ID: ${chain.id})...`);
    const tx = await bridgeContract.setSupportedChain(chain.id, true);
    await tx.wait();
  }
  console.log("✅ Supported chains configured");

  // Add supported tokens
  const tokens = [
    { address: usdtDeployment.address, symbol: "USDT" },
    { address: usdcDeployment.address, symbol: "USDC" },
  ];

  for (const token of tokens) {
    for (const chain of supportedChains) {
      console.log(`Adding ${token.symbol} support for ${chain.name}...`);
      const tx = await bridgeContract.setSupportedToken(token.address, chain.id, true);
      await tx.wait();
    }
  }
  console.log("✅ Supported tokens configured");

  console.log("\n✅ Swap and Bridge deployment completed!");
  console.log("\n📋 Deployment Summary:");
  console.log("  SimpleSwap:", simpleSwap.address);
  console.log("  SimpleBridge:", simpleBridge.address);
  console.log("  Swap Pools: 3 (MEME/USDT, MEME/USDC, USDT/USDC)");
  console.log("  Supported Chains: 4 (Memecore, Ethereum, Polygon, Arbitrum)");
  console.log("  Supported Tokens: USDT, USDC");
};

export default deploySwapAndBridge;

deploySwapAndBridge.tags = ["SimpleSwap", "SimpleBridge", "SwapBridge"];
deploySwapAndBridge.dependencies = ["USDT", "USDC"];
