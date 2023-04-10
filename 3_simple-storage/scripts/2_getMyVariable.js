/*
    IMPORTANT: Only try to read a variable from a contract AFTER setting in (running the other script). By some reason,
    if the code to retrieve the contract variable is executed in a command line, for example, it returns 0. The variable is not
    set in the contract init function, but according to Solidity rules, every integer type variables are set, by default, to 0 in 
    these cases. Yet, when I try to do the same thing (read the uninitialized variable) using a script, the thing breaks and does
    so in a way where it does not give any clue that the problem is simply an uninitialized variable! 
*/

// Begin by requiring the contract artifact in question
var SimpleStorage = artifacts.require("SimpleStorage");

module.exports = async function(callback) {
    try {
        // const accounts = await web3.eth.getAccounts();

        // const user1 = accounts[0];

        // console.log("User 1 address: ");
        // console.log(user1);

        // Next, abstract it in a constant, while waiting for it to be proper deployed
        const store = await SimpleStorage.deployed();

        // Print the contract address, more to signal that the contract is properly abstracted in the 'store' constant
        console.log("SimpleStorage deployed at", store.address);

        // Run the contract function directly from the contract abstraction to obtain the contract variable value.
        const myVar = await store.get();

        // And print it. I can simply return it because this is a script, but in this context the correct approach is to print
        // this to log it to the console.
        console.log("Contract var =", myVar.toNumber());
    }
    catch(error) {
        // Any errors found in this process should be captured and logged
        console.log(error)
    }

    callback();
}