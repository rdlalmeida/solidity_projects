const RoyalPets = artifacts.require("../contracts/RoyalPets.sol");

contract("RoyalPets", function (accounts) {
    it("Should support the ERC721 and ERC2198 standards: ", async () => {
        const royalPetsInstance = await RoyalPets.deployed();
        const ERC721InterfaceId = "0x80ac58cd";
        const ERC2981InterfaceId = "0x2a55205a";

        var isERC721 = await royalPetsInstance.supportsInterface(
            ERC721InterfaceId
        );
        var isERC2981 = await royalPetsInstance.supportsInterface(
            ERC2981InterfaceId
        );

        assert.equal(isERC721, true, "RoyalPets is not an ERC721");
        assert.equal(isERC2981, true, "RoyalPets is not an ERC2981");
    });

    it("Should return the correct royalty info when specified and burned", async () => {
        const royalPetsInstance = await RoyalPets.deployed();
        await royalPetsInstance.mintNFT(accounts[0], "fakeURI");

        // Override royalty for this token to be 10% and paid to a different account
        await royalPetsInstance.mintNFTWithRoyalty(
            accounts[0],
            "fakeURI",
            accounts[1],
            1000
        );

        const defaultRoyaltyInfo = await royalPetsInstance.royaltyInfo.call(
            1,
            1000
        );
        var tokenRoyaltyInfo = await royalPetsInstance.royaltyInfo.call(
            2,
            1000
        );
        const owner = await royalPetsInstance.owner.call();

        console.log("Current owner = ", owner);

        assert.equal(
            defaultRoyaltyInfo[0],
            owner,
            "Default receiver is not the owner"
        );

        // Default royalty percentage taken should be 1%
        assert.equal(
            defaultRoyaltyInfo[1].toNumber(),
            10,
            "Royal fee is not 10"
        );
        assert.equal(
            tokenRoyaltyInfo[0],
            accounts[1],
            "Royalty receiver is not a different account"
        );

        // Default percentage taken should be 1%
        assert.equal(
            tokenRoyaltyInfo[1].toNumber(),
            100,
            "Royalty fee is not 100"
        );

        // Royalty info should be back to default when NFT is burned
        await royalPetsInstance.burnNFT(2);
        tokenRoyaltyInfo = await royalPetsInstance.royaltyInfo.call(2, 1000);
        assert.equal(
            tokenRoyaltyInfo[0],
            owner,
            "Royalty receiver has not been set back to default"
        );
        assert.equal(
            tokenRoyaltyInfo[1].toNumber(),
            10,
            "Royalty has not been set back to default"
        );
    });
});
