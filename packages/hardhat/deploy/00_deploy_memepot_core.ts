import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployMemePot: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, getOrNull } = hre.deployments;
  const { ethers } = hre;

  console.log("Deploying MemePot contracts with account:", deployer);

  // 0. 기존 배포 조회 (있으면 재사용)
  const existingUSDT = await getOrNull("USDT");
  const existingUSDC = await getOrNull("USDC");
  const existingStakingManager = await getOrNull("StakingManager");

  const NATIVE_TOKEN = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
  const deployedTokens: { [symbol: string]: { address: string } } = {};

  // 1. USDT, USDC 배포 or 재사용
  console.log("\n📝 Deploying / Reusing Mock Tokens...");

  if (existingUSDT) {
    deployedTokens["USDT"] = { address: existingUSDT.address };
    console.log(`ℹ️  Reusing USDT at: ${existingUSDT.address}`);
  } else {
    const usdt = await deploy("USDT", {
      contract: "MockERC20",
      from: deployer,
      args: ["USDT", "USDT", 6],
      log: true,
      autoMine: true,
    });
    deployedTokens["USDT"] = { address: usdt.address };
    console.log(`✅ USDT deployed at: ${usdt.address}`);
  }

  if (existingUSDC) {
    deployedTokens["USDC"] = { address: existingUSDC.address };
    console.log(`ℹ️  Reusing USDC at: ${existingUSDC.address}`);
  } else {
    const usdc = await deploy("USDC", {
      contract: "MockERC20",
      from: deployer,
      args: ["USDC", "USDC", 6],
      log: true,
      autoMine: true,
    });
    deployedTokens["USDC"] = { address: usdc.address };
    console.log(`✅ USDC deployed at: ${usdc.address}`);
  }

  // 2. StakingManager 배포 or 재사용
  console.log("\n🏦 Deploying / Reusing StakingManager...");
  let stakingManagerAddress: string;

  if (existingStakingManager) {
    stakingManagerAddress = existingStakingManager.address;
    console.log("ℹ️  Reusing StakingManager at:", stakingManagerAddress);
  } else {
    const stakingManager = await deploy("StakingManager", {
      from: deployer,
      args: [],
      log: true,
      autoMine: true,
    });
    stakingManagerAddress = stakingManager.address;
    console.log("✅ StakingManager deployed at:", stakingManagerAddress);
  }

  const StakingManager = await ethers.getContractAt("StakingManager", stakingManagerAddress);

  // 3. 풀 생성 (이미 있는 풀은 완전 패스: mock 값도 안 건드림)
  console.log("\n🏦 Creating Staking Pools (skip existing)...");

  const poolConfigs = [
    {
      id: 1,
      name: "USDT",
      symbol: "USDT",
      tokenContract: deployedTokens["USDT"].address,
      apr: 1,
      totalDeposits: "3200000",
      chain: "Memecore",
      volume24h: "390123",
      decimals: 6,
      isNative: false,
    },
    {
      id: 2,
      name: "USDC",
      symbol: "USDC",
      tokenContract: deployedTokens["USDC"].address,
      apr: 1,
      totalDeposits: "8890000",
      chain: "Memecore",
      volume24h: "267890",
      decimals: 6,
      isNative: false,
    },
    {
      id: 3,
      name: "MEMECORE",
      symbol: "M",
      tokenContract: NATIVE_TOKEN,
      apr: 2,
      totalDeposits: "5120000",
      chain: "Memecore",
      volume24h: "234567",
      decimals: 18,
      isNative: true,
    },
  ];

  for (const cfg of poolConfigs) {
    console.log(`\n📝 Processing ${cfg.symbol} Staking Pool...`);

    const existingVault = await StakingManager.vaults(cfg.tokenContract);
    const exists = existingVault.tokenContract !== ethers.ZeroAddress;

    if (exists) {
      console.log(`ℹ️  Staking pool already exists for ${cfg.symbol}, skipping everything`);
      continue;
    }

    const tx = await StakingManager.createStakingPool(
      cfg.id,
      cfg.name,
      cfg.symbol,
      cfg.tokenContract,
      cfg.apr,
      cfg.chain,
      cfg.decimals,
      cfg.isNative,
    );
    await tx.wait();
    console.log(`✅ Staking pool created for ${cfg.symbol} (APR: ${cfg.apr})`);

    const apr = cfg.apr;
    const totalDepositsRaw = ethers.parseUnits(cfg.totalDeposits, cfg.decimals);
    const volume24hRaw = ethers.parseUnits(cfg.volume24h, cfg.decimals);

    await (await StakingManager.updateStakingPoolAPR(cfg.tokenContract, apr)).wait();
    await (await StakingManager.updateStakingPoolTotalDeposits(cfg.tokenContract, totalDepositsRaw)).wait();
    await (await StakingManager.updateStakingPoolVolume(cfg.tokenContract, volume24hRaw)).wait();

    console.log(`   → Forced APR: ${apr}`);
    console.log(`   → Forced totalDeposits: $${cfg.totalDeposits} (${totalDepositsRaw.toString()} raw)`);
    console.log(`   → Forced volume24h: $${cfg.volume24h} (${volume24hRaw.toString()} raw)`);
  }

  console.log("\n✨ MemePot Core Deployment Complete (MockERC20 + StakingManager + Mock Stats) ✨\n");
  console.log("📋 Contract Addresses:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Tokens:");
  for (const symbol of Object.keys(deployedTokens)) {
    console.log(`  ${symbol.padEnd(8)}: ${deployedTokens[symbol].address}`);
  }
  console.log("\nCore Contracts:");
  console.log(`  StakingManager:    ${stakingManagerAddress}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
};

export default deployMemePot;
deployMemePot.tags = ["MemePot"];
