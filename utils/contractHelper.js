require('dotenv').config({
	path: '/home/ricardoalmeida/github_projects/solidity_projects/utils/.env',
});
// const { readFileSync, writeFileSync } = require("fs");
const fs = require('fs');
const { ethers, run, network } = require('hardhat');

const CONTRACT_ADDRESSES_FILENAME = process.env.CONTRACT_ADDRESSES_FILENAME;

/**
 * This function reads the contract addresses to a JSON variable and verifies if there's an entry with contract_name in it, for the network provided.
 * If there is, this function return the contract address associated. If not, returns an empty string instead, which can be tested to determine the
 * state of deployment of the contract
 *
 * @param {*} contract_name  The name of the contract to be deployed. If this function is called from within a hardhat project, this thing is smart enough
 *                           to figure out which files to get and where they are.
 * @param {*} constructor_args An array with the arguments, if any, expected by the constructor.
 * @returns If successful, the function returns a contract instance.
 */
var deployContract = async (contract_name, constructor_args) => {
	var contractFactory;

	try {
		contractFactory = await ethers.getContractFactory(contract_name);
	} catch (error) {
		console.error(error);
		process.exit(1);
	}

	console.log("Deploying '", contract_name, "'...");

	let contractInstance;

	try {
		contractInstance = await contractFactory.deploy(...constructor_args);
		await contractInstance.waitForDeployment();
	} catch (error) {
		console.error(error);
		process.exit(1);
	}

	if (network.name == 'sepolia' && process.env.ETHERSCAN_API_KEY) {
		await contractInstance.deployTransaction.wait(process.env.WAIT_BLOCKS);

		await verify(contractInstance.address, []);
	}

	return contractInstance;
};

/**
 * This function run the verify function from the Etherscan portal. What this does is to upload the code of the contract, of sorts, so that it
 * can be displayed in the portal.
 * @param contractAddress The address (string) of the contract to verify.
 * @param contructorArgs An array with the arguments, if any, expected by the constructor.
 */
var verify = async (contractAddress, constructorArgs) => {
	console.log('Verifying contract...');

	try {
		await run('verify:verify', {
			address: contractAddress,
			constructorArguments: constructorArgs,
		});

		console.log(
			'Contract at ',
			contractAddress,
			" was verified in '",
			network.name,
			"' network."
		);
	} catch (error) {
		if (error.message.toLowerCase().includes('already verified')) {
			console.log(
				'Contract at ',
				contractAddress,
				' is already verified!'
			);
		} else {
			console.error(error);
		}
	}
};

/**
 * This function creates a new entry into the contract addresses json file to try and avoid multiple deployments of the same contract (even to the local network)
 * @param contract_name The name of the contract
 * @param contract_address: The address where the contract was deployed
 */
var saveContractAddress = (contract_name, contract_address) => {
	let contractAddressFilename = CONTRACT_ADDRESSES_FILENAME;
	var contractAddressesJSON;

	try {
		contractAddressesJSON = JSON.parse(
			fs.readFileSync(contractAddressFilename)
		);
	} catch (error) {
		// Test if it was a FileNotFound error
		if (error.code == 'ENOENT' && error.errno == -2) {
			// Create the file with an empty JSON object in it
			let emptyJSON = '{}';

			fs.writeFileSync(error.path, emptyJSON, (newError) => {
				console.error(
					'Unable to create a new JSON file at ',
					error.path,
					': ',
					newError
				);
				process.exit(1);
			});

			// And set the variable as well
			contractAddressesJSON = JSON.parse(emptyJSON);
		} else {
			// Something else happened... exit this...
			console.error(error);
			process.exit(1);
		}
	}

	if (contractAddressesJSON.hasOwnProperty(network.name)) {
		if (
			contractAddressesJSON[[network.name]].hasOwnProperty(contract_name)
		) {
			// The keys in question already exits. Add the address (its irrelevant if it is the same or a different one.)
			contractAddressesJSON[[network.name]][[contract_name]] =
				contract_address;
		} else {
			// The network exists but the contract name does not
			contractAddressesJSON[[network.name]] = {
				...contractAddressesJSON[[network.name]],
				[contract_name]: contract_address,
			};
		}
	} else {
		// The whole thing is missing
		contractAddressesJSON[[network.name]] = {
			[contract_name]: contract_address,
		};
	}

	// Write the variable back to the file
	fs.writeFileSync(
		contractAddressFilename,
		JSON.stringify(contractAddressesJSON),
		(error) => {
			console.error(error);
			process.exit(1);
		}
	);

	// Print the result before exiting
	console.log(
		contractAddressFilename,
		' => ',
		JSON.stringify(contractAddressesJSON)
	);
};

/**
 * This function retrieves the address of the contract deployed with the name provided. If no contract with that name was already deployed into
 * the network (retrievable with the proper package), the function returns 'undefined'
 * @param contract_name The name of the contract whose address is to be retrieved.
 */
var getContractAddress = (contract_name) => {
	let contractAddressesJSON;

	try {
		contractAddressesJSON = require(CONTRACT_ADDRESSES_FILENAME);
	} catch (error) {
		if (error.code == 'MODULE_NOT_FOUND') {
			// In this situation, the json file hasn't been created yet, which also means that there are no
			// contracts deployed in the network yet, which means that this function is always going to return
			// 'undefined'. As for the creation of the json file, the saveContractAddress function is going to
			// deal with that
			return undefined;
		} else {
			// If the error code is different, something else must have happened. Proceed with normal error dealing
			console.error(error);
			process.exit(1);
		}
	}

	// Return the address of the contract. If there's none, this function returns 'undefined'
	if (contractAddressesJSON.hasOwnProperty(network.name)) {
		if (
			contractAddressesJSON[[network.name]].hasOwnProperty(contract_name)
		) {
			return contractAddressesJSON[[network.name]][[contract_name]];
		}
	}
	return undefined;
};

/**
 * This function retrieves an instance of a previously deployed smart contract.
 * @param {*} contract_name
 * @param {*} contract_address
 * @returns
 */
var retrieveContract = async (
	contract_address,
	contract_name,
	constructor_args
) => {
	let contractInstance;
	let contractFactory;
	try {
		// contractInstance = await ethers.getContractAt(contract_address);
		contractFactory = await ethers.getContractFactory(contract_name);

		contractInstance = await contractFactory.attach(contract_address);
	} catch (error) {
		/*
            In this case, there's a possibility that I'm running a local network that has been reset in the meantime. This means
            that all contracts deployed into the local network are gone, but the record of their previous address is still around.
            No matter. I only have to do this every "session", i.e., whenever the local network gets restarted (I'm not able to
            set any kind of permanence to the hardhat network yet) and only for the local hardhat network
        */
		if (
			error._isHardhatError &&
			error.name == 'HardhatError' &&
			error.number == 700
		) {
			// The error defined by the parameters above is the type of error that happens when the contract is not found
			//(needs re-deployment)
			try {
				contractInstance = await deployContract(
					contract_name,
					constructor_args
				);

				// Update the contract address in the JSON file
				let contractAddress = await contractInstance.getAddress();

				saveContractAddress(contract_name, contractAddress);
			} catch (error) {
				console.error(error);
				process.exit(1);
			}
		} else {
			// Something else has happened. Raise the error caught
			console.error(error);
			process.exit(1);
		}
	}

	return contractInstance;
};

/**
 * This function wraps the whole thing together. Armed with the contract_path and contract_name (because it is possible for them to be different) and automatically deploy or
 * retrieves the contract based on its deploy status, which is detected by a retrievable value from the JSON file keeping all this information.
 * @param {*} contract_path The path to the Solidity contract (the .sol file) to process.
 * @param {*} contract_name The name of the contract to process, given that one .sol file can contain multiple contracts.
 * @param {*} constructor_args An array with the arguments expected by the contract's constructor.
 */
var processContract = async (contract_name, constructor_args) => {
	// Start by checking if the contract in question has an address in our file aleardy

	let contractAddress = await getContractAddress(contract_name);
	let contractInstance;

	if (contractAddress == undefined) {
		// No contract yet deployed. Go for it
		contractInstance = await deployContract(
			contract_name,
			constructor_args
		);

		// Got the contract. Save its address and name before returning it
		let contractAddress = await contractInstance.getAddress();

		saveContractAddress(contract_name, contractAddress);

		// Done. Return the instance
		return [contractInstance, 'deployed into'];
	} else {
		// The contract is already deployed. Retrieve it with the address
		contractInstance = await retrieveContract(
			contractAddress,
			contract_name,
			constructor_args
		);

		return [contractInstance, 'retrieved from'];
	}
};

var saySomething = async () => {
	console.log('This is working! Good job!');
};

const contractHelpers = {
	deployContract,
	getContractAddress,
	saveContractAddress,
	retrieveContract,
	processContract,
	verify,
	saySomething,
};

module.exports = { contractHelpers };
