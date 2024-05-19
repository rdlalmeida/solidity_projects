// SPDX-License-Identifier: MIT

/**
    This contract serves simply to create a contract without a proper receive function and thus use it to trigger
    a call failure, so that I can properly test the rest of the other contracts
*/
pragma solidity ^0.8.24;

error FundMeHelper__InvalidFunds(uint256 fundProvided, uint256 minimumFunds);
import {FundMe} from "./FundMe.sol";

contract FundMeHelper {
    uint256 public constant MINIMUM_ETH = 5 * 10 ** 17; // I'm setting the minimum amount to fund to 0.5 ETH
    FundMe public fundMeContract;

    constructor(address priceFeedAddress) {
        fundMeContract = new FundMe(priceFeedAddress);
    }

    function initialFund() public payable {
        if (msg.value <= MINIMUM_ETH) {
            revert FundMeHelper__InvalidFunds(msg.value, MINIMUM_ETH);
        }
    }

    // Create a withdraw function for this contract that simply calls the same function in the main contract. But since this one
    // does not have a corresponding receive function, calling this withdraw should always trigger the custom error associated
    // from the main contract
    function helperWithdraw() external {
        /* 
            The idea with this function is to use it as a "delegate call" for the main contract's withdraw function. Since this
            contract does not have a 'receive' function (unlike the main one), the withdraw is going to transfer any funds from
            the main contract to the one calling the function, which because of what I'm doing, is going to be this helper
            contract (more aptly, the address to where this contract was deployed). Note that this contract CAN be funded using
            the 'initialFund' function above (because it was set as 'payable'), but the withdraw function from the main contract
            expects the existence of a 'receive' function that is also payable. This means that this error actually can be 
            triggered by a number of ways:
            · setting a 'receive' function but not setting it to be payable
            · setting a payable function called 'receiving', for example

            But for this case I'm simply omiting the receive function and that's it.  
        */
        fundMeContract.withdraw();
    }
}
