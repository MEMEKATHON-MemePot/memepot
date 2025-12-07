// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title StakingManager
 * @notice Manages user staking deposits and withdrawals for multiple ERC20 tokens
 * @dev Handles USDT, USDC, MEMECORE staking with deposit/withdrawal functionality
 */
contract StakingManager is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    // Address used to represent native token (e.g. MEME) in mappings
    address public constant NATIVE_TOKEN = address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE);

    // Staking pool information
    struct StakingInfo {
        uint256 id;
        string name;
        string token; // symbol (e.g. "USDT")
        uint256 apr; // for display / off-chain calc
        address tokenContract;
        uint256 totalDeposits;
        string chain;
        uint256 volume24h;
        uint8 decimals;
        bool isNative;
    }

    // User staking information per token
    struct UserDeposit {
        uint128 amount; // staked amount
        uint64 depositTime; // first stake timestamp
    }

    // Token address => StakingInfo
    mapping(address => StakingInfo) public vaults;

    // User address => Token address => UserDeposit
    mapping(address => mapping(address => UserDeposit)) public userDeposits;

    // User address => Token address => pending native withdrawal (if transfer failed)
    mapping(address => mapping(address => uint256)) public pendingWithdrawals;

    // Supported tokens list
    address[] public supportedTokens;

    // External contract addresses
    address public yieldGenerator;
    address public rewardsManager;
    address public pointGenerator;

    // Events
    event StakingPoolCreated(address indexed token, uint256 apr, uint8 decimals);
    event StakingPoolAPRUpdated(address indexed token, uint256 apr);
    event StakingPoolVolumeUpdated(address indexed token, uint256 volume24h);
    event StakingPoolTotalDepositsUpdated(address indexed token, uint256 totalDeposits);

    event Deposited(address indexed user, address indexed token, uint256 amount);
    event DepositedNative(address indexed user, uint256 amount);
    event Unstaked(address indexed user, address indexed token, uint256 amount);
    event UnstakedNative(address indexed user, uint256 amount);
    event WithdrawalPending(address indexed user, address indexed token, uint256 amount);
    event WithdrawalClaimed(address indexed user, address indexed token, uint256 amount);

    event YieldGeneratorUpdated(address indexed oldAddress, address indexed newAddress);
    event RewardsManagerUpdated(address indexed oldAddress, address indexed newAddress);
    event PointGeneratorUpdated(address indexed oldAddress, address indexed newAddress);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
    }

    // ==== Staking Pool Management ====

    /**
     * @notice Create a new staking pool for a token
     */
    function createStakingPool(
        uint256 id,
        string memory name,
        string memory tokenSymbol,
        address tokenContract,
        uint256 apr,
        string memory chain,
        uint8 decimals,
        bool isNative
    ) external onlyRole(OPERATOR_ROLE) {
        require(tokenContract != address(0), "StakingManager: Invalid token");
        require(vaults[tokenContract].tokenContract == address(0), "StakingManager: Pool exists");

        vaults[tokenContract] = StakingInfo({
            id: id,
            name: name,
            token: tokenSymbol,
            tokenContract: tokenContract,
            apr: apr,
            totalDeposits: 0,
            chain: chain,
            volume24h: 0,
            decimals: decimals,
            isNative: isNative
        });

        supportedTokens.push(tokenContract);

        emit StakingPoolCreated(tokenContract, apr, decimals);
    }

    /**
     * @notice Update staking pool APR (for display / off-chain calc)
     */
    function updateStakingPoolAPR(address token, uint256 apr) external onlyRole(OPERATOR_ROLE) {
        require(vaults[token].tokenContract != address(0), "StakingManager: Pool not active");

        vaults[token].apr = apr;

        emit StakingPoolAPRUpdated(token, apr);
    }

    /**
     * @notice Update staking pool 24h volume
     * @dev How you call this depends on your off-chain volume logic
     */
    function updateStakingPoolVolume(address token, uint256 volume) external onlyRole(OPERATOR_ROLE) {
        require(vaults[token].tokenContract != address(0), "StakingManager: Pool not active");

        vaults[token].volume24h = volume;

        emit StakingPoolVolumeUpdated(token, volume);
    }

    /**
     * @notice Force set staking pool totalDeposits (admin/ops/testing use only)
     * @dev Normally totalDeposits is managed by deposit/unstake. Use carefully.
     */
    function updateStakingPoolTotalDeposits(address token, uint256 totalDeposits) external onlyRole(OPERATOR_ROLE) {
        require(vaults[token].tokenContract != address(0), "StakingManager: Pool not active");

        vaults[token].totalDeposits = totalDeposits;

        emit StakingPoolTotalDepositsUpdated(token, totalDeposits);
    }

    // ==== Deposit/Staking ====

    /**
     * @notice Deposit ERC20 tokens for staking
     */
    function deposit(address token, uint256 amount) external nonReentrant whenNotPaused {
        require(vaults[token].tokenContract != address(0), "StakingManager: Pool not active");
        require(amount > 0, "StakingManager: Amount must be > 0");

        UserDeposit storage userDeposit = userDeposits[msg.sender][token];

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        // User deposit record
        if (userDeposit.amount == 0) {
            userDeposit.depositTime = uint64(block.timestamp);
        }
        userDeposit.amount += uint128(amount);

        // Pool aggregates
        vaults[token].totalDeposits += amount;
        vaults[token].volume24h += amount;

        // Send to YieldGenerator if set
        if (yieldGenerator != address(0)) {
            IERC20(token).safeTransfer(yieldGenerator, amount);
        }

        // PointGenerator hook는 이후 구현 (예: 별도 컨트랙트에서 updateUserDeposit 호출)

        emit Deposited(msg.sender, token, amount);
    }

    /**
     * @notice Deposit native tokens (e.g., MEME) for staking
     */
    function depositNative() external payable nonReentrant whenNotPaused {
        require(vaults[NATIVE_TOKEN].tokenContract != address(0), "StakingManager: Native pool not active");
        require(msg.value > 0, "StakingManager: Amount must be > 0");

        UserDeposit storage userDeposit = userDeposits[msg.sender][NATIVE_TOKEN];

        if (userDeposit.amount == 0) {
            userDeposit.depositTime = uint64(block.timestamp);
        }
        userDeposit.amount += uint128(msg.value);

        vaults[NATIVE_TOKEN].totalDeposits += msg.value;
        vaults[NATIVE_TOKEN].volume24h += msg.value;

        if (yieldGenerator != address(0)) {
            (bool success, ) = yieldGenerator.call{ value: msg.value }("");
            require(success, "StakingManager: Send to YieldGenerator failed");
        }

        emit DepositedNative(msg.sender, msg.value);
    }

    // ==== Unstake/Withdrawal ====

    /**
     * @notice Unstake (withdraw) ERC20 tokens by percentage
     */
    function unstake(address token, uint256 percentage) external nonReentrant whenNotPaused {
        require(vaults[token].tokenContract != address(0), "StakingManager: Pool not active");
        require(percentage > 0 && percentage <= 100, "StakingManager: Invalid percentage");

        UserDeposit storage userDeposit = userDeposits[msg.sender][token];
        require(userDeposit.amount > 0, "StakingManager: No deposits");

        uint256 unstakeAmount = (userDeposit.amount * percentage) / 100;
        require(unstakeAmount > 0, "StakingManager: Unstake amount is 0");

        // Update user
        userDeposit.amount -= uint128(unstakeAmount);

        // Update pool
        vaults[token].totalDeposits -= unstakeAmount;

        if (token == NATIVE_TOKEN) {
            (bool success, ) = msg.sender.call{ value: unstakeAmount }("");
            if (!success) {
                pendingWithdrawals[msg.sender][token] += unstakeAmount;
                emit WithdrawalPending(msg.sender, token, unstakeAmount);
            } else {
                emit UnstakedNative(msg.sender, unstakeAmount);
            }
        } else {
            IERC20(token).safeTransfer(msg.sender, unstakeAmount);
            emit Unstaked(msg.sender, token, unstakeAmount);
        }
    }

    /**
     * @notice Claim pending native withdrawal if previous transfer failed
     */
    function claimPendingWithdrawal() external nonReentrant whenNotPaused {
        uint256 pendingAmount = pendingWithdrawals[msg.sender][NATIVE_TOKEN];
        require(pendingAmount > 0, "StakingManager: No pending withdrawal");

        pendingWithdrawals[msg.sender][NATIVE_TOKEN] = 0;

        (bool success, ) = msg.sender.call{ value: pendingAmount }("");
        require(success, "StakingManager: Native transfer failed");

        emit WithdrawalClaimed(msg.sender, NATIVE_TOKEN, pendingAmount);
    }

    // ==== View Functions ====

    function getUserStakingBalance(address user, address token) external view returns (uint256) {
        return userDeposits[user][token].amount;
    }

    function getUserDepositTime(address user, address token) external view returns (uint256) {
        return userDeposits[user][token].depositTime;
    }

    function getStakingPoolInfo(address token) external view returns (StakingInfo memory) {
        return vaults[token];
    }

    function getSupportedTokens() external view returns (address[] memory) {
        return supportedTokens;
    }

    function getAllStakingPoolInfos() external view returns (StakingInfo[] memory) {
        uint256 length = supportedTokens.length;
        StakingInfo[] memory infos = new StakingInfo[](length);

        for (uint256 i = 0; i < length; i++) {
            infos[i] = vaults[supportedTokens[i]];
        }

        return infos;
    }

    // ==== Admin: external contract wiring ====

    function setYieldGenerator(address _yieldGenerator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_yieldGenerator != address(0), "StakingManager: Invalid");
        address old = yieldGenerator;
        yieldGenerator = _yieldGenerator;
        emit YieldGeneratorUpdated(old, _yieldGenerator);
    }

    function setRewardsManager(address _rewardsManager) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_rewardsManager != address(0), "StakingManager: Invalid");
        address old = rewardsManager;
        rewardsManager = _rewardsManager;
        emit RewardsManagerUpdated(old, _rewardsManager);
    }

    function setPointGenerator(address _pointGenerator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_pointGenerator != address(0), "StakingManager: Invalid");
        address old = pointGenerator;
        pointGenerator = _pointGenerator;
        emit PointGeneratorUpdated(old, _pointGenerator);
    }

    // ==== Pause ====

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    receive() external payable {}
}
