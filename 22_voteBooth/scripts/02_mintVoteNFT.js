require('dotenv').config();
const hre = require('hardhat');
const { network } = require('hardhat');
const { contractHelpers } = require('../../utils/contractHelper.js');

async function main() {
	// 1. DEPLOY CONTRACT (I'm afraid this step has to happen every time)
	console.log('\n1. DEPLOY CONTRACT\n');
	let contractName = 'VoteBooth';
	let owner;
	let accounts;
	let account01, account02, account03;

	if (network.name == 'sepolia') {
		owner = process.env.SEPOLIA_ACCOUNT01;
	} else {
		accounts = await ethers.getSigners();
		owner = accounts[0].address;
	}

	let constructorArgs = [
		owner,
		process.env.ELECTION_NAME,
		process.env.ELECTION_SYMBOL,
		process.env.ELECTION_LOCATION,
		process.env.ELECTION_BALLOT,
	];

	let contractInstance, action;

	[contractInstance, action] = await contractHelpers.processContract(
		contractName,
		constructorArgs
	);

	let contractAddress = await contractInstance.getAddress();

	console.log(
		'Contract ',
		contractName,
		' was ',
		action,
		network.name,
		' network, in address ',
		contractAddress
	);

	// 2. MINT 3 VOTE NFTs TO ADDRESSES 1, 2 AND 3 FROM PROVIDER
	console.log(
		'\n2. MINT 3 VOTE NFTs TO ADDRESSES 1, 2 AND 3 FROM PROVIDER\n'
	);
	if (network.name == 'sepolia') {
		account01 = process.env.SEPOLIA_ACCOUNT02;
		account02 = process.env.SEPOLIA_ACCOUNT03;
		account03 = process.env.SEPOLIA_ACCOUNT04;
	} else {
		account01 = accounts[1].address;
		account02 = accounts[2].address;
		account03 = accounts[3].address;
	}

	// Organize the voter accounts into objects in an array to simplify processing them through loops.
	let voterAccounts = [
		{ address: [account01], id: -1 },
		{ address: [account02], id: -1 },
		{ address: [account03], id: -1 },
	];

	// Mint the token and set the id in the corresponding voter object
	for (i = 0; i < voterAccounts.length; i++) {
		voterAccounts[i].id = await contractInstance.mintVoteNFT(
			voterAccounts[i].address,
			{ from: voterAccounts[i].address }
		);

		console.log(
			"Voter '",
			voterAccounts[i].address,
			"' received token #",
			voterAccounts[i].id,
			' from contract @',
			contractAddress
		);
	}

	let ballot = await contractInstance.getBallot();

	console.log(
		'Vote Booth in ',
		process.env.ELECTION_LOCATION,
		' has minted ',
		voterAccounts.length,
		' Vote NFTs for election: '
	);
	console.log(
		process.env.ELECTION_NAME,
		' (',
		process.env.ELECTION_SYMBOL,
		'): '
	);
	console.log(ballot);

	// 3. VERIFY IF THE TOKEN WAS TRANSFERRED CORRECTLY
	console.log('\n3. VERIFY IF THE TOKEN WAS TRANSFERRED CORRECTLY\n');
	let currentAddress;

	for (i = 0; i < voterAccounts.length; i++) {
		currentAddress = await contractAddress.getVoteOwner(
			voterAccounts[i].id
		);

		if (currentAddress == voterAccounts[i].address) {
			console.log(
				'Vote NFT #',
				voterAccounts[i].id,
				' has the correct owner!'
			);
		} else {
			console.error(
				'ERROR: Vote NFT #',
				voterAccounts[i].id,
				' has onwer ',
				currentAddress,
				' but it was issued by address ',
				voterAccounts[i].address
			);
		}
	}

	// 4. DISPLAY THE CURRENT VOTE DATA IN EACH NFT
	console.log('\n4. DISPLAY THE CURRENT VOTE DATA IN EACH NFT\n');

	let currentVote;

	for (i = 0; voterAccounts.length; i++) {
		currentVote = await contractInstance.getVote(voterAccounts[i].id);

		console.log('Vote NFT#', voterAccounts[i].id, ': ', currentVote);
	}

	// 5. ALL ACCOUNTS VOTE
	console.log('\nALL ACCOUNTS VOTE\n');

	// The votes to cast
	let options = ['Eddie', 'Eddie', 'Argus'];

	for (i = 0; i < voterAccounts.length; i++) {
		if (
			await contractInstance.vote(voterAccounts[i].id, options[i], {
				from: voterAccounts[i].address,
			})
		) {
			console.error(
				'ERROR: Voter ',
				voterAccounts[i].address,
				' was not able to vote'
			);
		} else {
			console.log(
				'Voter ',
				voterAccounts[i].address,
				' voted successfully for ',
				options[i]
			);
		}
	}

	// 6. CHECK THAT THE VOTES WERE CORRECTLY CAST
	console.log('\n6. CHECK THAT THE VOTES WERE CORRECTLY CAST\n');

	for (i = 0; voterAccounts.length; i++) {
		currentVote = await contractInstance.getVote(voterAccounts[i].id);
		console.log('Vote NFT #', voterAccounts[i].id, ': ', currentVote);
	}

	// 7. CHANGE VOTE FROM VOTER #3
	console.log('\n7. CHANGE VOTE FROM VOTER #3\n');

	// Change the vote to a bastardization of Argus, on purpose, to be able to see the difference
	let newOption = 'Argo';
	if (
		(await contractInstance.vote(voterAccounts[1].id),
		newOption,
		{ from: account02 })
	) {
		console.error(
			'ERROR: Voter ',
			voterAccounts[i].address,
			' was not able to change the vote.'
		);
	} else {
		console.log(
			'Voter ',
			voterAccounts[i].address,
			' changed the vote successfully to ',
			newOption
		);
	}

	// 8. VERIFY THE CHANGE WAS SUCCESSFUL
	console.log('\n8. VERIFY THE CHNAGE WAS SUCCESSFUL\n');

	currentVote = await contractInstance.getVote(voterAccounts[1].id);

	console.log(
		'Voter ',
		voterAccounts[i].address,
		' current vote: ',
		currentVote
	);

	// 9. TRY TO CHANGE VOTE NFT #1 WITHOUT BEING THE OWNER (VOTER #3)
	console.log(
		'\n9. TRY TO CHANGE VOTE NFT #1 WITHOUT BEING THE OWNER (VOTER #3)\n'
	);

	try {
		// Try to change Vote NFT #1 but signing this with voter #3. Should blow up
		await contractInstance.vote(voterAccounts[0].id, newOption, {
			from: voterAccounts[2].address,
		});
	} catch (error) {
		// Print out the error but don't exit
		console.error('ERROR: Unable to change the vote for NFT:');
		console.error(error);
	}

	// 10. VERIFY THAT VOTE NFT #1 WAS NOT CHANGED WITH THE PREVIOUS OPERATION
	console.log(
		'\n10. VERIFY THAT VOTE NFT #1 WAS NOT CHANGED WITH THE PREVIOUS OPERATION\n'
	);

	currentVote = await contractInstance.getVote(voterAccounts[0].id);

	console.log(
		'Voter ',
		voterAccounts[0].address,
		' current vote: ',
		currentVote
	);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
