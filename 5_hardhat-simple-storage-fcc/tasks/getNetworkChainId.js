const { task } = require('hardhat/config');

task(
	'chain-id',
	'Retrieves and prints the configured network chainID value'
).setAction(async (taskArgs, hre) => {
	const network = await hre.ethers.provider.getNetwork();
	console.log(`Chain ID for network ${network.name}: ${network.chainId}`);
});
