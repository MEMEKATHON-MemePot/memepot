// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract EventPoolManager is Ownable {
    // 풀 상태: 0=active, 1=completed, 2=cancelled
    enum PoolStatus {
        Active,
        Completed,
        Cancelled
    }

    // 빈도: 0=1D, 1=1W, 2=1M
    enum Frequency {
        Daily,
        Weekly,
        Monthly
    }

    struct EventPool {
        uint256 id;
        uint256 poolNum;
        address rewardToken;
        uint256 totalPrize;
        Frequency frequency;
        uint256 nextDrawAt;
        uint256 participants;
        uint256 totalPoints;
        PoolStatus status;
    }

    struct UserPoolInfo {
        uint256 userPoints;
        uint256 totalPoints;
        uint256 winRateBps;
        uint256 userTotalPoints;
    }

    // poolId -> EventPool
    mapping(uint256 => EventPool) public eventPools;
    // 전체 poolId 리스트
    uint256[] public eventPoolIds;

    // poolId -> user -> 이 풀에 사용한 포인트
    mapping(uint256 => mapping(address => uint256)) public userPointsInPool;

    // 시스템 전체 포인트 (예: 스테이킹에서 적립된 누적 포인트)
    mapping(address => uint256) public userTotalPoints;

    uint256 public nextPoolId = 1; // 프론트 id와 대응 (문자열이지만 여기선 숫자)
    uint256 public nextPoolNum = 1; // 프론트 poolNum

    constructor(address initialOwner) Ownable(initialOwner) {}

    // =========================
    //       POOL CREATION
    // =========================

    /**
     * @notice 이벤트 풀 생성
     * @param rewardToken tokenAddress
     * @param totalPrize  totalPrize (콤마 제거 후, decimals 포함 값)
     * @param frequency   0=1D,1=1W,2=1M
     * @param nextDrawAt  nextDraw (timestamp)
     * @param status      0=active,1=completed,2=cancelled
     */
    function createEventPool(
        address rewardToken,
        uint256 totalPrize,
        Frequency frequency,
        uint256 nextDrawAt,
        PoolStatus status
    ) external onlyOwner returns (uint256 poolId) {
        require(nextDrawAt > block.timestamp, "nextDrawAt must be in future");

        poolId = nextPoolId++;

        EventPool storage p = eventPools[poolId];
        p.id = poolId;
        p.poolNum = nextPoolNum++;
        p.rewardToken = rewardToken;
        p.totalPrize = totalPrize;
        p.frequency = frequency;
        p.nextDrawAt = nextDrawAt;
        p.status = status;

        eventPoolIds.push(poolId);
    }

    // =========================
    //        VIEW FUNCS
    // =========================

    /**
     * @notice 모든 이벤트 풀 리스트 조회
     * 프론트 EventPool 리스트와 1:1 매핑 가능
     */
    function getAllEventPools() external view returns (EventPool[] memory pools) {
        uint256 len = eventPoolIds.length;
        pools = new EventPool[](len);
        for (uint256 i = 0; i < len; i++) {
            pools[i] = eventPools[eventPoolIds[i]];
        }
    }

    /**
     * @notice 특정 풀 + 유저 상세 정보 조회
     * 프론트에서 eventPoolDetail + 유저 정보에 사용
     */
    function getEventPoolDetail(
        uint256 poolId,
        address user
    ) external view returns (EventPool memory pool, UserPoolInfo memory userInfo) {
        pool = eventPools[poolId];
        require(pool.id != 0, "Pool not found");

        uint256 userPts = userPointsInPool[poolId][user];
        uint256 totalPts = pool.totalPoints;
        uint256 totalUserPts = userTotalPoints[user];

        uint256 winBps = 0;
        if (userPts > 0 && totalPts > 0) {
            winBps = (userPts * 1e4) / totalPts; // 10000 = 100%
        }

        userInfo = UserPoolInfo({
            userPoints: userPts,
            totalPoints: totalPts,
            winRateBps: winBps,
            userTotalPoints: totalUserPts
        });
    }

    // =========================
    //   DEMO / POINTS SETTERS
    // =========================

    /**
     * @notice 데모용: 특정 유저의 시스템 전체 포인트를 강제로 세팅
     * 프론트에서 "유저가 총 획득한 포인트 수"를 보여줄 때 사용
     */
    function setUserTotalPoints(address user, uint256 points) external onlyOwner {
        userTotalPoints[user] = points;
    }

    /**
     * @notice 데모용: 특정 풀에 유저 포인트/참여 기록을 강제로 세팅
     *  - participants, totalPoints도 함께 갱신
     * @dev 배포 스크립트에서 네 지갑 기준 초기 포인트 세팅에 사용
     */
    function setUserPointsInPool(uint256 poolId, address user, uint256 points) external onlyOwner {
        EventPool storage pool = eventPools[poolId];
        require(pool.id != 0, "Pool not found");

        uint256 prevPoints = userPointsInPool[poolId][user];

        // participants 카운트 (v1에서 감소는 생략 가능)
        if (prevPoints == 0 && points > 0) {
            pool.participants += 1;
        }

        // totalPoints 보정
        pool.totalPoints = pool.totalPoints - prevPoints + points;
        userPointsInPool[poolId][user] = points;
    }

    /**
     * @notice 데모/관리용: 풀의 status를 변경 (예: active → completed)
     */
    function setPoolStatus(uint256 poolId, PoolStatus status) external onlyOwner {
        EventPool storage pool = eventPools[poolId];
        require(pool.id != 0, "Pool not found");
        pool.status = status;
    }

    // ===== 실제 참여 로직 =====

    /**
     * @notice 이벤트 풀에 포인트를 사용해 참가
     * @param poolId 참여할 풀 ID
     * @param points 이번에 추가로 쓸 포인트 (누적)
     */
    function enterEventPool(uint256 poolId, uint256 points) external {
        require(points > 0, "points must be > 0");

        EventPool storage pool = eventPools[poolId];
        require(pool.id != 0, "Pool not found");
        require(pool.status == PoolStatus.Active, "Pool not active");
        require(block.timestamp < pool.nextDrawAt, "Draw already passed");

        // 유저가 가진 총 포인트 체크
        uint256 available = userTotalPoints[msg.sender];
        require(available >= points, "Not enough points");

        // 총 포인트에서 차감
        userTotalPoints[msg.sender] = available - points;

        // 해당 풀에 누적
        uint256 prevPoints = userPointsInPool[poolId][msg.sender];
        uint256 newPoints = prevPoints + points;

        if (prevPoints == 0) {
            pool.participants += 1;
        }

        userPointsInPool[poolId][msg.sender] = newPoints;
        pool.totalPoints += points;
    }
}
