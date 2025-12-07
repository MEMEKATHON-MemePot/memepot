// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * TokenBalanceHelper
 * 유저 토큰 잔고 조회 헬퍼
 * 프론트 훅: useTokenBalance 대응
 */
contract TokenBalanceHelper {
    // Native token address constant
    address public constant NATIVE_TOKEN = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    /**
     * getUserBalance - 유저의 토큰 잔고 조회 (ERC20 / Native 모두 지원)
     * @param user 유저 주소
     * @param token 토큰 주소 (NATIVE_TOKEN이면 네이티브)
     * @return balance 토큰 잔고 (token decimals)
     */
    function getUserBalance(address user, address token) external view returns (uint256) {
        if (token == NATIVE_TOKEN) {
            // Native token balance
            return user.balance;
        }
        // ERC20 balance
        return IERC20(token).balanceOf(user);
    }

    /**
     * getUserNativeBalance - 유저의 네이티브 토큰 잔고
     * @param user 유저 주소
     * @return balance 네이티브 토큰 잔고
     */
    function getUserNativeBalance(address user) external view returns (uint256) {
        return user.balance;
    }

    /**
     * getUserERC20Balance - 유저의 ERC20 토큰 잔고
     * @param user 유저 주소
     * @param token ERC20 토큰 주소
     * @return balance ERC20 토큰 잔고
     */
    function getUserERC20Balance(address user, address token) external view returns (uint256) {
        return IERC20(token).balanceOf(user);
    }

    /**
     * getMultipleBalances - 여러 토큰의 잔고를 한 번에 조회
     * @param user 유저 주소
     * @param tokens 토큰 주소 배열
     * @return balances 잔고 배열 (각 토큰 decimals)
     */
    function getMultipleBalances(address user, address[] calldata tokens) external view returns (uint256[] memory) {
        uint256[] memory balances = new uint256[](tokens.length);

        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i] == NATIVE_TOKEN) {
                balances[i] = user.balance;
            } else {
                balances[i] = IERC20(tokens[i]).balanceOf(user);
            }
        }

        return balances;
    }
}
