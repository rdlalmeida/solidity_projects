require("dotenv").config();
// const { readFileSync, writeFileSync } = require("fs");
const fs = require("fs");
const { ethers } = require("ethers");


const contractHelpers = {
    /*
    This function reads the contract addresses to a JSON variable and verifies if there's an entry with contract_name in it, for the network provided.
    If there is, this function return the contract address associated. If not, returns an empty string instead, which can be tested to determine the
    state of deployment of the contract
    */
    deployContract: async (network, contract_json_path) => {
        let jsonContract;
        
        try{
        jsonContract = require(contract_json_path);
        } catch(error) {
            console.error(error);
            process.exit(1);
        }

        const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_API_ENDPOINT);

        const wallet = new ethers.Wallet(process.env.METAMASK_PRIV_KEY, provider);

        const contractFactory = new ethers.ContractFactory(jsonContract.abi, jsonContract.bytecode, provider)

        contractFactory.de

        // let contractObj = new ethers.BaseContract("0xAd90b8dB3a5CF06DA49F082A1c981B88AFB93b42", jsonContract.abi)
        let contractObj = new ethers.BaseContract("0xAd90b8dB3a5CF06DA49F082A1c981B88AFB93b43", jsonContract.abi)

        contractObj.attach("0xAd90b8dB3a5CF06DA49F082A1c981B88AFB93b42")
        

        console.log(contractObj)
    },

    /*
        This function creates a new entry into the contract addresses json file to try and avoid multiple deployments of the same contract (even to the local network)
        @network: the name of the network where the contract was deployed to
        @contract_name: The name of the contract
        @contract_address: The address where the contract was deployed
    */
    saveContractAddress: async (network, contract_name, contract_address) => {
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

        // Add the new entry to the JSON variable. If the variable already exists, the address is overwritten
        contractAddressesJSON[[network]] = {
            [contract_name]: contract_address
        };

        // contractAddressesJSON.push(newJSON);

        // Write the variable back to the file
        fs.writeFileSync(contractAddressFilename, JSON.stringify(contractAddressesJSON), (error) => {
            console.error(error);
            process.exit(1);
        })

        // Print the result before exiting
        console.log(contractAddressFilename, " => ", JSON.stringify(contractAddressesJSON));
        
    },
    getContractAddress: async (network, contract_name) => {
        // TODO
    },
    saySomething: async () => {
        console.log("This is working! Good job!");
    }
}

module.exports = { contractHelpers }