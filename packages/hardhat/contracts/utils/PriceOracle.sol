// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * PriceOracle
 * 토큰 가격과 USD 가치 계산
 * 프론트 훅: useMemecorePrice, useTokenPrice, useTokenUSDValue 대응
 */
contract PriceOracle is Ownable {
    // Native token address constant
    address public constant NATIVE_TOKEN = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    // 토큰별 가격 (8 decimals)
    mapping(address => uint256) public tokenPrices;

    uint256 public memecorePrice = 5e7; // 0.5 USD, 8 decimals (예시)

    event PriceUpdated(address indexed token, uint256 price);

    constructor(address initialOwner) Ownable(initialOwner) {
        // 초기 owner를 지정하는 생성자
    }

    /// @notice 단일 토큰의 USD 가격 조회 (8 decimals)
    function getPrice(address token) external view returns (uint256) {
        if (token == NATIVE_TOKEN) {
            return memecorePrice;
        }
        uint256 price = tokenPrices[token];
        return price > 0 ? price : 1e8; // 기본값: 1 USD
    }

    /// @notice 토큰 수량을 USD로 환산 (8 decimals)
    function getUSDValue(address token, uint256 amount, uint8 decimals) external view returns (uint256) {
        if (amount == 0) return 0;

        uint256 price = this.getPrice(token);
        return (amount * price) / (10 ** decimals);
    }

    /// @notice 토큰 가격 설정 (onlyOwner)
    function setPrice(address token, uint256 price) external onlyOwner {
        require(price > 0, "Price must be > 0");
        tokenPrices[token] = price;
        emit PriceUpdated(token, price);
    }

    /// @notice MEME(Native) 가격 설정 (onlyOwner)
    function setMemecorePrice(uint256 price) external onlyOwner {
        require(price > 0, "Price must be > 0");
        memecorePrice = price;
        emit PriceUpdated(NATIVE_TOKEN, price);
    }
}
