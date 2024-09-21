/**
 * I use this script to simplify the process of changing something in a Smart Contract. This file is for the smart contract VoteBooth.sol.
 * Every time I change something in a smart contract, I need to clean the artifacts (potentially unnecessary, but just in case...), recompile
 * the contract and redeploy every thing. My contractHelpers.js already detect and re-deploy a smart contract if needed. But I need another
 * script to automate the clean and recompile steps. This script also deletes the smart contract entry in all network entries in the
 * contract_addresses.json file to force the re-deploy as well.
 */
const { contractHelpers } = require('../../utils/contractHelper.js');
const execSync = require('child_process').execSync;

async function main() {
	let clean_project = 'yarn hardhat clean';
	let recompile_project = 'yarn hardhat compile';
	let output;

	try {
		output = execSync(clean_project, { encoding: 'utf-8' });

		console.log('Project artifacts cleaned!');

		output = execSync(recompile_project, { encoding: 'utf-8' });

		console.log('Project recompiled!');

		// Remove the address entry in the JSON file
		contractHelpers.removeContractAddress('VoteBooth');

		console.log(
			"Removed 'VoteBooth' entry from the contract addresses JSON file."
		);
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
}

main()
	.then(process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
