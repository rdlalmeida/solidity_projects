// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./mortal.sol";

// Basic Faucet contract
contract Faucet is mortal {
	event Withdrawal(address indexed to, uint amount);
	event Deposit(address indexed from, uint amount);

	// Withdraw function
	function withdraw(uint withdraw_amount) public {
		// Establish the minimal withdraw amount to 0.1 ETH
		require(withdraw_amount <= 0.1 ether, "Maximum allowed withdraw is of 0.1 ether!");
		require(address(this).balance >= withdraw_amount, "Insufficient balance in the faucet for withdrawal request!");

		// Transfer the required amount to the account executing this function
		payable(msg.sender).transfer(withdraw_amount);

		emit Withdrawal(msg.sender, withdraw_amount);
	}

	// Empty receive function just to keep the standards up to date
	receive() external payable {
		emit Deposit(msg.sender, msg.value);
	}

	// And the fallback function
	fallback() external payable {

	}
}