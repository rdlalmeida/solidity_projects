require("dotenv").config();
const Web3 = require("web3");
const fs = require("fs");

const main = async function () {
    var new_number = null;
    if (!process.argv[2]) {
        throw new Error("Unable to continue without a new number as argument");
    }

    new_number = Number(process.argv[2]);

    const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.PROVIDER_URL)
    );

    const contract_json = JSON.parse(
        fs.readFileSync(process.env.CONTRACT_JSON_PATH)
    );

    const network_id = await web3.eth.net.getId();
    const contract_address = contract_json.networks[network_id].address;

    const simple_storage_contract = new web3.eth.Contract(
        contract_json.abi,
        contract_address
    );

    const accounts = await web3.eth.getAccounts();

    const current_favorite_number = await simple_storage_contract.methods
        .retrieve()
        .call({ from: accounts[0] });

    console.log("Current favorite number = ", Number(current_favorite_number));

    console.log("Updating the favorite number to ", new_number, "...");

    const tx = await simple_storage_contract.methods
        .storeNumber(new_number)
        .send({ from: accounts[0] });

    const updated_favorite_number = await simple_storage_contract.methods
        .retrieve()
        .call({ from: accounts[0] });

    console.log("Updated favorite number = ", updated_favorite_number);
};

main().catch((error) => {
    console.error(error.message);
    process.exit(1);
});
