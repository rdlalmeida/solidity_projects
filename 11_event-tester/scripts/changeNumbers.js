var EventTester = artifacts.require("EventTester");

module.exports = async function (callback) {
    try {
        let event_contract = await EventTester.deployed();

        let current_number = await event_contract.retrieveNumber();

        console.log("Current number: ", Number(current_number));

        // Change the number
        await event_contract.changeNumber(15);

        let updated_number = await event_contract.retrieveNumber();

        console.log("Updated number: ", Number(updated_number));

        process.exit(0);
    }
    catch(error) {
        console.error(error);
    }

    callback;
}