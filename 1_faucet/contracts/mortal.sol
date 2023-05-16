// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./owned.sol";

contract mortal is owned{
	// Contract destructor
	function destroy() public onlyOwner {
		selfdestruct(owner);
	}
}
