require("dotenv").config();
// const { readFileSync, writeFileSync } = require("fs");
const fs = require("fs");
const path = require("path");
const { ethers, run, network } = require("hardhat");

// TODO: TEST THIS SHIT!!

const contractHelpers = {
    /**
    * This function reads the contract addresses to a JSON variable and verifies if there's an entry with contract_name in it, for the network provided.
    * If there is, this function return the contract address associated. If not, returns an empty string instead, which can be tested to determine the
    * state of deployment of the contract
    * 
    * @param {*} contract_path  The path to the .sol contract to be deployed.
    * @param {*} constructor_args An array with the arguments, if any, expected by the constructor.
    * @returns If successful, the function returns a contract instance.
    */
    deployContract: async (contract_path, constructor_args) => {

        path.exists(contract_path, (exists) => {
            if (!exists) {
                console.error("Unable to retrieve a valid Solidity smart contract from '", contract_path, "'");
                process.exit(1);
            }
        })

        const contractFactory = await ethers.getContractFactory(contract_path);

        console.log("Deploying '", contract_path, "'...");

        let contractInstance;

        try {
            contractInstance = contractFactory.deploy(constructor_args);
            await contractInstance.deployed()
        }
        catch(error) {
            console.error(error);
            process.exit(1);
        }

        if (network.name == "sepolia" && process.env.ETHERSCAN_API_KEY) {
            await contractInstance.deployTransaction.wait(process.env.WAIT_BLOCKS);

            await verify(contractInstance.address, [])
        }

        return contractInstance;
    },
    /**
     * This function run the verify function from the Etherscan portal. What this does is to upload the code of the contract, of sorts, so that it
     * can be displayed in the portal.
     * @param contractAddress The address (string) of the contract to verify.
     * @param contructorArgs An array with the arguments, if any, expected by the constructor.
     */
    verify: async (contractAddress, constructorArgs) => {
        console.log("Verifying contract...");

        try {
            await run('verify:verify', {
                address: contractAddress,
                constructorArguments: constructorArgs,
            });
        } catch(error) {
            if (error.message.toLowerCase().includes('already verified')) {
                console.log('Contract at ', contractAddress, ' is already verified!');
            }
            else {
                console.error(error);
            }
        }
    },
    /**
     * This function creates a new entry into the contract addresses json file to try and avoid multiple deployments of the same contract (even to the local network)
     * @param contract_name The name of the contract
     * @param contract_address: The address where the contract was deployed
    */
    saveContractAddress: (contract_name, contract_address) => {
        let contractAddressFilename = process.env.CONTRACT_ADDRESSES_FILENAME;
        var contractAddressesJSON;

        try {
            contractAddressesJSON = JSON.parse(fs.readFileSync(contractAddressFilename));
        } catch (error) {
            // Test if it was a FileNotFound error
            if (error.code == 'ENOENT' && error.errno == -2) {
                // Create the file with an empty JSON object in it
                let emptyJSON = "{}";

                fs.writeFileSync(error.path, emptyJSON, (newError) => {
                    console.error("Unable to create a new JSON file at ", error.path, ": ", newError);
                    process.exit(1);
                })

                // And set the variable as well
                contractAddressesJSON = JSON.parse(emptyJSON);
            }
            else {
                // Something else happened... exit this...
                console.error(error);
                process.exit(1);
            }
        }

        if (contractAddressesJSON.hasOwnProperty(network.name)) {
            if (contractAddressesJSON[[network.name]].hasOwnProperty(contract_name)) {
                // The keys in question already exits. Add the address (its irrelevant if it is the same or a different one.)
                contractAddressesJSON[[network.name]][[contract_name]] = contract_address;
            }
            else{
                // The network exists but the contract name does not
                contractAddressesJSON[[network.name]] = {...contractAddressesJSON[[network.name]], [contract_name]: contract_address}
            }
        }
        else {
            // The whole thing is missing
            contractAddressesJSON[[network.name]] = {[contract_name]: contract_address};
        }
        
        // Write the variable back to the file
        fs.writeFileSync(contractAddressFilename, JSON.stringify(contractAddressesJSON), (error) => {
            console.error(error);
            process.exit(1);
        })

        // Print the result before exiting
        console.log(contractAddressFilename, " => ", JSON.stringify(contractAddressesJSON));
    },
    /**
     * This function retrieves the address of the contract deployed with the name provided. If no contract with that name was already deployed into
     * the network (retrievable with the proper package), the function returns 'undefined'
     * @param contract_name The name of the contract whose address is to be retrieved.
     */
    getContractAddress: (contract_name) => {
        let contractAddressesJSON;
        
        try {
            contractAddressesJSON = require(process.env.CONTRACT_ADDRESSES_FILENAME);
        }
        catch(error) {
            console.error(error);
            process.exit(1);
        }

        // Return the address of the contract. If there's none, this function returns 'undefined'
        return contractAddressesJSON[[network.name]][[contract_name]];
    },
    /**
     * This function retrieves an instance of a previously deployed smart contract.
     * @param {*} contract_name 
     * @param {*} contract_address
     * @returns  
     */
    retrieveContract: async (contract_path, contract_address) => {
        path.exists(contract_path, (exists) => {
            if (!exists) {
                console.error("Unable to retrieve a valid Solidity smart contract from '", contract_path, '"');
                process.exit(1);
            }
        });

        const contractFactory = await ethers.getContractFactory(contract_path);

        let contractInstance;

        try {
            contractInstance = contractFactory.attach(contract_address);
        } catch(error) {
            console.error(error);
            process.exit(1);
        }

        return contractInstance;
    },
    /**
     * This function wraps the whole thing together. Armed with the contract_path and contract_name (because it is possible for them to be different) and automatically deploy or
     * retrieves the contract based on its deploy status, which is detected by a retrievable value from the JSON file keeping all this information.
     * @param {*} contract_path The path to the Solidity contract (the .sol file) to process.
     * @param {*} contract_name The name of the contract to process, given that one .sol file can contain multiple contracts.
     * @param {*} constructor_args An array with the arguments expected by the contract's constructor.
     */
    processContract: async (contract_path, contract_name, constructor_args) => {
        // Start by checking if the contract in question has an address in our file aleardy

        let contractAddress = await this.getContractAddress(contract_name);
        let contractInstance;

        if (contractAddress == undefined) {
            // No contract yet deployed. Go for it
            contractInstance = await this.deployContract(contract_path, constructor_args);

            // Got the contract. Save its address and name before returning it
            this.saveContractAddress(contract_name, contractInstance.address);

            // Done. Return the instance
            return contractInstance;

        }
        else {
            // The contract is already deployed. Retrieve it with the address
            contractInstance = await this.retrieveContract(contract_path, contractAddress);

            return contractInstance;
        }
    },
    saySomething: async () => {
        console.log("This is working! Good job!");
    }
}

module.exports = { contractHelpers }