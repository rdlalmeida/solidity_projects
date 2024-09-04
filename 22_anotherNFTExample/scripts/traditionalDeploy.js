require("dotenv").config();
const { contractHelpers } = require('../../utils/contractHelper.js');
/**
 * @description This is important, nay, VITAL, to be able to deploy a fucking smart contract (it shouldn't be this hard...)
 * Hardhat ignition is out for now because it has a few bugs related to passing arguments to the contructor, so I have to do it
 * "like in the old days", i.e., get a ContractFactory for the contract and let the module do the rest.
 * But...
 * Apparentely only the 'ethers' that I get from requiring the base hardhat package allows for that. After a few hellish days wracking
 * my brain, trying to understand where the fuck the 'getContractFactory' function went, both in the 'ethers' and 'hardhat-ethers' packages, 
 * I finally found out that only the 'ethers' from the hardhat package does the trick, i.e., has the function that I need. If only I could 
 * consult some documentation for this shit...
 * Confusing? Welcome to the wonderful world of Java-fucking-script!
 */
const { ethers, run, network } = require("hardhat");


async function main() {

    contractHelpers.saveContractAddress("hardhat", "AnotherNFT", "0x1234");

    process.exit(0);



    const AnotherNFTContractFactory = await ethers.getContractFactory(
        'AnotherNFT'
    );

    console.log("Deploying contract...");

    const AnotherNFT = await AnotherNFTContractFactory.deploy();

    await simpleStorage.deployed();

    // EDIT THE CONTRACT ADDRESSES HERE
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
})