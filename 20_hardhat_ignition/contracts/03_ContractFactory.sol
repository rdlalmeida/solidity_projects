// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract DeployedWithFactory {
    uint public immutable id;

    constructor(uint _id) {
        id = _id;
    }
}

contract Factory {
    uint public nextId = 0;

    event Deployed(uint id, address addr);

    constructor() {
        
    }

    function deploy() public {
        uint id = nextId++;
         DeployedWithFactory addr = new DeployedWithFactory(id);

         emit Deployed(id, address(addr));
    }
}