const { ethers } = require("ethers");
const { writeFile, readFile } = require("fs/promises");
const { writeFileSync, readFileSync } = require("fs");

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



process.exit(0);
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
})