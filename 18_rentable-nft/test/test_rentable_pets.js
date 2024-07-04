require("@openzeppelin/test-helpers/configure")({
    provider: web3.currentProvider,
    singletons: {
        abstraction: "truffle",
    },
});

const {
    constants,
    expectRevert,
    expectEvent,
} = require("@openzeppelin/test-helpers");
const RentablePets = artifacts.require("RentablePets");

contract("RentablePets", function (accounts) {
    {
        it("Should support the ERC721 and ERC4907 standards", async () => {
            const rentablePetsInstance = await RentablePets.deployed();
            const ERC721InterfaceId = "0x80ac58cd";
            const ERC4907InterfaceId = "0xad092b5c";

            var isERC721 = await rentablePetsInstance.supportsInterface(
                ERC721InterfaceId
            );
            var isERC4907 = await rentablePetsInstance.supportsInterface(
                ERC4907InterfaceId
            );

            assert.equal(isERC721, true, "RentablePets is not an ERC721");
            assert.equal(isERC4907, true, "RentablePets is not an ERC4907");
        });

        it("Should not set UserInfo if not the owner", async () => {
            const rentablePetsInstance = await RentablePets.deployed();
            const expirationDatePast = 1660252958; // 8 August 2022
            await rentablePetsInstance.mint("fakeURI"); // tokenId = 1
            // Failed require in function
            await expectRevert(
                rentablePetsInstance.setUser(
                    1,
                    accounts[1],
                    expirationDatePast,
                    { from: accounts[1] }
                ),
                "ERC721: transfer caller is not owner nor approved"
            );

            // Assert no UserInfo for NFT
            var user = await rentablePetsInstance.userOf.call(1);
            var date = await rentablePetsInstance.userExpires.call(1);

            await assert.equal(
                user,
                constants.ZERO_ADDRESS,
                "NFT user is not zero address"
            );
            assert.equal(date, 0, "NFT expiration date is not 0");
        });

        it("Should return the correct UserInfo", async () => {
            const rentablePetsInstance = await RentablePets.deployed();
            const expirationDatePast = 1660252958; // 8 August 2022
            const expirationDateFuture = 4121727755; // 11 August 2100
            await rentablePetsInstance.mint("fakeURI"); // tokenId = 2
            await rentablePetsInstance.mint("fakeURI"); // tokenId = 3

            // Set and get userInfo
            var expiredTx = await rentablePetsInstance.setUser(
                2,
                accounts[1],
                expirationDatePast
            );

            var unexpiredTx = await rentablePetsInstance.setUser(
                3,
                accounts[2],
                expirationDateFuture
            );

            var expiredNFTUser = await rentablePetsInstance.userOf.call(2);
            var expiredNFTDate = await rentablePetsInstance.userExpires.call(2);
            var unexpiredNFTUser = await rentablePetsInstance.userOf.call(3);
            var unexpiredNFTDate = await rentablePetsInstance.userExpires.call(
                3
            );

            // console.log("expiredNFTUser: ", expiredNFTUser);
            // console.log("expiredNFTDate: ", expiredNFTDate.toString());
            // console.log("unexpiredNFTUser: ", unexpiredNFTUser);
            // console.log("unexpiredNFTDate: ", unexpiredNFTDate.toString());

            // Assert UserInfo and event transmission
            // This one should be address(0) because the NFT is expired. NOTE: The associated UserInfo struct still has accounts[1] set as the user. Its the function
            // that returns the user that, detecting an expired date, returns address(0) instead.
            assert.equal(
                expiredNFTUser,
                constants.ZERO_ADDRESS,
                "Expired NFT has wrong user"
            );
            assert.equal(
                expiredNFTDate, // This one should be the expired date defined above. The NFT is expired but that should not change the date parameter in the related UserInfo
                expirationDatePast,
                "Expired NFT has wrong expiration date"
            );

            // This one simply tests if the UpdateUser event was raised and has the parameters defined (tokenId=2, user=accounts[1],...)
            expectEvent(expiredTx, "UpdateUser", {
                tokenId: "2",
                user: accounts[1],
                expires: expirationDatePast.toString(),
            });

            // This one should be OK to. Again, as before, the user set in the corresponding UserInfo is indeed accounts[2]. But the userOf function, upon detecting
            // an unexpired date, returns the actual user instead of address(0).
            assert.equal(
                unexpiredNFTUser,
                accounts[2],
                "Expired NFT has wrong user"
            );

            // This one is trivial
            assert.equal(
                unexpiredNFTDate,
                expirationDateFuture,
                "Expired NFT has wrong expiration date"
            );

            // This one checks if the corresponding Event was thrown
            expectEvent(unexpiredTx, "UpdateUser", {
                tokenId: "3",
                user: accounts[2],
                expires: expirationDateFuture.toString(),
            });

            // Burn NFT
            // The burn function essentially "transfers" the NFT to address(0), which essentially removes it from circulation
            unexpiredTx = await rentablePetsInstance.burn(3);

            // Assert UserInfo was deleted
            unexpiredNFTUser = await rentablePetsInstance.userOf.call(3);
            unexpiredNFTDate = await rentablePetsInstance.userExpires.call(3);

            assert.equal(
                unexpiredNFTUser,
                constants.ZERO_ADDRESS,
                "NFT user is not zero address"
            );
            assert.equal(unexpiredNFTDate, 0, "NFT expiration date is not 0");
            expectEvent(unexpiredTx, "UpdateUser", {
                tokenId: "3",
                user: constants.ZERO_ADDRESS,
                expires: "0",
            });
        });
    }
});
