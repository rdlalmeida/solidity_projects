// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ReceiveEth {
    uint public amount = 1 ether;

    receive() external payable {
        require(msg.value == amount, "Wrong amount!");
    }
}