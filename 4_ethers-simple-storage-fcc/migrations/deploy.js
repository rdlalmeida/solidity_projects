const ethers = require('ethers');
const fs = require('fs-extra');
// NOTE: My .env file is a level above the migrations folder, from where I'm running this code, so I need to provide
// the path for the dotenv module to read the environment variables file
require('dotenv').config({ path: '../.env' });

const environment = process.env.CURRENT_ENVIRONMENT;
let endpoint = null;
let encryptedKeyFileName = null;
let password = null;

if (environment == 'local') {
	endpoint = process.env.LOCAL_ENDPOINT;
	encryptedKeyFileName = process.env.LOCAL_ENCRYPTED_KEY_FILENAME;
	password = process.env.LOCAL_PRIVATE_KEY_PASSWORD;
} else if (environment == 'sepolia') {
	endpoint = process.env.SEPOLIA_ENDPOINT;
	encryptedKeyFileName = process.env.SEPOLIA_ENCRYPTED_KEY_FILENAME;
	password = process.env.SEPOLIA_PRIVATE_KEY_PASSWORD;
}

async function main() {
	// http://localhost:7545
	// Set up the local Ganache server in http://localhost:7545 as the main blockchain provider
	// const provider = new ethers.providers.JsonRpcProvider(endpoint);
	const provider = new ethers.JsonRpcProvider(endpoint);

	// And import one of its accounts into a Wallet instance

	// This was the "old" way, where I had an unencrypted private key stored in a .env file
	// const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

	// This is the "new" way in which I have produced a .encryptedKey.json file with the sensible data present in
	// the .env file and, since then, "deleted" that sensible information (was only commented out for this purpose)
	const encryptedJson = fs.readFileSync(
		'../'.concat(encryptedKeyFileName),
		process.env.ENCODING
	);

	let wallet = ethers.Wallet.fromEncryptedJsonSync(encryptedJson, password);

	wallet = await wallet.connect(provider);

	// Read the abi file contents to a constant
	const abi = fs.readFileSync(
		'../build/SimpleStorage_sol_SimpleStorage.abi',
		process.env.ENCODING
	);

	const bk = await provider.getBlock();

	// console.log("Provider gas price: ", net.gasPrice);
	// console.log("Block gas limit: ", bk.gasLimit);
	// process.exit(0);

	// Repeat the process to the bin file
	const bin = fs.readFileSync(
		'../build/SimpleStorage_sol_SimpleStorage.bin',
		process.env.ENCODING
	);

	// CONTRACT DEPLOYMENT, THE EASY WAY
	// Create a contract factory object based on the bin and abi info of the contract and associate it with the wallet
	// instance, which essentially means that any gas required to deploy the contracts from this factory are coming from
	// the associated wallet
	const contractFactory = new ethers.ContractFactory(abi, bin, wallet);
	console.log('Deploying... please wait...');

	// const contractDeployed = await contractFactory.

	// Deploy the contract
	const contract = await contractFactory.deploy();

	// Wait 1 block before attempting to grab the transaction receipt
	await contract.deploymentTransaction().wait(1);
	let address = await contract.getAddress();

	console.log(`Contract deployed in address ${address}`);

	// console.log("Transaction receipt = ", transactionReceipt);

	/*

    USE THIS TO DEPLOY A CONTRACT THE HARD WAY

    console.log("Let's deploy with only transaction data!");

    // Get the latest block object in the provider instance
    const block = await provider.getBlock();

    // Get the fee data from the provider instance to retrieve the current gas price
    const feeData = await provider.getFeeData();

    // Get the network instance to retrieve yet another set of parameters to populate the rest of the transaction struct
    const network = await provider.getNetwork();

    // Prepare the unsigned transaction as a struct
    const tx = {
        // Set the transaction number to the next nonce in the sequence by retrieving the current block number and increment it by 1
        nonce: block.number++,
        gasPrice: Number(feeData.gasPrice),
        gasLimit: Number(block.gasLimit),
        // Contract creation transaction, thus no target for now (to: null)
        to: null,
        // Same logic with the value
        value: 0,
        data: "0x".concat(bin),
        chainId: Number(network.chainId),
    };

    const txResponse = await wallet.sendTransaction(tx);

    console.log("transaction response: ", txResponse);

    // Sign the transaction above with the configured wallet
    // const signedTxResponse = await wallet.signTransaction(tx);

    // console.log(signedTxResponse);

    // Send the transaction
    // provider.send(signedTxResponse);
    
    */

	// CONTRACT INTERACTION
	const currentFavoriteNumber = await contract.retrieve();
	console.log('Favorite number = ', Number(currentFavoriteNumber));

	const txResponse = await contract.store('7');
	const txReceipt = await txResponse.wait(1);
	const updatedFavoriteNumber = await contract.retrieve();

	console.log(`New favorite number is ${Number(updatedFavoriteNumber)}`);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
