// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract HelloWorld {
    function sayHello(string memory greet) public pure returns (string memory) {
        string memory hello = "Hello ";
        
        return string.concat(hello, greet);
    }
}