const Adoption = artifacts.require("../contracts/Adoption.sol");

contract("Adoption", function (accounts) {
    let adoption;
    let expectedPetId;

    before(async () => {
        adoption = await Adoption.deployed();
    });

    describe("Adopting a pet and retrieving account addresses", async () => {
        before("Adopt a pet using accounts[0]", async () => {
            await adoption.adopt(8, { from: accounts[0] });
            expectedAdopter = accounts[0];
        });

        it("Can fetch the address of an owner by pet id", async () => {
            const adopter = await adoption.adopters(8);
            assert.equal(
                adopter,
                expectedAdopter,
                "The owner of the adopted pet should be the first account!"
            );
        });

        it("Can fetch the collection of all pet owner's addresses", async () => {
            const adopters = await adoption.getAdopters();
            assert.equal(
                adopters[8],
                expectedAdopter,
                "The owner of the adopted pet should be in the collection."
            );
        });
    });
});
