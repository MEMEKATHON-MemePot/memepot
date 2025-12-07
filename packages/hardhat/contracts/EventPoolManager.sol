// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IRewardsManager {
    function creditEventPrize(address user, uint256 amount) external;
}

contract EventPoolManager is Ownable {
    enum PoolStatus {
        Active,
        Completed,
        Cancelled
    }
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

    struct UserEventWin {
        uint256 poolId;
        uint256 poolNum;
        uint256 rank;
        uint256 prizeAmount;
        uint256 wonAt;
        bool claimed;
    }

    mapping(uint256 => EventPool) public eventPools;
    uint256[] public eventPoolIds;

    mapping(uint256 => mapping(address => uint256)) public userPointsInPool;
    mapping(address => uint256) public userTotalPoints;
    mapping(address => UserEventWin[]) private userWins;

    IRewardsManager public rewardsManager;

    uint256 public nextPoolId = 1;
    uint256 public nextPoolNum = 1;

    event RewardsManagerUpdated(address indexed oldRewardsManager, address indexed newRewardsManager);
    event WinnersRewarded(uint256 indexed poolId, address[] winners, uint256[] prizeAmounts);

    constructor(address initialOwner) Ownable(initialOwner) {}

    // ADMIN WIRING
    function setRewardsManager(address _rewardsManager) external onlyOwner {
        require(_rewardsManager != address(0), "EventPoolManager: invalid");
        address old = address(rewardsManager);
        rewardsManager = IRewardsManager(_rewardsManager);
        emit RewardsManagerUpdated(old, _rewardsManager);
    }

    // POOL CREATION
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

    // VIEW
    function getAllEventPools() external view returns (EventPool[] memory pools) {
        uint256 len = eventPoolIds.length;
        pools = new EventPool[](len);
        for (uint256 i = 0; i < len; i++) {
            pools[i] = eventPools[eventPoolIds[i]];
        }
    }

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
            winBps = (userPts * 1e4) / totalPts;
        }

        userInfo = UserPoolInfo({
            userPoints: userPts,
            totalPoints: totalPts,
            winRateBps: winBps,
            userTotalPoints: totalUserPts
        });
    }

    function getUserEventWins(address user) external view returns (UserEventWin[] memory wins) {
        wins = userWins[user];
    }

    // DEMO / POINTS SETTERS
    function setUserTotalPoints(address user, uint256 points) external onlyOwner {
        userTotalPoints[user] = points;
    }

    function setUserPointsInPool(uint256 poolId, address user, uint256 points) external onlyOwner {
        EventPool storage pool = eventPools[poolId];
        require(pool.id != 0, "Pool not found");

        uint256 prevPoints = userPointsInPool[poolId][user];

        if (prevPoints == 0 && points > 0) {
            pool.participants += 1;
        }

        pool.totalPoints = pool.totalPoints - prevPoints + points;
        userPointsInPool[poolId][user] = points;
    }

    function setPoolStatus(uint256 poolId, PoolStatus status) external onlyOwner {
        EventPool storage pool = eventPools[poolId];
        require(pool.id != 0, "Pool not found");
        pool.status = status;
    }

    // PARTICIPATION
    function enterEventPool(uint256 poolId, uint256 points) external {
        require(points > 0, "points must be > 0");

        EventPool storage pool = eventPools[poolId];
        require(pool.id != 0, "Pool not found");
        require(pool.status == PoolStatus.Active, "Pool not active");
        require(block.timestamp < pool.nextDrawAt, "Draw already passed");

        uint256 available = userTotalPoints[msg.sender];
        require(available >= points, "Not enough points");

        userTotalPoints[msg.sender] = available - points;

        uint256 prevPoints = userPointsInPool[poolId][msg.sender];
        uint256 newPoints = prevPoints + points;

        if (prevPoints == 0) {
            pool.participants += 1;
        }

        userPointsInPool[poolId][msg.sender] = newPoints;
        pool.totalPoints += points;
    }

    // WIN REWARDING HOOK
    function rewardWinners(
        uint256 poolId,
        address[] calldata winners,
        uint256[] calldata prizeAmounts
    ) external onlyOwner {
        require(address(rewardsManager) != address(0), "EventPoolManager: RewardsManager not set");

        EventPool storage pool = eventPools[poolId];
        require(pool.id != 0, "Pool not found");
        require(winners.length == prizeAmounts.length, "EventPoolManager: length mismatch");

        for (uint256 i = 0; i < winners.length; i++) {
            address winner = winners[i];
            uint256 amount = prizeAmounts[i];
            if (winner == address(0) || amount == 0) continue;

            _recordUserWin(poolId, pool.poolNum, winner, amount, i + 1);
            rewardsManager.creditEventPrize(winner, amount);
        }

        emit WinnersRewarded(poolId, winners, prizeAmounts);
    }

    function _recordUserWin(uint256 poolId, uint256 poolNum, address winner, uint256 amount, uint256 rank) internal {
        userWins[winner].push(
            UserEventWin({
                poolId: poolId,
                poolNum: poolNum,
                rank: rank,
                prizeAmount: amount,
                wonAt: block.timestamp,
                claimed: false
            })
        );
    }
}
