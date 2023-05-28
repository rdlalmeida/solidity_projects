const ethers = require('ethers');
const fs = require('fs-extra');
require('dotenv').config();

const environment = process.env.CURRENT_ENVIRONMENT;

async function main() {
	var private_key = null;
	var password = null;
	var encryptedKeyFileName = null;

	if (environment == 'local') {
		console.log(`Configuring ${environment} environment..`);
		private_key = process.env.LOCAL_PRIVATE_KEY;
		password = process.env.LOCAL_PRIVATE_KEY_PASSWORD;
		encryptedKeyFileName = process.env.LOCAL_ENCRYPTED_KEY_FILENAME;
	} else if (environment == 'sepolia') {
		console.log(`Configuring ${environment} environment...`);
		private_key = process.env.SEPOLIA_PRIVATE_KEY;
		password = process.env.SEPOLIA_PRIVATE_KEY_PASSWORD;
		encryptedKeyFileName = process.env.SEPOLIA_ENCRYPTED_KEY_FILENAME;
	} else {
		console.error(
			`Unable to configure environment '${environment}'! Exiting...`
		);
		process.exit(1);
	}

	const wallet = new ethers.Wallet(private_key);
	const encryptedJsonKey = await wallet.encryptSync(password, private_key);

	console.log(encryptedJsonKey);

	fs.writeFileSync(`./${encryptedKeyFileName}`, encryptedJsonKey);

	console.log(`Encrypted key stored in .\\${encryptedKeyFileName}`);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
