const RoyalPets = artifacts.require("RoyalPets");

/*
* uncomment accounts to access the test accounts made available by the
* Ethereum client
* See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
*/
contract("RoyalPets", function (accounts) {
	it("should assert true", async () => {
		const royalPetsInstance = await RoyalPets.deployed();
		const ERC721InterfaceId = "0x80ac58cd";
		const ERC2981InterfaceId = "0x2a55205a";

		var isERC721 = await royalPetsInstance.supportsInterface(ERC721InterfaceId);
		var isERC2981 = await royalPetsInstance.supportsInterface(ERC2981InterfaceId);

		assert.equal(isERC721, true, "RoyalPets is not an ERC721");
		assert.equal(isERC2981, true, "RoyalPets is not an ERC2981");

	// await RoyalPets.deployed();
	// return assert.isTrue(true);
	});

	it("should return the correct royalty info when specified and burned", async () => {
		const royalPetsInstance = await RoyalPets.deployed();
		await royalPetsInstance.mintNFT(accounts[0], "fakeURI");
		
		await royalPetsInstance.mintNFTWithRoyalty(accounts[0], "fakeURI", accounts[1], 1000);

		const defaultRoyaltyInfo = await royalPetsInstance.royaltyInfo.call(1, 1000);
		var tokenRoyaltyInfo = await royalPetsInstance.royaltyInfo.call(2, 1000);
		const owner = await royalPetsInstance.owner.call();

		assert.equal(defaultRoyaltyInfo[0], owner, "Default receiver is not the owner");

		// Check if the default royalty percentage is 1%
		assert.equal(defaultRoyaltyInfo[1].toNumber(), 10, "Royalty fee is not 10 (1%)");
		assert.equal(tokenRoyaltyInfo[0], accounts[1], "Royalty receiver is not a different account");

		// Default royalty percentage taken should be 10%
		assert.equal(tokenRoyaltyInfo[1].toNumber(), 100, "Royalty fee is not 100 (10%)");

		// Royalty info should be set back to default when NFT is burned
		await royalPetsInstance.burnNFT(2);
		tokenRoyaltyInfo = await royalPetsInstance.royaltyInfo.call(2, 1000);
		assert.equal(tokenRoyaltyInfo[0], owner, "Royalty receiver has not been set back to default.");
		assert.equal(tokenRoyaltyInfo[1].toNumber(), 10, "Royalty has not been set back to default.");
	});
});
