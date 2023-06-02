// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract SimpleStorage {
    uint256 favoriteNumber;

    event NumberStored(
        uint256 indexed oldNumber,
        uint256 indexed newNumber,
        address sender
    );

    function store(uint256 _favoriteNumber) public {
        uint256 oldNumber = favoriteNumber;
        favoriteNumber = _favoriteNumber;

        emit NumberStored(oldNumber, _favoriteNumber, msg.sender);
    }

    function retrieve() public view returns (uint256) {
        return favoriteNumber;
    }
}
