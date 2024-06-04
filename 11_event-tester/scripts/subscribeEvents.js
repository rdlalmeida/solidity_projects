// Initialize the web3 library from a running ganache instance
const web3_provider = require('web3');
const web3 = new web3_provider('http://localhost:7545');

const event_tester = artifacts.require("../contracts/EventTester.sol");

module.exports = async function (callback) {
    try {
        // Grab the contract instance as deployed in the local network (Ganache)
        console.log("Testing web3: ", web3.utils.toWei("1", "ether"));
        process.exit(0);

        let event_contract = await event_tester.deployed();

        // Extract the contract address from the contract instance (we're going to need this to subscribe to events)
        let contract_address = event_contract.address;


        console.log("Contract address = ", contract_address);
    }
    catch(error) {
        console.error(error);
    }

    callback();
}

const subscribeLogEvents = function(contract, eventName) {
    const subscription = web3.eth.subscribe('logs')
}