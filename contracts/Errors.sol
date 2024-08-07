// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

/**
 * @dev Генерируется, когда сумма депозита равна нулю.
 * @param account Адрес аккаунта, который пытался внести средства.
 */
error DepositAmountZero(address account);

/**
 * @dev Генерируется, когда сумма вывода равна нулю.
 * @param account Адрес аккаунта, который пытался внести средства.
 */
error WithdrawalAmountZero(address account);

/**
 * @dev Генерируется, когда сумма снятия превышает баланс счёта.
 * @param account Адрес аккаунта, который пытался снять средства.
 * @param amount Сумма, которую пытались снять.
 * @param balance Текущий баланс аккаунта.
 */
error WithdrawalAmountExceedsBalance(address account, uint256 amount, uint256 balance);
