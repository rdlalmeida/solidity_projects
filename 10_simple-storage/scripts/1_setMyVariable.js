/*
    Use this script as a guide on how to pass arguments to one of these scripts that are to be run using 'truffle exec'.
    To run this script one has to use the command:
    
    $ truffle exec scripts/1_setMyVariable.js <arg1> <arg2> <arg3> ... <argN>

    We can pass arguments into the script, as an array, for all the elements after the script's path. In the case of solidity,
    arguments can be accessed in the 'process.argv' variable inside the script but, the elements of the 'process.argv'
    are already set to:
        process.argv[0] = <path to the Node executable>
        process.argv[1] = <path to Truffle's cli.bundle.js script>
        process.argv[2] = <the command being run at the moment ('exec' in these cases)>
        process.argv[3] = <the relative path to the script to run>
        process.argv[4] = <arg0>
        process.argv[5] = <arg1>
        ...
        process.argv[4 + N] = <argN>

    Knowing this, the rest is just a matter of having this into account when retrieving data from the command line.

    As an example, I run this script with an instruction to console.log("Argv =",process.argv) to see what would show. Running 
    this script with the command:
        $ truffle exec scripts\1_setMyVariable.js 23 "Ricardo!"
    
    After a while prints out the following (in a Windows environment):
    Argv =  [
        'C:\\Program Files\\nodejs\\node.exe',
        'C:\\Users\\ricardoalmeida\\AppData\\Roaming\\npm\\node_modules\\truffle\\build\\cli.bundled.js',
        'exec',
        'scripts\\1_setMyVariable.js',
        '23',
        'Ricardo!'
        ]
*/

// Start by requiring the contract as an artifact to be abstracted later on
var SimpleStorage = artifacts.require("SimpleStorage");

// And now for the main function
module.exports = async function (callback) {
    try {
        // Grab the contract abstraction in a variable
        let store = await SimpleStorage.deployed();
        let accounts = await web3.eth.getAccounts();

        // Print out the contract address to signal that the abstraction is now ready
        console.log("Contract is correctly deployed at address", store.address);

        // Check if a proper input was passed to this script (the length of the process.argv array should be greater than 4)
        if (process.argv.length <= 4) {
            throw new Error("Please provide a valid number to set the myVariable correctly!")
        }
        
        // Grab the input value to use from the list of arguments provided. The 4 first ones are already set by default by the
        // system. The 5th and subsequent are custom ones.
        let newVal = process.argv[4];

        // Verify that a number was provided as input
        // if (typeof(newVal) != "number") {
        //     throw new Error("Unable to process the input. Expected a number, got a ".concat(typeof(newVal)).concat(" instead!"));
        // }

        // Run the respective function to set the new value
        // NOTE: Whenever a transaction is to be run, set the account that signs it and also the max gas amount to force a tx hash
        // in the case of a failed transaction (so that it can be debug afterwards). Apparently, running a function that does change
        // the state of the blockchain but without specifying these arguments does not produces a valid and useful tx hash!
        await store.set(newVal, {from: accounts[0], gas: 0xfffff});

        // Print a final statement, but the read script should be run after to confirm the variable change
        console.log("SimpleStorage myVariable set to ", newVal);

    }
    catch(error) {
        console.log(error);
    }

    callback();
}