// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title RewardsManager
 * @notice Aggregates and manages claimable rewards for users:
 *         - Staking fixed APR rewards
 *         - Event pool prize rewards
 * @dev 이 버전은 "네이티브 토큰" (예: MEME, ETH)으로만 보상을 지급하는 기본 골격이다.
 */
contract RewardsManager {
    /// @notice 관리자 (보통 deployer 또는 멀티시그)
    address public admin;

    /// @notice StakingManager 컨트랙트 주소 (보상 크레딧 권한)
    address public stakingManager;

    /// @notice EventPoolManager 컨트랙트 주소 (보상 크레딧 권한)
    address public eventPoolManager;

    /// @notice 유저별 스테이킹 보상 (네이티브 토큰 기준, wei 단위)
    mapping(address => uint256) public pendingStakingRewards;

    /// @notice 유저별 이벤트 상금 (네이티브 토큰 기준, wei 단위)
    mapping(address => uint256) public pendingEventPrizes;

    /// @notice 이벤트: 관리자/매니저 업데이트
    event AdminUpdated(address indexed oldAdmin, address indexed newAdmin);
    event StakingManagerUpdated(address indexed oldStakingManager, address indexed newStakingManager);
    event EventPoolManagerUpdated(address indexed oldEventPoolManager, address indexed newEventPoolManager);

    /// @notice 이벤트: 보상 크레딧
    event StakingRewardCredited(address indexed user, uint256 amount);
    event EventPrizeCredited(address indexed user, uint256 amount);

    /// @notice 이벤트: 보상 클레임
    event StakingRewardsClaimed(address indexed user, uint256 amount);
    event EventPrizesClaimed(address indexed user, uint256 amount);

    /// @notice 이벤트: fallback/receive로 자금 수신
    event FundsReceived(address indexed from, uint256 amount);

    modifier onlyAdmin() {
        require(msg.sender == admin, "RewardsManager: not admin");
        _;
    }

    modifier onlyStakingManager() {
        require(msg.sender == stakingManager, "RewardsManager: not staking manager");
        _;
    }

    modifier onlyEventPoolManager() {
        require(msg.sender == eventPoolManager, "RewardsManager: not event pool manager");
        _;
    }

    constructor(address _admin) {
        require(_admin != address(0), "RewardsManager: admin zero");
        admin = _admin;
    }

    // ========= Admin wiring =========

    function setAdmin(address _admin) external onlyAdmin {
        require(_admin != address(0), "RewardsManager: admin zero");
        address old = admin;
        admin = _admin;
        emit AdminUpdated(old, _admin);
    }

    function setStakingManager(address _stakingManager) external onlyAdmin {
        require(_stakingManager != address(0), "RewardsManager: zero");
        address old = stakingManager;
        stakingManager = _stakingManager;
        emit StakingManagerUpdated(old, _stakingManager);
    }

    function setEventPoolManager(address _eventPoolManager) external onlyAdmin {
        require(_eventPoolManager != address(0), "RewardsManager: zero");
        address old = eventPoolManager;
        eventPoolManager = _eventPoolManager;
        emit EventPoolManagerUpdated(old, _eventPoolManager);
    }

    // ========= Credit functions (called by managers) =========

    /**
     * @notice StakingManager에서 호출: 유저에게 스테이킹 보상을 크레딧
     */
    function creditStakingReward(address user, uint256 amount) external onlyStakingManager {
        require(user != address(0), "RewardsManager: user zero");
        require(amount > 0, "RewardsManager: amount zero");
        pendingStakingRewards[user] += amount;
        emit StakingRewardCredited(user, amount);
    }

    /**
     * @notice EventPoolManager에서 호출: 유저에게 이벤트 상금을 크레딧
     */
    function creditEventPrize(address user, uint256 amount) external onlyEventPoolManager {
        require(user != address(0), "RewardsManager: user zero");
        require(amount > 0, "RewardsManager: amount zero");
        pendingEventPrizes[user] += amount;
        emit EventPrizeCredited(user, amount);
    }

    // ========= View helpers =========

    function getPendingStakingRewards(address user) external view returns (uint256) {
        return pendingStakingRewards[user];
    }

    function getPendingEventPrizes(address user) external view returns (uint256) {
        return pendingEventPrizes[user];
    }

    function getPendingTotals(
        address user
    ) external view returns (uint256 stakingAmount, uint256 eventAmount, uint256 total) {
        stakingAmount = pendingStakingRewards[user];
        eventAmount = pendingEventPrizes[user];
        total = stakingAmount + eventAmount;
    }

    // ========= Claim functions (called by user) =========

    function claimStakingRewards() external {
        address user = msg.sender;
        uint256 amount = pendingStakingRewards[user];
        require(amount > 0, "RewardsManager: no staking rewards");

        pendingStakingRewards[user] = 0;

        (bool success, ) = user.call{ value: amount }("");
        require(success, "RewardsManager: native transfer failed");

        emit StakingRewardsClaimed(user, amount);
    }

    function claimEventPrizes() external {
        address user = msg.sender;
        uint256 amount = pendingEventPrizes[user];
        require(amount > 0, "RewardsManager: no event prizes");

        pendingEventPrizes[user] = 0;

        (bool success, ) = user.call{ value: amount }("");
        require(success, "RewardsManager: native transfer failed");

        emit EventPrizesClaimed(user, amount);
    }

    function claimAll() external {
        address user = msg.sender;

        uint256 stakingAmount = pendingStakingRewards[user];
        uint256 eventAmount = pendingEventPrizes[user];
        require(stakingAmount > 0 || eventAmount > 0, "RewardsManager: nothing to claim");

        pendingStakingRewards[user] = 0;
        pendingEventPrizes[user] = 0;

        uint256 total = stakingAmount + eventAmount;

        (bool success, ) = user.call{ value: total }("");
        require(success, "RewardsManager: native transfer failed");

        if (stakingAmount > 0) {
            emit StakingRewardsClaimed(user, stakingAmount);
        }
        if (eventAmount > 0) {
            emit EventPrizesClaimed(user, eventAmount);
        }
    }

    // ========= Funding =========

    receive() external payable {
        emit FundsReceived(msg.sender, msg.value);
    }

    fallback() external payable {
        if (msg.value > 0) {
            emit FundsReceived(msg.sender, msg.value);
        }
    }

    function rescueNative(address to, uint256 amount) external onlyAdmin {
        require(to != address(0), "RewardsManager: zero");
        (bool success, ) = to.call{ value: amount }("");
        require(success, "RewardsManager: rescue failed");
    }
}
