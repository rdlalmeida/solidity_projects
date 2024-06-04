// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract EventTester {
	uint256 myNumber;
	string myName;

	event NameChange(string old_name, string new_name, address caller);
	event NumberChange(uint256 old_number, uint256 new_number, address caller);

	function retrieveNumber() public view returns (uint256) {
		return myNumber;
	}

	function changeNumber(uint256 newNumber) public {
		emit NumberChange(myNumber, newNumber, msg.sender);
		myNumber = newNumber;
	}

	function retrieveName() public view returns (string memory) {
		return myName;
	}

	function changeName(string calldata newName) public {
		emit NameChange(myName, newName, msg.sender);
		myName = newName;
	}
}
