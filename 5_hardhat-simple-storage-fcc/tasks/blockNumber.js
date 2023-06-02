const { task } = require('hardhat/config');

task(
	'block-number',
	"Print the configured network's current block number, i.e., the number of the block at the top of the chain"
).setAction(async (taskArgs, hre) => {
	const blockNumber = await hre.ethers.provider.getBlockNumber();
	console.log(`Current block number: ${blockNumber}`);
});
