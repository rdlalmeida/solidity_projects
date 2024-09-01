// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library BasicLibrary {
    function addTwo(uint self) public pure returns (uint) {
        return self + 2;
    }
}

contract ContractWithLibrary {
    using BasicLibrary for uint;

    constructor () {}

    function readonlyFunction(uint num) public pure returns (uint) {
        return num.addTwo();
    }
}