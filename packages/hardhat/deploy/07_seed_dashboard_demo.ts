// packages/hardhat/deploy/07_seed_dashboard_demo.ts
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer, demoUser, realUser } = await hre.getNamedAccounts();
  const { get } = hre.deployments;
  const { ethers } = hre;

  console.log("\n🌱 Seeding dashboard demo data (FORCED, no new contracts)...");

  // 온체인 데이터의 "주인" 주소 (프론트에서 연결할 지갑)
  const demo = demoUser ?? realUser ?? deployer;
  // 실제 트랜잭션 서명자 (노드가 관리하는 계정)
  const deployerSigner = await ethers.getSigner(deployer);

  // ───────────────────────────────────────────────
  // 0. 기존 컨트랙트 핸들러 + wiring 재설정
  // ───────────────────────────────────────────────
  const epmDep = await get("EventPoolManager");
  const rmDep = await get("RewardsManager");
  const smDep = await get("StakingManager");

  const EventPoolManager = await ethers.getContractAt("EventPoolManager", epmDep.address);
  const RewardsManager = await ethers.getContractAt("RewardsManager", rmDep.address);
  const StakingManager = await ethers.getContractAt("StakingManager", smDep.address);

  console.log("Using:");
  console.log("  demo user       :", demo);
  console.log("  deployer signer :", deployer);
  console.log("  EventPoolManager:", epmDep.address);
  console.log("  RewardsManager  :", rmDep.address);
  console.log("  StakingManager  :", smDep.address);

  // RewardsManager 와 StakingManager / EventPoolManager 를 강제로 다시 연결
  await (await StakingManager.connect(deployerSigner).setRewardsManager(rmDep.address)).wait();
  await (await EventPoolManager.connect(deployerSigner).setRewardsManager(rmDep.address)).wait();
  console.log("✅ Re-wired RewardsManager for StakingManager & EventPoolManager");

  // ───────────────────────────────────────────────
  // 1. Staking 데모 시드 (최대 2개 풀, 기존 예치 있어도 추가 예치)
  // ───────────────────────────────────────────────
  console.log("\n🏦 Seeding staking positions (forced)...");

  const supportedTokens: string[] = await StakingManager.getSupportedTokens();
  if (supportedTokens.length === 0) {
    console.log("⚠️  No supported staking tokens found, skipping staking seed.");
  } else {
    const maxPools = Math.min(2, supportedTokens.length);

    for (let i = 0; i < maxPools; i++) {
      const tokenAddr = supportedTokens[i];

      // 6 decimals 기준 5,000 단위 예치 (USDT/USDC 가정)
      const amount = ethers.parseUnits("5000", 6);

      const erc20 = await ethers.getContractAt("MockERC20", tokenAddr);

      console.log(`→ Mint 5,000 into staking token[${i}] (${tokenAddr}) for demo=${demo}`);

      // from: deployerSigner, to: demo
      await (await erc20.connect(deployerSigner).mint(demo, amount)).wait();

      console.log(`✅ Token minted for demo: token=${tokenAddr}, amount=${amount.toString()}`);
      // 실제 deposit 까지 스크립트에서 강제로 넣고 싶다면,
      // demo 지갑으로 deposit 을 쏴야 해서 (msg.sender=demo가 되어야 해서)
      // 여기서는 잔고만 시드하고, 예치는 실제 UI에서 하도록 둔다.
    }
  }

  // ───────────────────────────────────────────────
  // 2. EventPool 포인트 & 참여 시드 (덮어쓰기)
  // ───────────────────────────────────────────────
  console.log("\n🎟 Seeding EventPool points & participations (forced)...");

  const poolIds = [1, 2, 3];
  const poolTotalPoints: bigint[] = [200_000n, 300_000n, 500_000n];
  const userPoolPoints: bigint[] = [20_000n, 15_000n, 25_000n];

  const fakeUsers = [
    "0x0000000000000000000000000000000000000010",
    "0x0000000000000000000000000000000000000020",
    "0x0000000000000000000000000000000000000030",
  ];

  let demoTotalPoints = 0n;

  for (let i = 0; i < poolIds.length; i++) {
    const poolId = poolIds[i];
    const myPoints = userPoolPoints[i];
    const desiredTotal = poolTotalPoints[i];

    // demoUser 포인트 강제 세팅 (from deployer)
    await (await EventPoolManager.connect(deployerSigner).setUserPointsInPool(poolId, demo, myPoints)).wait();
    console.log(`✅ pool ${poolId}: demoUser points = ${myPoints.toString()}`);

    // fakeUsers 분배 (덮어쓰기)
    let remaining = desiredTotal - myPoints;
    for (let j = 0; j < fakeUsers.length && remaining > 0n; j++) {
      const u = fakeUsers[j];

      let share = (remaining / BigInt(fakeUsers.length - j) / 10n) * 10n;
      if (share <= 0n) share = remaining;

      await (await EventPoolManager.connect(deployerSigner).setUserPointsInPool(poolId, u, share)).wait();
      console.log(`   → fakeUser ${u} in pool ${poolId}: ${share.toString()} pts`);

      remaining -= share;
    }

    demoTotalPoints += myPoints;
  }

  await (await EventPoolManager.connect(deployerSigner).setUserTotalPoints(demo, demoTotalPoints)).wait();
  console.log(`✅ demoUser totalTickets = ${demoTotalPoints.toString()}`);

  // ───────────────────────────────────────────────
  // 3. EventPool 당첨 + RewardsManager 크레딧 시드 (덮어쓰기)
  // ───────────────────────────────────────────────
  console.log("\n🏆 Seeding EventPool wins + RewardsManager credits (forced)...");

  // poolId 1: demoUser 1등 100 MEME
  const prize1 = ethers.parseEther("100");
  await (await EventPoolManager.connect(deployerSigner).rewardWinners(1, [demo], [prize1])).wait();
  console.log(`✅ rewardWinners(poolId=1): winner=${demo}, amount=${prize1.toString()}`);

  // poolId 2: fakeUser 1등 150 MEME, demoUser 2등 50 MEME
  const prize2Demo = ethers.parseEther("50");
  const prize2Other = ethers.parseEther("150");
  await (
    await EventPoolManager.connect(deployerSigner).rewardWinners(2, [fakeUsers[0], demo], [prize2Other, prize2Demo])
  ).wait();
  console.log(
    `✅ rewardWinners(poolId=2): winner1=${fakeUsers[0]}, winner2=${demo}, amounts=[${prize2Other.toString()}, ${prize2Demo.toString()}]`,
  );

  // ───────────────────────────────────────────────
  // 4. 미수령 리워드 합계 확인
  // ───────────────────────────────────────────────
  const [stakingAmt, eventAmt, total] = await RewardsManager.getPendingTotals(demo);
  console.log(
    `\n🔍 Pending totals for demoUser (staking, event, total):`,
    stakingAmt.toString(),
    eventAmt.toString(),
    total.toString(),
  );

  console.log("\n✨ Dashboard demo seeding complete (FORCED) ✨\n");
};

export default func;
func.tags = ["SeedDashboardDemo"];
