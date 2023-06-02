// imports
const { ethers } = require("hardhat");
require("dotenv").config();
const fs = require("fs");

const WAIT_BLOCKS = 1;

// async main
async function main() {
    const SimpleStorageFactory = await ethers.getContractFactory(
        "SimpleStorage"
    );

    console.log("Deploying contract...");

    const simpleStorage = await SimpleStorageFactory.deploy();

    await simpleStorage.deployed();

    console.log(`Deployed contract to address ${simpleStorage.address}`);

    let envfile = fs.readFileSync(".env").toString();
    envfile = envfile.replace(
        /^.*CONTRACT_ADDRESS.*$/gm,
        "CONTRACT_ADDRESS=" + simpleStorage.address
    );

    fs.writeFileSync(".env", envfile);

    // interact with the contract
    // const currentValue = await simpleStorage.retrieve();
    // console.log(`Current value is: ${currentValue}`);

    // const transactionResponse = await simpleStorage.store(7);
    // await transactionResponse.wait(WAIT_BLOCKS);

    // const updatedValue = await simpleStorage.retrieve();
    // console.log(`Updated value is ${updatedValue}`);
}

// main
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
