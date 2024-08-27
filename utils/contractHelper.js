require("dotenv").config();
const { readFileSync, writeFileSync } = require("fs");
const { ethers } = require("ethers");


/*
    This function reads the contract addresses to a JSON variable and verifies if there's an entry with contract_name in it, for the network provided.
    If there is, this function return the contract address associated. If not, returns an empty string instead, which can be tested to determine the
    state of deployment of the contract
*/
async function getContractAddress(network, contract_json_path) {
    let jsonContract;
    
    try{
       jsonContract = require(contract_json_path);
    } catch(error) {
        console.error(error);
        process.exit(1);
    }

    const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_API_ENDPOINT);

    const wallet = new ethers.Wallet(process.env.METAMASK_PRIV_KEY, provider);

    


}

/*
    This function creates a new entry into the contract addresses json file to try and avoid multiple deployments of the same contract (even to the local network)
    @network: the name of the network where the contract was deployed to
    @contract_name: The name of the contract
    @contract_address: The address where the contract was deployed
*/
async function saveContractAddress(network, contract_name, contract_address) {
    let contractAddressFN = process.env.CONTRACT_ADDRESSES_FILENAME;

    var contractAddressesJSON = JSON.parse(readFileSync(contractAddressFN));

    console.log("Referencing a variable:");
    console.log(contractAddressesJSON[network][contract_name]);

    contractAddressesJSON[network][contract_name] = "ChangedThisFucker!"

    console.log("New JSON:");
    console.log(contractAddressesJSON);

    // contractAddressesJSON[[network]][[contract_name]] = contract_address;

    // console.log(contractAddressesJSON);

    process.exit(0);

    try {
        writeFileSync(contractAddressFN, JSON.stringify(test_json), (error) => {
            console.error(error);
        })
    }
    catch(error) {
        console.error("Caught this one outside: ", error)
    }

    console.log("Done!");

    
}

saveContractAddress("sepolia", "TestContract2", "0xDumbAddressX");