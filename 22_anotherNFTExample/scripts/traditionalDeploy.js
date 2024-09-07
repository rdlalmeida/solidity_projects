require('dotenv').config();
const hre = require('hardhat');
const ethers = hre.ethers;

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
// const { ethers, run, network } = require("hardhat");

async function _main() {
	try {
		let accounts = await ethers.getSigners();
		initialOwner = accounts[0].address;

		const contractFactory = await ethers.getContractFactory('AnotherNFT');

		let constructorArgs = [initialOwner, 'AnotherNFT', 'ANFT'];

		const contractInstance = await contractFactory.deploy(
			...constructorArgs
		);
		await contractInstance.waitForDeployment();
		let contractAddress = await contractInstance.getAddress();

		console.log('Contract deployed to address ', contractAddress);

		// let contractFunction1 = await contractInstance.getFunction("getMessage");
		// let contractFunction2 = await contractInstance.getFunction("getNumber");

		// let message = await contractFunction1();
		// let number = await contractFunction2();

		// console.log("Constructor message: ", message);
		// console.log("Constructor number: ", Number(number));
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
}

async function main() {
	/**
	 * NOTE: I need to provide an ABSOLUTE path to the contract for this shit to work!! Why? First, fucking javascript doesn't do relative paths, unlike every
	 * other decent programming language out there. So there's that to start.
	 * Second, they did a puny and pathetic attempt at solving this issue by providing the path.resolve function that was supposed to convert a relative path
	 * (../contracts/AnotherNFT.sol) into its absolute equivalent (home/ricardoalmeida/github_projects/solidity_projects/22_AnotherNFTExample/contracts/AnotherNFT.sol).
	 * But because Javascript is absolutely shit, and node.js is equally or even worse than that one, it turns out that the resolve function has a bug and by some
	 * retarded reason, it decides to omit a folder here and there from the absolute path output! In the example used, in this case, the resolve function "forgets" the
	 * '22_AnotherNFTExample' folder. Why? Who the fuck knows... All I know is that this is completely useless and moronic.
	 * So, what's the solution?
	 * Like a caveman, I have to provide the ABSOLUTE path as initial argument or this whole shit does not work...
	 * EDIT: Forget it... It turns out that it is the contract name that this thing is needs to work. But this rant still stands. Javascript is the worst language in the
	 * whole freakin world!
	 */
	let contractName = 'AnotherNFT';

	let initialOwner;

	if (network.name == 'sepolia') {
		initialOwner = process.env.METAMASK_SEPOLIA_ACCOUNT;
	} else {
		let accounts = await ethers.getSigners();

		initialOwner = accounts[0].address;
	}

	let constructorArguments = [initialOwner, contractName, 'ANFT'];

	let contractInstance;
	try {
		[contractInstance, action] = await contractHelpers.processContract(
			contractName,
			constructorArguments
		);
	} catch (error) {
		console.error(error);
		process.exit(1);
	}

	let contractAddress = await contractInstance.getAddress();

	console.log(
		'Contract ',
		contractName,
		' was ',
		action,
		network.name,
		"' network, in address ",
		contractAddress
	);

	await contractHelpers.verify(contractAddress, constructorArguments);

	console.log('Done!');
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
