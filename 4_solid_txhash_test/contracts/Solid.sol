// SPDX-License-Identifier: MIT
pragma solidity >= 0.4.22 < 0.9.0;

contract Counter {
    address public owner = msg.sender;
    uint256 public value;

    constructor (uint256 _value) {
        value = _value;
    }

    function inc(uint256 step) public {
        require (msg.sender == owner, "not owner");
        value += step;
    }
}