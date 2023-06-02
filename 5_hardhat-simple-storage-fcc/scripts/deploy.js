// imports
const { ethers, run, network } = require('hardhat');
require('dotenv').config();

// async main
async function main() {
	const SimpleStorageFactory = await ethers.getContractFactory(
		'SimpleStorage'
	);

	console.log('Deploying contract...');

	const simpleStorage = await SimpleStorageFactory.deploy();

	await simpleStorage.deployed();

	console.log(simpleStorage);
	process.exit(0);

	console.log(`Deployed contract to address ${simpleStorage.address}`);

	// Run the verification function only in live (non emulated) networks
	if (network.name == 'sepolia' && process.env.ETHERSCAN_API_KEY) {
		// Live networks typically need a while right after contract deployment to be able to "see" the contract bytecode somewhere in the chain
		// As such, add a simple waiting instruction to ensure that the contract information gets properly propagated through the network before attempting
		// to verify the contract
		await simpleStorage.deployTransaction.wait(process.env.WAIT_BLOCKS);

		// Verify the damn contract then
		await verify(simpleStorage.address, []);
	}

	// interact with the contract
	const currentValue = await simpleStorage.retrieve();
	console.log(`Current value is: ${currentValue}`);

	const transactionResponse = await simpleStorage.store(7);
	await transactionResponse.wait(process.env.WAIT_BLOCKS);

	const updatedValue = await simpleStorage.retrieve();
	console.log(`Updated value is ${updatedValue}`);
}

async function verify(contractAddress, args) {
	console.log('Verifying contract...');
	try {
		await run('verify:verify', {
			address: contractAddress,
			constructorArguments: args,
		});
	} catch (error) {
		if (error.message.toLowerCase().includes('already verified')) {
			console.log('Contract is already verified!');
		} else {
			console.error(error);
		}
	}
}

// main
main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
