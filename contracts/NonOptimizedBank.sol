// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.26;

import { DepositAmountZero, WithdrawalAmountZero, WithdrawalAmountExceedsBalance } from './Errors.sol';

contract NonOptimizedBank {
    // Не оптимизоровання структура занимает 6 слотов
    struct User {
        address addr;
        uint256 balance;
        uint256 createdAt;
        uint256 updatedAt;
        uint256 depositCount;
        uint256 withdrawCount;
    }

    mapping(address => User) public users;
    address[] public userList;

    // Функция депозита эфира без использования unchecked + stack
    function deposit() public payable {
        require(msg.value > 0, DepositAmountZero(msg.sender));

        User storage user = users[msg.sender];

        user.addr = msg.sender;
        user.balance += msg.value;
        user.createdAt = block.timestamp;
        user.updatedAt = block.timestamp;
        user.depositCount++;

        userList.push(msg.sender);
    }

    // Функция снятия эфира без использования unchecked и обращением к storage перед проверкой amount
    function withdraw(uint256 amount) public {
        User storage user = users[msg.sender];
        require(amount > 0, WithdrawalAmountZero(msg.sender));
        require(user.balance >= amount, WithdrawalAmountExceedsBalance(msg.sender, amount, user.balance));

        user.balance -= amount;
        user.updatedAt = block.timestamp;
        user.withdrawCount++;

        payable(msg.sender).transfer(amount);
    }

    // Функция для подсчета всех пользователей и их балансов (memory)
    function countUsersAndBalances() public view returns (uint256 userCount, uint256 totalBalance) {
        uint256 count = 0;
        uint256 balance = 0;

        for (uint256 i = 0; i < userList.length; i++) {
            count++;
            balance += users[userList[i]].balance;
        }

        return (count, balance);
    }

    // Функция для подсчета всех пользователей и их балансов (calldata)
    function countUsersAndBalancesCalldata(address[] calldata _userList) public view returns (uint256 userCount, uint256 totalBalance) {
        uint256 count = 0;
        uint256 balance = 0;

        for (uint256 i = 0; i < _userList.length; i++) {
            count++;
            balance += users[_userList[i]].balance;
        }

        return (count, balance);
    }

    // Функция для работы со stack без uncheck
    function calculate(uint256 a, uint256 b) public pure returns (uint256, uint256) {
        uint256 sum = a + b;
        uint256 diff = a - b;
        return (sum, diff);
    }

    // Общая функция для проверки всех возможностей контракта по очереди
    function allTasks(address[] calldata _userListCalldata, uint256 a, uint256 b) public payable {
        deposit();
        withdraw(msg.value);
        countUsersAndBalances();
        countUsersAndBalancesCalldata(_userListCalldata);
        calculate(a, b);
    }
}
