// packages/hardhat/deploy/03_deploy_eventPoolManager.ts
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer, demoUser, realUser, tester1, tester2, tester3 } = await hre.getNamedAccounts();
  const { deploy, getOrNull } = hre.deployments;
  const { ethers } = hre;

  console.log("\n🎟 Deploying / Reusing EventPoolManager...");

  const existing = await getOrNull("EventPoolManager");
  let eventPoolManagerAddress: string;

  if (existing) {
    console.log("ℹ️  Reusing EventPoolManager at:", existing.address);
    eventPoolManagerAddress = existing.address;
  } else {
    const deployment = await deploy("EventPoolManager", {
      from: deployer,
      args: [deployer], // constructor(initialOwner)
      log: true,
      autoMine: true,
    });
    eventPoolManagerAddress = deployment.address;
    console.log("✅ EventPoolManager deployed at:", eventPoolManagerAddress);
  }

  const EventPoolManager = await ethers.getContractAt("EventPoolManager", eventPoolManagerAddress);

  // 이미 풀들이 세팅되어 있다면 전체 초기화/목데이터 생성은 한 번만 수행
  const nextPoolId: bigint = await EventPoolManager.nextPoolId();
  if (nextPoolId !== 1n) {
    console.log("ℹ️  Event pools already initialized, skipping mock creation & seeding");
    return;
  }

  console.log("\n🧱 Creating mock event pools (one-time)...");

  // 실제 insectarium에 배포된 토큰 주소
  const MEMECORE = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
  const USDT = "0x201fC8Af6FFa65309BaF2b6607ea4ab039661272";
  const NOCMU = "0xe93408d27914d1a9f4298ec86Dbd2A644CeB1cD9";

  const Frequency = {
    Daily: 0,
    Weekly: 1,
    Monthly: 2,
  } as const;

  const PoolStatus = {
    Active: 0,
    Completed: 1,
    Cancelled: 2,
  } as const;

  // 다음 정각 시간 계산 함수
  function getNextDrawTime(frequency: number): number {
    const now = new Date();
    let nextDraw: Date;

    if (frequency === Frequency.Daily) {
      // 1D: 다음 날 00:00
      nextDraw = new Date(now);
      nextDraw.setDate(nextDraw.getDate() + 1);
      nextDraw.setHours(0, 0, 0, 0);
    } else if (frequency === Frequency.Weekly) {
      // 1W: 다음 주 월요일 00:00
      nextDraw = new Date(now);
      const currentDay = nextDraw.getDay(); // 0(일) ~ 6(토)
      // 월요일(1)까지 남은 일수 계산
      // 일요일(0)이면 1일 후 = 월요일
      // 월요일(1)이면 7일 후 = 다음 주 월요일
      // 화요일(2)이면 6일 후, ..., 토요일(6)이면 2일 후
      const daysUntilMonday = currentDay === 0 ? 1 : currentDay === 1 ? 7 : 8 - currentDay;
      nextDraw.setDate(nextDraw.getDate() + daysUntilMonday);
      nextDraw.setHours(0, 0, 0, 0);
    } else {
      // 1M: 다음 달 1일 00:00
      nextDraw = new Date(now);
      nextDraw.setMonth(nextDraw.getMonth() + 1);
      nextDraw.setDate(1);
      nextDraw.setHours(0, 0, 0, 0);
    }

    return Math.floor(nextDraw.getTime() / 1000);
  }

  type PoolConfig = {
    rewardToken: string;
    totalPrize: string;
    rewardDecimals: number;
    frequency: number;
    nextDrawAt: number;
    status: number;
  };

  const poolConfigs: PoolConfig[] = [
    {
      rewardToken: MEMECORE,
      totalPrize: "11500",
      rewardDecimals: 18,
      frequency: Frequency.Daily,
      nextDrawAt: getNextDrawTime(Frequency.Daily),
      status: PoolStatus.Active,
    },
    {
      rewardToken: MEMECORE,
      totalPrize: "23000",
      rewardDecimals: 18,
      frequency: Frequency.Weekly,
      nextDrawAt: getNextDrawTime(Frequency.Weekly),
      status: PoolStatus.Active,
    },
    {
      rewardToken: MEMECORE,
      totalPrize: "34500",
      rewardDecimals: 18,
      frequency: Frequency.Monthly,
      nextDrawAt: getNextDrawTime(Frequency.Monthly),
      status: PoolStatus.Active,
    },
    {
      rewardToken: USDT,
      totalPrize: "11500",
      rewardDecimals: 6,
      frequency: Frequency.Daily,
      nextDrawAt: getNextDrawTime(Frequency.Daily),
      status: PoolStatus.Active,
    },
    {
      rewardToken: USDT,
      totalPrize: "23000",
      rewardDecimals: 6,
      frequency: Frequency.Weekly,
      nextDrawAt: getNextDrawTime(Frequency.Weekly),
      status: PoolStatus.Active,
    },
    {
      rewardToken: NOCMU,
      totalPrize: "160000",
      rewardDecimals: 18,
      frequency: Frequency.Weekly,
      nextDrawAt: getNextDrawTime(Frequency.Weekly),
      status: PoolStatus.Active,
    },
  ];

  // 1) 풀 생성
  for (const cfg of poolConfigs) {
    const totalPrizeRaw = ethers.parseUnits(cfg.totalPrize, cfg.rewardDecimals);

    const tx = await EventPoolManager.createEventPool(
      cfg.rewardToken,
      totalPrizeRaw,
      cfg.frequency,
      cfg.nextDrawAt,
      cfg.status,
    );
    await tx.wait();

    console.log(
      `✅ EventPool created: token=${cfg.rewardToken}, totalPrize=${cfg.totalPrize}, freq=${cfg.frequency}, nextDrawAt=${cfg.nextDrawAt}`,
    );
  }

  // 2) 포인트 세팅
  if (!demoUser) {
    console.log("\n⚠️  demoUser not set in namedAccounts, skip user points seeding");
    return;
  }

  console.log("\n🎯 Seeding demoUser (balance only) & realUser + fake users points (one-time)...");

  // (1) demoUser: 풀 참여는 없고, 잔고만 1,000,000 포인트
  const demoUserBalance = 1_000_000n;
  let tx = await EventPoolManager.setUserTotalPoints(demoUser, demoUserBalance);
  await tx.wait();
  console.log(`✅ demoUser userTotalPoints[${demoUser}] = ${demoUserBalance.toString()}`);

  // (2) realUser에게도 참여 테스트용 잔고를 약간 부여 (원하면 조정 가능)
  const realUserBalance = 100_000n;
  tx = await EventPoolManager.setUserTotalPoints(realUser, realUserBalance);
  await tx.wait();
  console.log(`✅ realUser userTotalPoints[${realUser}] = ${realUserBalance.toString()}`);

  // (3) tester1: 500,000 포인트
  const tester1Balance = 500_000n;
  tx = await EventPoolManager.setUserTotalPoints(tester1, tester1Balance);
  await tx.wait();
  console.log(`✅ tester1 userTotalPoints[${tester1}] = ${tester1Balance.toString()}`);

  // (4) tester2: 300,000 포인트
  const tester2Balance = 300_000n;
  tx = await EventPoolManager.setUserTotalPoints(tester2, tester2Balance);
  await tx.wait();
  console.log(`✅ tester2 userTotalPoints[${tester2}] = ${tester2Balance.toString()}`);

  // (5) tester3: 300,000 포인트
  const tester3Balance = 600_000n;
  tx = await EventPoolManager.setUserTotalPoints(tester3, tester3Balance);
  await tx.wait();
  console.log(`✅ tester3 userTotalPoints[${tester3}] = ${tester3Balance.toString()}`);

  // 가짜 유저 주소들 (임의)
  const fakeUsers = [
    "0x0000000000000000000000000000000000000010",
    "0x0000000000000000000000000000000000000020",
    "0x0000000000000000000000000000000000000030",
  ];

  // 각 풀의 "전체 포인트" 목표 (끝자리 0)
  const poolTotalPoints: bigint[] = [200_000n, 300_000n, 500_000n, 120_000n, 250_000n, 400_000n];

  // realUser가 각 풀에서 가지는 포인트 (끝자리 0, total보다 작게)
  const realUserPoolPoints: bigint[] = [20_000n, 15_000n, 25_000n, 12_000n, 10_000n, 20_000n];

  for (let i = 0; i < realUserPoolPoints.length; i++) {
    const poolId = i + 1;
    const myPoints = realUserPoolPoints[i];
    const desiredTotal = poolTotalPoints[i];

    // 1) realUser 포인트 세팅
    tx = await EventPoolManager.setUserPointsInPool(poolId, realUser, myPoints);
    await tx.wait();
    console.log(`✅ realUser in pool ${poolId}: ${myPoints.toString()} pts`);

    // 2) 나머지 포인트를 fakeUsers에게 분배
    let remaining = desiredTotal - myPoints;

    for (let j = 0; j < fakeUsers.length && remaining > 0n; j++) {
      const u = fakeUsers[j];

      // 대략 균등 분배, 끝자리는 0으로
      let share = (remaining / BigInt(fakeUsers.length - j) / 10n) * 10n;
      if (share <= 0n) {
        share = remaining;
      }

      tx = await EventPoolManager.setUserPointsInPool(poolId, u, share);
      await tx.wait();
      console.log(`✅ fakeUser ${u} in pool ${poolId}: ${share.toString()} pts`);

      remaining -= share;
    }
  }

  console.log("\n✨ EventPoolManager mock initialization complete (runs only once) ✨\n");
};

export default func;
func.tags = ["EventPoolManager"];
