require("dotenv").config();
const Web3 = require("web3");
const fs = require("fs");

const readContractABI = (contractABIPath) => {
    let contractABI;

    try {
        contractABI = JSON.parse(fs.readFileSync(contractABIPath));
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }

    return contractABI;
};

const main = async function () {
    const web3 = new Web3(
        new Web3.providers.HttpProvider(process.env.PROVIDER_URL)
    );

    const contractAddress = process.env.CONTRACT_ADDRESS;
    // const contractABI = readContractABI(
    //     `${process.env.CONTRACT_ABI_PATH}${process.env.CONTRACT_ABI_FILE_NAME}`
    // );
    const contract_json = require("../artifacts/contracts/SimpleStorage.sol/SimpleStorage.json");

    const simple_storage_contract = new web3.eth.Contract(
        contract_json.abi,
        contractAddress
    );

    const accounts = await web3.eth.getAccounts();
    const main_account = accounts[0];
    const newNumber = 18;

    const current_favorite_number = await simple_storage_contract.methods
        .retrieve()
        .call({ from: main_account });

    console.log("Current favorite number: ", current_favorite_number);

    console.log(`Changing the favorite number ${newNumber} to ..."`);

    const tx = await simple_storage_contract.methods
        .store(newNumber)
        .send({ from: main_account });

    const updated_favorite_number = await simple_storage_contract.methods
        .retrieve()
        .call({ from: main_account });

    console.log("Updated favorite number: ", Number(updated_favorite_number));
};

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
