// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SimpleBridge
 * @notice Simple cross-chain bridge for token transfers
 * @dev Lock-and-mint mechanism for cross-chain transfers
 */
contract SimpleBridge is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant RELAYER_ROLE = keccak256("RELAYER_ROLE");

    enum TransferStatus {
        Pending,
        Completed,
        Cancelled
    }

    struct Transfer {
        address sender;
        address recipient;
        address token;
        uint256 amount;
        uint256 targetChainId;
        uint256 timestamp;
        TransferStatus status;
        bytes32 txHash; // Transaction hash on target chain
    }

    // Transfer ID counter
    uint256 public transferCounter;

    // Mapping: transferId => Transfer
    mapping(uint256 => Transfer) public transfers;

    // Mapping: token => chainId => isSupported
    mapping(address => mapping(uint256 => bool)) public supportedTokens;

    // Mapping: chainId => isSupported
    mapping(uint256 => bool) public supportedChains;

    // Bridge fee in basis points (e.g., 10 = 0.1%)
    uint256 public bridgeFee = 10;

    // Minimum transfer amount
    uint256 public minTransferAmount = 1e6; // 1 USDT (6 decimals)

    // Events
    event TransferInitiated(
        uint256 indexed transferId,
        address indexed sender,
        address indexed recipient,
        address token,
        uint256 amount,
        uint256 targetChainId
    );
    event TransferCompleted(uint256 indexed transferId, bytes32 txHash);
    event TransferCancelled(uint256 indexed transferId);
    event TokenSupported(address indexed token, uint256 indexed chainId, bool supported);
    event ChainSupported(uint256 indexed chainId, bool supported);
    event BridgeFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeesCollected(address indexed token, uint256 amount);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        _grantRole(RELAYER_ROLE, msg.sender);

        // Support Memecore chain by default
        supportedChains[43522] = true;
        emit ChainSupported(43522, true);
    }

    /**
     * @notice Initiate cross-chain transfer
     * @param token Token address
     * @param amount Amount to transfer
     * @param recipient Recipient address on target chain
     * @param targetChainId Target chain ID
     */
    function initiateTransfer(
        address token,
        uint256 amount,
        address recipient,
        uint256 targetChainId
    ) external nonReentrant returns (uint256 transferId) {
        require(supportedChains[targetChainId], "SimpleBridge: Chain not supported");
        require(supportedTokens[token][targetChainId], "SimpleBridge: Token not supported");
        require(amount >= minTransferAmount, "SimpleBridge: Amount too small");
        require(recipient != address(0), "SimpleBridge: Invalid recipient");

        // Calculate fee
        uint256 fee = (amount * bridgeFee) / 10000;
        uint256 amountAfterFee = amount - fee;

        // Lock tokens
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        transferId = ++transferCounter;
        transfers[transferId] = Transfer({
            sender: msg.sender,
            recipient: recipient,
            token: token,
            amount: amountAfterFee,
            targetChainId: targetChainId,
            timestamp: block.timestamp,
            status: TransferStatus.Pending,
            txHash: bytes32(0)
        });

        emit TransferInitiated(transferId, msg.sender, recipient, token, amountAfterFee, targetChainId);
    }

    /**
     * @notice Complete transfer (called by relayer)
     * @param transferId Transfer ID
     * @param txHash Transaction hash on target chain
     */
    function completeTransfer(uint256 transferId, bytes32 txHash) external onlyRole(RELAYER_ROLE) {
        Transfer storage transfer = transfers[transferId];
        require(transfer.status == TransferStatus.Pending, "SimpleBridge: Transfer not pending");

        transfer.status = TransferStatus.Completed;
        transfer.txHash = txHash;

        emit TransferCompleted(transferId, txHash);
    }

    /**
     * @notice Cancel transfer and refund (emergency only)
     * @param transferId Transfer ID
     */
    function cancelTransfer(uint256 transferId) external onlyRole(OPERATOR_ROLE) {
        Transfer storage transfer = transfers[transferId];
        require(transfer.status == TransferStatus.Pending, "SimpleBridge: Transfer not pending");

        transfer.status = TransferStatus.Cancelled;

        // Refund including fee
        uint256 refundAmount = (transfer.amount * 10000) / (10000 - bridgeFee);
        IERC20(transfer.token).safeTransfer(transfer.sender, refundAmount);

        emit TransferCancelled(transferId);
    }

    /**
     * @notice Receive tokens from another chain (called by relayer)
     * @param recipient Recipient address
     * @param token Token address
     * @param amount Amount to receive
     * @param sourceChainId Source chain ID
     * @param sourceTxHash Source transaction hash
     */
    function receiveTransfer(
        address recipient,
        address token,
        uint256 amount,
        uint256 sourceChainId,
        bytes32 sourceTxHash
    ) external onlyRole(RELAYER_ROLE) nonReentrant returns (uint256 transferId) {
        require(supportedChains[sourceChainId], "SimpleBridge: Chain not supported");
        require(supportedTokens[token][sourceChainId], "SimpleBridge: Token not supported");
        require(recipient != address(0), "SimpleBridge: Invalid recipient");
        require(amount > 0, "SimpleBridge: Invalid amount");

        // Release locked tokens
        IERC20(token).safeTransfer(recipient, amount);

        transferId = ++transferCounter;
        transfers[transferId] = Transfer({
            sender: address(0), // Unknown sender from other chain
            recipient: recipient,
            token: token,
            amount: amount,
            targetChainId: block.chainid,
            timestamp: block.timestamp,
            status: TransferStatus.Completed,
            txHash: sourceTxHash
        });

        emit TransferInitiated(transferId, address(0), recipient, token, amount, block.chainid);
        emit TransferCompleted(transferId, sourceTxHash);
    }

    /**
     * @notice Add support for token on a chain
     * @param token Token address
     * @param chainId Chain ID
     * @param supported Whether to support
     */
    function setSupportedToken(
        address token,
        uint256 chainId,
        bool supported
    ) external onlyRole(OPERATOR_ROLE) {
        supportedTokens[token][chainId] = supported;
        emit TokenSupported(token, chainId, supported);
    }

    /**
     * @notice Add support for chain
     * @param chainId Chain ID
     * @param supported Whether to support
     */
    function setSupportedChain(uint256 chainId, bool supported) external onlyRole(OPERATOR_ROLE) {
        supportedChains[chainId] = supported;
        emit ChainSupported(chainId, supported);
    }

    /**
     * @notice Update bridge fee
     * @param newFee New fee in basis points
     */
    function updateBridgeFee(uint256 newFee) external onlyRole(OPERATOR_ROLE) {
        require(newFee <= 1000, "SimpleBridge: Fee too high"); // Max 10%
        uint256 oldFee = bridgeFee;
        bridgeFee = newFee;
        emit BridgeFeeUpdated(oldFee, newFee);
    }

    /**
     * @notice Update minimum transfer amount
     * @param newMinAmount New minimum amount
     */
    function updateMinTransferAmount(uint256 newMinAmount) external onlyRole(OPERATOR_ROLE) {
        minTransferAmount = newMinAmount;
    }

    /**
     * @notice Collect accumulated fees
     * @param token Token address
     */
    function collectFees(address token) external onlyRole(OPERATOR_ROLE) {
        uint256 balance = IERC20(token).balanceOf(address(this));

        // Calculate total locked amount
        uint256 totalLocked = 0;
        for (uint256 i = 1; i <= transferCounter; i++) {
            Transfer memory transfer = transfers[i];
            if (transfer.token == token && transfer.status == TransferStatus.Pending) {
                totalLocked += transfer.amount;
            }
        }

        require(balance > totalLocked, "SimpleBridge: No fees to collect");
        uint256 fees = balance - totalLocked;

        IERC20(token).safeTransfer(msg.sender, fees);
        emit FeesCollected(token, fees);
    }

    /**
     * @notice Get transfer information
     * @param transferId Transfer ID
     */
    function getTransfer(uint256 transferId) external view returns (
        address sender,
        address recipient,
        address token,
        uint256 amount,
        uint256 targetChainId,
        uint256 timestamp,
        TransferStatus status,
        bytes32 txHash
    ) {
        Transfer memory transfer = transfers[transferId];
        return (
            transfer.sender,
            transfer.recipient,
            transfer.token,
            transfer.amount,
            transfer.targetChainId,
            transfer.timestamp,
            transfer.status,
            transfer.txHash
        );
    }

    /**
     * @notice Get all pending transfers (for relayers)
     * @param limit Maximum number of results
     */
    function getPendingTransfers(uint256 limit) external view returns (uint256[] memory) {
        uint256 count = 0;

        // First pass: count pending transfers
        for (uint256 i = 1; i <= transferCounter && count < limit; i++) {
            if (transfers[i].status == TransferStatus.Pending) {
                count++;
            }
        }

        // Second pass: collect transfer IDs
        uint256[] memory pendingIds = new uint256[](count);
        uint256 index = 0;

        for (uint256 i = 1; i <= transferCounter && index < count; i++) {
            if (transfers[i].status == TransferStatus.Pending) {
                pendingIds[index] = i;
                index++;
            }
        }

        return pendingIds;
    }

    /**
     * @notice Estimate bridge fee for amount
     * @param amount Amount to bridge
     * @return fee Fee amount
     * @return amountAfterFee Amount after fee
     */
    function estimateFee(uint256 amount) external view returns (uint256 fee, uint256 amountAfterFee) {
        fee = (amount * bridgeFee) / 10000;
        amountAfterFee = amount - fee;
    }
}
