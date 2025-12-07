// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SimpleSwap
 * @notice Simple AMM (Automated Market Maker) for token swaps
 * @dev Constant product formula: x * y = k
 */
contract SimpleSwap is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    struct Pool {
        address tokenA;
        address tokenB;
        uint256 reserveA;
        uint256 reserveB;
        uint256 totalLiquidity;
        bool isActive;
    }

    // Pool ID counter
    uint256 public poolCounter;

    // Mapping: poolId => Pool
    mapping(uint256 => Pool) public pools;

    // Mapping: poolId => user => liquidity amount
    mapping(uint256 => mapping(address => uint256)) public userLiquidity;

    // Fee percentage (basis points, e.g., 30 = 0.3%)
    uint256 public swapFee = 30;

    // Events
    event PoolCreated(uint256 indexed poolId, address tokenA, address tokenB);
    event LiquidityAdded(uint256 indexed poolId, address indexed provider, uint256 amountA, uint256 amountB, uint256 liquidity);
    event LiquidityRemoved(uint256 indexed poolId, address indexed provider, uint256 amountA, uint256 amountB, uint256 liquidity);
    event Swapped(
        uint256 indexed poolId,
        address indexed user,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );
    event SwapFeeUpdated(uint256 oldFee, uint256 newFee);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
    }

    /**
     * @notice Create a new liquidity pool
     * @param tokenA First token address
     * @param tokenB Second token address
     */
    function createPool(address tokenA, address tokenB) external onlyRole(OPERATOR_ROLE) returns (uint256 poolId) {
        require(tokenA != address(0) && tokenB != address(0), "SimpleSwap: Invalid token address");
        require(tokenA != tokenB, "SimpleSwap: Tokens must be different");

        poolId = ++poolCounter;
        pools[poolId] = Pool({
            tokenA: tokenA,
            tokenB: tokenB,
            reserveA: 0,
            reserveB: 0,
            totalLiquidity: 0,
            isActive: true
        });

        emit PoolCreated(poolId, tokenA, tokenB);
    }

    /**
     * @notice Add liquidity to a pool
     * @param poolId Pool ID
     * @param amountA Amount of token A
     * @param amountB Amount of token B
     */
    function addLiquidity(
        uint256 poolId,
        uint256 amountA,
        uint256 amountB
    ) external nonReentrant returns (uint256 liquidity) {
        Pool storage pool = pools[poolId];
        require(pool.isActive, "SimpleSwap: Pool not active");
        require(amountA > 0 && amountB > 0, "SimpleSwap: Invalid amounts");

        IERC20(pool.tokenA).safeTransferFrom(msg.sender, address(this), amountA);
        IERC20(pool.tokenB).safeTransferFrom(msg.sender, address(this), amountB);

        if (pool.totalLiquidity == 0) {
            // Initial liquidity
            liquidity = sqrt(amountA * amountB);
        } else {
            // Proportional liquidity
            uint256 liquidityA = (amountA * pool.totalLiquidity) / pool.reserveA;
            uint256 liquidityB = (amountB * pool.totalLiquidity) / pool.reserveB;
            liquidity = liquidityA < liquidityB ? liquidityA : liquidityB;
        }

        require(liquidity > 0, "SimpleSwap: Insufficient liquidity minted");

        pool.reserveA += amountA;
        pool.reserveB += amountB;
        pool.totalLiquidity += liquidity;
        userLiquidity[poolId][msg.sender] += liquidity;

        emit LiquidityAdded(poolId, msg.sender, amountA, amountB, liquidity);
    }

    /**
     * @notice Remove liquidity from a pool
     * @param poolId Pool ID
     * @param liquidity Amount of liquidity tokens to burn
     */
    function removeLiquidity(uint256 poolId, uint256 liquidity) external nonReentrant returns (uint256 amountA, uint256 amountB) {
        Pool storage pool = pools[poolId];
        require(pool.isActive, "SimpleSwap: Pool not active");
        require(liquidity > 0, "SimpleSwap: Invalid liquidity");
        require(userLiquidity[poolId][msg.sender] >= liquidity, "SimpleSwap: Insufficient liquidity");

        amountA = (liquidity * pool.reserveA) / pool.totalLiquidity;
        amountB = (liquidity * pool.reserveB) / pool.totalLiquidity;

        require(amountA > 0 && amountB > 0, "SimpleSwap: Insufficient output");

        userLiquidity[poolId][msg.sender] -= liquidity;
        pool.totalLiquidity -= liquidity;
        pool.reserveA -= amountA;
        pool.reserveB -= amountB;

        IERC20(pool.tokenA).safeTransfer(msg.sender, amountA);
        IERC20(pool.tokenB).safeTransfer(msg.sender, amountB);

        emit LiquidityRemoved(poolId, msg.sender, amountA, amountB, liquidity);
    }

    /**
     * @notice Swap tokens
     * @param poolId Pool ID
     * @param tokenIn Input token address
     * @param amountIn Amount of input tokens
     * @param minAmountOut Minimum amount of output tokens (slippage protection)
     */
    function swap(
        uint256 poolId,
        address tokenIn,
        uint256 amountIn,
        uint256 minAmountOut
    ) external nonReentrant returns (uint256 amountOut) {
        Pool storage pool = pools[poolId];
        require(pool.isActive, "SimpleSwap: Pool not active");
        require(amountIn > 0, "SimpleSwap: Invalid amount");

        bool isTokenA = tokenIn == pool.tokenA;
        require(isTokenA || tokenIn == pool.tokenB, "SimpleSwap: Invalid token");

        // Calculate output amount using constant product formula
        (uint256 reserveIn, uint256 reserveOut, address tokenOut) = isTokenA
            ? (pool.reserveA, pool.reserveB, pool.tokenB)
            : (pool.reserveB, pool.reserveA, pool.tokenA);

        // Apply fee: amountInWithFee = amountIn * (10000 - fee) / 10000
        uint256 amountInWithFee = (amountIn * (10000 - swapFee)) / 10000;

        // x * y = k formula
        amountOut = (amountInWithFee * reserveOut) / (reserveIn + amountInWithFee);

        require(amountOut >= minAmountOut, "SimpleSwap: Insufficient output amount");
        require(amountOut > 0, "SimpleSwap: Insufficient liquidity");

        // Transfer tokens
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
        IERC20(tokenOut).safeTransfer(msg.sender, amountOut);

        // Update reserves
        if (isTokenA) {
            pool.reserveA += amountIn;
            pool.reserveB -= amountOut;
        } else {
            pool.reserveB += amountIn;
            pool.reserveA -= amountOut;
        }

        emit Swapped(poolId, msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }

    /**
     * @notice Get quote for swap
     * @param poolId Pool ID
     * @param tokenIn Input token
     * @param amountIn Input amount
     * @return amountOut Output amount
     */
    function getAmountOut(
        uint256 poolId,
        address tokenIn,
        uint256 amountIn
    ) external view returns (uint256 amountOut) {
        Pool memory pool = pools[poolId];
        require(pool.isActive, "SimpleSwap: Pool not active");

        bool isTokenA = tokenIn == pool.tokenA;
        require(isTokenA || tokenIn == pool.tokenB, "SimpleSwap: Invalid token");

        (uint256 reserveIn, uint256 reserveOut) = isTokenA
            ? (pool.reserveA, pool.reserveB)
            : (pool.reserveB, pool.reserveA);

        uint256 amountInWithFee = (amountIn * (10000 - swapFee)) / 10000;
        amountOut = (amountInWithFee * reserveOut) / (reserveIn + amountInWithFee);
    }

    /**
     * @notice Update swap fee
     * @param newFee New fee in basis points
     */
    function updateSwapFee(uint256 newFee) external onlyRole(OPERATOR_ROLE) {
        require(newFee <= 1000, "SimpleSwap: Fee too high"); // Max 10%
        uint256 oldFee = swapFee;
        swapFee = newFee;
        emit SwapFeeUpdated(oldFee, newFee);
    }

    /**
     * @notice Get pool information
     * @param poolId Pool ID
     */
    function getPoolInfo(uint256 poolId) external view returns (
        address tokenA,
        address tokenB,
        uint256 reserveA,
        uint256 reserveB,
        uint256 totalLiquidity,
        bool isActive
    ) {
        Pool memory pool = pools[poolId];
        return (
            pool.tokenA,
            pool.tokenB,
            pool.reserveA,
            pool.reserveB,
            pool.totalLiquidity,
            pool.isActive
        );
    }

    /**
     * @notice Square root function (Babylonian method)
     */
    function sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }
}
