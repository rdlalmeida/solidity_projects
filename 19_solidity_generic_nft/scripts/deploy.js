const { ethers } = require("ethers");
const { writeFile } = require("fs/promises");
const { writeFileSync } = require("fs");

require("dotenv").config()

async function main() {
    // Read the smart contract JSON to a variable

    const jsonContract = require('../artifacts/contracts/SolidityNFT.sol/SolidityNFT.json')

    // const provider = new ethers.AlchemyProvider(process.env.ALCHEMY_API_ENDPOINT)
    const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_API_ENDPOINT)

    const wallet = new ethers.Wallet(process.env.METAMASK_PRIV_KEY, provider);

    const contractFactory = new ethers.ContractFactory(jsonContract.abi, jsonContract.bytecode, wallet)

    const solidityNFT = await contractFactory.deploy()

    let contractAddress = await solidityNFT.getAddress()

    console.log("Contract deployed to address: ", contractAddress)
}

/*
    This function creates a new entry into the contract addresses json file to try and avoid multiple deployments of the same contract (even to the local network)
    @network: the name of the network where the contract was deployed to
    @contract_name: The name of the contract
    @contract_address: The address where the contract was deployed
*/
async function saveContractAddress(network, contract_name, contract_address) {
    let test_json = {
        [network]: {
            "TestContract1": "0xRandomAddress",
            "TestContract2": "0xFakeAddress",
            [contract_name]: contract_address
        }
    }
    let contractAddressFN = process.env.CONTRACT_ADDRESSES_FILENAME;

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

saveContractAddress("testNetwork", "FakeContract1", "0xDumbAddress");

process.exit(0);
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
})