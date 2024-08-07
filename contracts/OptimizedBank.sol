// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import { DepositAmountZero, WithdrawalAmountZero, WithdrawalAmountExceedsBalance } from './Errors.sol';

contract OptimizedBank {
    // Оптимизорованная структура занимает 2 слота
    struct User {
        uint128 balance;
        uint64 depositCount;
        uint64 withdrawCount;
        uint48 createdAt;
        uint48 updatedAt;
        address addr;
    }

    mapping(address => User) public users;
    address[] public userList;

    // Функция депозита эфира с использованием unchecked + stack
    function deposit() public payable {
        require(msg.value > 0, DepositAmountZero(msg.sender));

        User storage user = users[msg.sender];

        user.addr = msg.sender;
        user.createdAt = uint48(block.timestamp);
        user.updatedAt = uint48(block.timestamp);

        unchecked {
            user.balance += uint128(msg.value);
            user.depositCount++;
        }

        userList.push(msg.sender);
    }

    // Функция снятия эфира c использованием unchecked и обращением к storage после проверки amount
    function withdraw(uint256 amount) public {
        require(amount > 0, WithdrawalAmountZero(msg.sender));

        User storage user = users[msg.sender];
        require(user.balance >= amount, WithdrawalAmountExceedsBalance(msg.sender, amount, user.balance));

        unchecked {
            user.balance -= uint128(amount);
            user.withdrawCount++;
        }

        payable(msg.sender).transfer(amount);
    }

    // Функция для подсчета всех пользователей и их балансов (memory)
    function countUsersAndBalances() public view returns (uint256 userCount, uint256 totalBalance) {
        uint256 count = userList.length; 
        uint256 balance = 0;

        for (uint256 i = 0; i < count; i++) {
            balance += users[userList[i]].balance;
        }

        return (count, balance);
    }


    // Функция для подсчета всех пользователей и их балансов (calldata)
    function countUsersAndBalancesCalldata(address[] calldata _userList) public view returns (uint256 userCount, uint256 totalBalance) {
        uint256 count = _userList.length;
        uint256 balance = 0;

        for (uint256 i = 0; i < count; i++) {
            balance += users[_userList[i]].balance;
        }

        return (count, balance);
    }

    // Функция для работы со stack с использованием unchecked
    function calculate(uint256 a, uint256 b) public pure returns (uint256, uint256) {
        unchecked {
            uint256 sum = a + b;
            uint256 diff = a - b;
            return (sum, diff);
        }
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
