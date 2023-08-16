const SimpleStorageFactory = artifacts.require(
    "../contracts/SimpleStorage.sol"
);

module.exports = async function (callback) {
    try {
        if (!process.argv[4]) {
            console.error(
                "Please provide a valid number as argument to update to continue!"
            );
            process.exit(1);
        }

        const simple_storage_contract = await SimpleStorageFactory.deployed();

        const current_favorite_number =
            await simple_storage_contract.retrieve();

        console.log(
            "Current favorite number = ",
            Number(current_favorite_number)
        );

        const new_number = process.argv[4];

        console.log("Updating favorite number to ", new_number, "...");

        const txResp = await simple_storage_contract.storeNumber(new_number);

        const updated_favorite_number =
            await simple_storage_contract.retrieve();

        console.log(
            "Updated favorite number = ",
            Number(updated_favorite_number)
        );
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }

    callback();
};
