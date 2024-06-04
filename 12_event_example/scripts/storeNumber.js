const EventExample = artifacts.require("../contracts/EventExample.sol");

module.exports = async function (callback) {
    try {
        const event_contract = await EventExample.deployed();
        let currentVal = await event_contract.retrieveData();
        console.log("Current val: ", Number(currentVal));

        let newVal = process.argv[4];

        console.log("Storing ", newVal, " into the contract...");

        let txResponse = await event_contract.storeData(newVal);

        currentVal = await event_contract.retrieveData();

        console.log("Updated value = ", Number(currentVal));
    }
    catch(error) {
        console.error(error);
    }

    callback();
}