// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract EventExample {
	event DataStored(uint256 oldVal, uint256 indexed newVal, address caller);

	uint256 val;

	function storeData(uint256 newVal) public {
		uint256 old_val = val;

		val = newVal;

		emit DataStored(old_val, newVal, msg.sender);

	}

	function retrieveData() public view returns (uint256) {
		return val;
	}
}
