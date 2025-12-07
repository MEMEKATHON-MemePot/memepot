// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IStakingManager {
    struct StakingInfo {
        uint256 id;
        string name;
        string token; // symbol
        uint256 apr;
        address tokenContract;
        uint256 totalDeposits;
        string chain;
        uint256 volume24h;
        uint8 decimals;
        bool isNative;
    }

    function getSupportedTokens() external view returns (address[] memory);

    function getUserStakingBalance(address user, address token) external view returns (uint256);

    function getUserDepositTime(address user, address token) external view returns (uint256);

    function getStakingPoolInfo(address token) external view returns (StakingInfo memory);
}

interface IEventPoolManager {
    struct EventPool {
        uint256 id;
        uint256 poolNum;
        address rewardToken;
        uint256 totalPrize;
        uint8 frequency;
        uint256 nextDrawAt;
        uint256 participants;
        uint256 totalPoints;
        uint8 status;
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

    function getEventPoolDetail(
        uint256 poolId,
        address user
    ) external view returns (EventPool memory pool, UserPoolInfo memory userInfo);

    function getUserEventWins(address user) external view returns (UserEventWin[] memory wins);

    function eventPoolIds(uint256 index) external view returns (uint256);

    function eventPoolIdsLength() external view returns (uint256);

    function userTotalPoints(address user) external view returns (uint256);
}

interface IRewardsManagerView {
    function getPendingStakingRewards(address user) external view returns (uint256);

    function getPendingEventPrizes(address user) external view returns (uint256);

    function getPendingTotals(
        address user
    ) external view returns (uint256 stakingAmount, uint256 eventAmount, uint256 total);

    function claimAll() external; // ← 여기 추가
}

/**
 * @title UserDashboard
 * @notice Aggregates user staking + event pool + rewards info for frontend dashboard
 */
contract UserDashboard {
    IStakingManager public stakingManager;
    IEventPoolManager public eventPoolManager;
    IRewardsManagerView public rewardsManager;

    event UserClaimedAll(address indexed user, uint256 stakingAmount, uint256 eventAmount);

    struct MyStakingOnchain {
        uint256 stakingPoolId;
        string poolName;
        string tokenSymbol;
        address tokenAddress;
        uint256 stakedAmount;
        uint256 apr; // same as StakingInfo.apr
        uint256 earned; // 현재까진 0
        uint64 stakedAt;
        uint64 lastClaimAt; // 지금은 depositTime과 동일하게 둠
    }

    struct EventPoolWinOnchain {
        uint256 eventPoolId;
        string eventPoolName;
        uint256 poolNum;
        uint256 rank;
        uint256 prizeAmount;
        uint64 wonAt;
        uint8 status; // 0 = unclaimed, 1 = claimed
        uint64 claimedAt; // 현재는 0
    }

    struct UnclaimedRewardsOnchain {
        uint256 fixedAprRewards;
        uint256 eventPoolPrizes;
        uint256 totalUnclaimed;
    }

    struct UserInfoOnchain {
        address userWalletAddress;
        uint256 totalTickets; // = userTotalPoints(user)
        MyStakingOnchain[] myStakings;
        UnclaimedRewardsOnchain unclaimedRewards;
        EventPoolWinOnchain[] eventPoolWinHistory;
    }

    constructor(address _stakingManager, address _eventPoolManager, address _rewardsManager) {
        require(_stakingManager != address(0), "UserDashboard: stakingManager zero");
        require(_eventPoolManager != address(0), "UserDashboard: eventPoolManager zero");
        require(_rewardsManager != address(0), "UserDashboard: rewardsManager zero");

        stakingManager = IStakingManager(_stakingManager);
        eventPoolManager = IEventPoolManager(_eventPoolManager);
        rewardsManager = IRewardsManagerView(_rewardsManager);
    }

    function getUserInfo(address user) external view returns (UserInfoOnchain memory ui) {
        ui.userWalletAddress = user;

        // 1) totalTickets
        ui.totalTickets = eventPoolManager.userTotalPoints(user);

        // 2) myStakings
        ui.myStakings = _getUserStakings(user);

        // 3) unclaimedRewards
        (uint256 stakingAmount, uint256 eventAmount, uint256 total) = rewardsManager.getPendingTotals(user);

        ui.unclaimedRewards = UnclaimedRewardsOnchain({
            fixedAprRewards: stakingAmount,
            eventPoolPrizes: eventAmount,
            totalUnclaimed: total
        });

        // 4) eventPoolWinHistory
        ui.eventPoolWinHistory = _getUserWinHistory(user);
    }

    function _getUserStakings(address user) internal view returns (MyStakingOnchain[] memory) {
        address[] memory tokens = stakingManager.getSupportedTokens();
        uint256 len = tokens.length;

        MyStakingOnchain[] memory tmp = new MyStakingOnchain[](len);
        uint256 count = 0;

        for (uint256 i = 0; i < len; i++) {
            address token = tokens[i];
            uint256 balance = stakingManager.getUserStakingBalance(user, token);
            if (balance == 0) continue;

            IStakingManager.StakingInfo memory info = stakingManager.getStakingPoolInfo(token);
            uint256 depositTime = stakingManager.getUserDepositTime(user, token);

            tmp[count] = MyStakingOnchain({
                stakingPoolId: info.id,
                poolName: info.name,
                tokenSymbol: info.token,
                tokenAddress: info.tokenContract,
                stakedAmount: balance,
                apr: info.apr,
                earned: 0,
                stakedAt: uint64(depositTime),
                lastClaimAt: uint64(depositTime)
            });
            count++;
        }

        MyStakingOnchain[] memory result = new MyStakingOnchain[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = tmp[i];
        }
        return result;
    }

    function _getUserWinHistory(address user) internal view returns (EventPoolWinOnchain[] memory) {
        IEventPoolManager.UserEventWin[] memory wins = eventPoolManager.getUserEventWins(user);
        uint256 len = wins.length;

        EventPoolWinOnchain[] memory result = new EventPoolWinOnchain[](len);

        for (uint256 i = 0; i < len; i++) {
            IEventPoolManager.UserEventWin memory w = wins[i];

            uint8 status = w.claimed ? 1 : 0;

            result[i] = EventPoolWinOnchain({
                eventPoolId: w.poolId,
                eventPoolName: "",
                poolNum: w.poolNum,
                rank: w.rank,
                prizeAmount: w.prizeAmount,
                wonAt: uint64(w.wonAt),
                status: status,
                claimedAt: 0
            });
        }

        return result;
    }

    function claimAllFromDashboard() external {
        address user = msg.sender;

        (uint256 stakingBefore, uint256 eventBefore, ) = rewardsManager.getPendingTotals(user);
        require(stakingBefore > 0 || eventBefore > 0, "UserDashboard: nothing to claim");

        rewardsManager.claimAll();

        emit UserClaimedAll(user, stakingBefore, eventBefore);
    }
}
