// Pragma
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Imports
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {PriceConverter} from "./PriceConverter.sol";
/**
    NOTE: Plain Solidity does not have any way to communicate to the 'outside', like other languages have
    print, printf or console.log. The guys at Hardhat solve this by adding the hardhat/console.sol contract
    that can enable this functionality in Solidity.
    This import serves solely for that: enable console logging at the smart contract level
    NOTE: If VS complains about the console thing, ignore the motherfucker... this actually works... The console
    is sent to the blockchain terminal (a terminal window if running a local network, otherwise you need to
    see how to check these things on other deployment networks)
*/
import {console} from "hardhat/console.sol";

// Error Codes

/// @notice Custom error for whenever anyone other than the contract owner tries to take ownership of the resource
error FundMe__NotOwner();

/**
    @notice Custom error for when a call to the FundMe.fund() function is placed with insufficient funds.
    @param ethProvided The initial amount provided in the call
    @param minEth The minimum value expected
*/
error FundMe__NotEnoughETH(uint256 ethProvided, uint256 minEth);

/// @notice Custom error for when a FundMe.withdraw call fails
error FundMe__CallFailed();

/// @notice Test custom error
error FundMe__NonExistentFunction();

// Interfaces

// Libraries

// Contracts
/**
    @title A contract for crowd funding
    @author Ricardo Almeida
    @notice This contract is to demo a sample funding contract
    @dev This implements price feeds as our library
*/
contract FundMe {
    // Type Declarations
    // This is the statement that allows line 25, where the "getConversionRate" function is called from a uint256 value (msg.value)
    using PriceConverter for uint256;

    // State Variables
    mapping(address => uint256) public addressToAmountFunded;
    address[] public founders;
    // Could we make this constant? No! We should make it immutable!
    address public immutable OWNER;
    // Minimum ETH to send, as USD
    uint256 public constant MINIMUM_USD = 5 * 10 ** 18; // 50 * 10 ** 18 = 50e18 = 50000000000000000000;
    AggregatorV3Interface public priceFeed;

    // Events

    // Modifiers
    modifier onlyOwner() {
        // NOTE: NotOwner is a custom error defined at the top of this module.
        if (msg.sender != OWNER) revert FundMe__NotOwner();
        _;
    }

    // Functions Order:
    // constructor
    // receive
    // fallback
    // external
    // public
    // internal
    // private
    // view/pure

    constructor(address priceFeedAddress) {
        OWNER = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    /**
        @notice This function funds this contract
        @dev This implements price feed as our library
    */
    function fund() public payable {
        /*
            This one is particularly messy, even in Javascript terms...
            So, the 'getConversionRate' function is obtained from the PriceConverter.sol module. Normal, decent programming
            languages typically specify this somewhere, but not Javascript! Oh no, with fucking Javascript you have to 'guess'
            it, you need divination skills to work with this shit...
            So, is this it? Is this the whole spectrum of messiness you're talking about??
            Fuck no! This is just an apetizer!
            import {console} from "hardhat/console.sol";
            Next comes the weirdest thing I ever saw as a software engineer:
            So, 'getConversionRate' takes two arguments: a uint256 amount and an AggregatorV3Interface object named priceFeed. So far so good
            But, by some stupid reason, the first argument is 'passed' by... (I need to breathe deeply first) calling the function from
            the argument.. HOW IS THIS LOGIC????? WHO THE FUCK CAME UP WITH THIS STUPIDITY???? THIS GOES AGAINST EVERY SINGLE NOTION
            OF GOOD SOFTWARE WRITTING!
            So, not only you have to find out where the fuck the 'getConversionRate' comes from, but you also have to take into account
                      const attackerConnectedContract = await fundMeContract.connect(
                attacker
            )

            await expect(attackerConnectedContract.withdraw()).to.be.reverted  that, UNLINKE EVERY DECENT AND LOGIC PROGRAMMING LANGUAGE OUT THERE (including fucking PhP!!!!!), you can invoke a function
            from a non-object, like an uint256, and when you do, the first argument (but not the second or any other after) is actually
            actually that value??? This is madness I tell you...
            OK, confusing enough... But what if the function has more than one input?
            Well, if that is the case, Javascript simply becomes exponentially more stupid to solve that! How do you provide the second argument???
            By doing it as if it was the first, i.e., inside parethesis...
            But what about the first argument? Should it also go inside the parenthesis as well?
            One would assume so, if the rules of logic and decency where applicable in this bullshit of a programming language, but no,
            apparently one can pass two arguments to one function as such:

            msg.value.getConversionRate(priceFeed)

            So, just to sum up this mess:
                · getConversionRate is a function from the PriceConverter.sol contract. In a normal programming language, you would
                invoke it like:
                    
                    var answer = PriceConverter.getConversionRate(arg1, arg2);
                
                But in fucking Javascript, its whatever...

            · msg.value is actually arg1, which if you look at the function signature, it has to be a uint256 value. The weird
            thing is that you can invoke the function from addressing the input argument! There must be 2 situations in the whole
            wide world where this approach was actually efficient, but that is enough to make this a valid call in fucking Javascript

            · priceFeed is arg2 and the only 'normal' thing in this bullshit, if you ignore the fact that arg2 is passed as arg1...

            Uff.. that's about it. I need these cathartic notes here and there because working with Javascript is often a mystery.
        */
        uint256 ethProvided = msg.value.getConversionRate(priceFeed);

        if (ethProvided <= MINIMUM_USD) {
            revert FundMe__NotEnoughETH(ethProvided, MINIMUM_USD);
        }

        addressToAmountFunded[msg.sender] += msg.value;
        founders.push(msg.sender);

        uint256 ethVal = msg.value / (1 * 10 ** 18);

        console.log("Account ");
        console.log(msg.sender);
        console.log(" funded this contract with ");
        console.log(ethVal);
        console.log(" ETH");
    }

    /**
        @notice This function returns the version of the price feed service.
        @return uint256 The version of the price feed service in use
    */
    function getVersion() public view returns (uint256) {
        // ETH/USD price feed address of Sepolia Network
        console.log("getVersion function invoked!");
        return priceFeed.version();
    }

    /**
        @notice This function withdraws all the funds set so far into the owner's account.
    */
    function withdraw() public onlyOwner {
        // Go through all the founders so far
        for (
            uint256 founderIndex = 0;
            founderIndex < founders.length;
            founderIndex++
        ) {
            // And one by one, extract the address of a founder
            address founder = founders[founderIndex];

            // And set all the funds sent so far to 0
            addressToAmountFunded[founder] = 0;
        }

        // Reset the array of founders
        founders = new address[](0);

        /* 
            Apparentely there are several ways to achieve the next objective, namely, to send all the funds from the individual
            founders to this contract. This is the "older" version using a delegated call (I think...)

            payable(msg.sender).transfer(address(this).balance);

            bool sendSuccess = payable(msg.sender).send(address(this).balance);
            require(sendSuccess, "Send failed");

            call
        */

        // This version is more "secure", apparentely...
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");

        if (!callSuccess) {
            revert FundMe__CallFailed();
        }
    }

    /**
        @notice Standard fallback function to be executed when no other path is available for the smart contract execution.
    */
    fallback() external payable {
        fund();
    }

    /**
        @notice Standard receive function to be used as it is indicated.
    */
    receive() external payable {
        fund();
    }
}
