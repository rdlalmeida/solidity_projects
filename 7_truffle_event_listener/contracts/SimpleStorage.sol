// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract SimpleStorage {
    uint256 favoriteNumber;

    event NumberChanged(
        uint256 indexed oldNumber,
        uint256 indexed newNumber,
        address sender
    );

    function storeNumber(uint256 newNumber) public {
        uint256 oldNumber = favoriteNumber;
        favoriteNumber = newNumber;
        emit NumberChanged(oldNumber, newNumber, msg.sender);
    }

    function retrieve() public view returns (uint256) {
        return favoriteNumber;
    }
}
