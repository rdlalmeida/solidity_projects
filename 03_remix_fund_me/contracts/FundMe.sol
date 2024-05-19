// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// Get funds from users
// Withdraw funds
// Send minumum funding value in USD

import "./PriceConverter.sol";

error NotOwner();
contract FundMe {
    using PriceConverter for uint256;

    // Set the minimum value to have 18 decimals (without the decimals per se) because everything else is working like that so far
    uint256 public constant MINIMUM_USD = 50 * 1e18;

    address payable public immutable i_owner;

    constructor() {
        i_owner = payable(msg.sender);
    }

    // Contract to retrieve ETH/USD price conversion for the Sepolia test network
    address priceContract = 0x694AA1769357215DE4FAC081bf1f309aDC325306;

    address[] public funders;
    mapping(address => uint256) public addressToAmountFunded;

	function fund() public payable {
        // Want to be able to set a minimum fund amount in USD
        // 1. How do we send ETH to this contract
        require(msg.value.getConversionRate() >= MINIMUM_USD, "Didn't send enough ether for this!");
        funders.push(msg.sender);
        addressToAmountFunded[msg.sender] = msg.value;
    }

    function withdraw() public onlyOwner {
        // Reset the balances in the mapping
        for (uint256 funderIndex = 0; funderIndex < funders.length; funderIndex++) {
            address funder = funders[funderIndex];
            addressToAmountFunded[funder] = 0;
        }

        // Reset the funders array by re-creating the array and setting it to 0 new elements (any number would suffice really)
        funders = new address[](0);

        // msg.sender = address
        // payable(msg.sender) = payable address
        // payable(msg.sender).transfer(address(this).balance);

        // The call function returns a 2 element tupple: a boolean with the function execution status and an (optional) array of bytes with any data, if the 
        // function called returns it. Since it doesn't, I'm going to omit it.
        (bool callSuccess,) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "Unable to transfer any value!");
    }

    modifier onlyOwner {
        // require(msg.sender == i_owner, "Only the contract owner can withdraw money from this contract!");

        if (msg.sender != i_owner) {
            revert NotOwner();
        }
        _; 
    }

    receive()  external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }
}
