const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")

describe("FundMe", async function () {
    let fundMeInstance
    let fundMeContract
    let networkProvider
    let deployer
    let mockV3AggregatorInstance
    let mockV3AggregatorContract
    let fundMeHelperInstance
    let fundMeHelperContract
    let signer

    // Set 1 ETH as test value for transacting stuff
    const sendValue = ethers.parseEther("10")

    beforeEach(async function () {
        // Deploy our FundMe contract using Hardhat-deploy
        // The "fixture" function enables a whole folder of file to be run automatically. This is very useful for deployment
        // and testing purposes. NOTE: The function takes and array of tags that can be used to regulate these executions.

        // Alternative ways to get the signer accounts
        // const accounts = await ethers.getSigners()
        // const accountZero = accounts[0]

        /* 
            NOTE: 
            
            const namedAccounts = await getNamedAccounts()
            namedAccounts = { deployer: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'}

            The output of the function 'getNamedAccounts' is a dictionary with an entry for every named account returned, whose
            value is the address of that account
            After this, doing

            const deployer = (await getNamedAccounts()).deployer = namedAccounts.deployer = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'

            I.e., the 'deployer' variable is actually the address of the deployer account!
        */

        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        accounts = await getNamedAccounts()

        // NOTE: The two lines bellow don't work because, as it is normal by now, the 'ethers' lib doesn't have the
        // getContract function anymore. Bellow them are the "newest" correct way to retrieve a compiled contract
        // ----------------------------------------------------------------------------------------------------------
        // fundMe = await ethers.getContract("FundMe", deployer)
        // mockV3Aggregator = await ethers.getContract(
        //     "MockV3Aggregator",
        //     deployer
        // )
        // ----------------------------------------------------------------------------------------------------------

        // Get the contract information (but not the contract itself!) into the fundMeInstance variable
        fundMeInstance = await deployments.get("FundMe")
        // Use this information to "rebuilt" the contract
        fundMeContract = await ethers.getContractAt(
            fundMeInstance.abi,
            fundMeInstance.address
        )

        mockV3AggregatorInstance = await deployments.get("MockV3Aggregator")
        mockV3AggregatorContract = await ethers.getContractAt(
            mockV3AggregatorInstance.abi,
            mockV3AggregatorInstance.address
        )

        fundMeHelperInstance = await deployments.get("FundMeHelper")
        fundMeHelperContract = await ethers.getContractAt(
            fundMeHelperInstance.abi,
            fundMeHelperInstance.address
        )

        // Get the network provider and the signer object that is currently associated to the deployer address
        networkProvider = ethers.provider
        signer = await networkProvider.getSigner()

        // This one works...
        // fallBackValue = BigInt(Number(ethers.WeiPerEther) * 1.3)

        // console.log("Fallback value = ", fallBackValue, " wei")
    })

    describe("constructor", async function () {
        it("sets the aggregator addresses correctly", async function () {
            const response = await fundMeContract.priceFeed()
            assert.equal(response, mockV3AggregatorInstance.address)
        })
    })

    describe("fund", async function () {
        it("fails if you don't send enough ETH", async function () {
            await expect(
                fundMeContract.fund({ gas: 22000 })
            ).to.be.revertedWithCustomError(
                fundMeContract,
                "FundMe__NotEnoughETH"
            )
        })

        it("updates the amount funded data structure", async function () {
            await fundMeContract.fund({ value: sendValue })
            const response = await fundMeContract.addressToAmountFunded(
                // NOTE: the addressToAmountFunded is a public address => uint256 mapping, to its 'function' requires an
                // address as argument. As I've stated above, the deployer variable is actually the address of the deployer
                // account, hence why I'm passing it as is.
                deployer
            )
            assert.equal(response.toString(), sendValue.toString())
        })

        it("Adds founder to array of founders", async function () {
            await fundMeContract.fund({ value: sendValue })

            const founder = await fundMeContract.founders(0)

            assert.equal(founder, deployer)
        })
    })

    describe("withdraw", async function () {
        let gasCost
        beforeEach(async function () {
            const tx = await fundMeContract.fund({ value: sendValue })
        })

        it("should fail and revert with a custom error if contract funded with invalid value", async function () {
            // Try to fund the contract with a value less than the minimum (0.5 ETH)
            const minValue = ethers.parseEther("0.2")
            await expect(
                fundMeHelperContract.initialFund({
                    from: deployer,
                    value: minValue,
                })
            ).to.be.revertedWithCustomError(
                fundMeHelperContract,
                "FundMeHelper__InvalidFunds"
            )

            // const helperBalance = await networkProvider.getBalance(
            //     fundMeHelperInstance.address
            // )

            // console.log("Helper contract balance: ", helperBalance.toString())
        })

        it("should fund the helper contract properly", async function () {
            // Fund the contract with a proper value this time
            const fundValue = ethers.parseEther("1.2")

            // Fund the helper contract
            await fundMeHelperContract.initialFund({
                from: deployer,
                value: fundValue,
            })

            // Get the balance of the helper contract from the current network provider
            const fundMeHelperBalance = await networkProvider.getBalance(
                fundMeHelperInstance.address
            )

            // Check that the balance matches the transferred value
            assert.equal(fundValue.toString(), fundMeHelperBalance.toString())
        })

        it("withdraw ETH from a single founder", async function () {
            // Arrange
            const startingFundMeBalance = await networkProvider.getBalance(
                fundMeInstance.address
            )
            const startingDeployerBalance = await networkProvider.getBalance(
                deployer
            )

            // Act
            const transactionResponse = await fundMeContract.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)

            const gasUsed = Number(transactionReceipt.gasUsed.toString())
            const gasPrice = Number(transactionReceipt.gasPrice.toString())

            // The lines above are equivalent to:
            // const { gasUsed, gasPrice } = transactionReceipt
            // But this implies that we already know the existence of these properties

            // Calculate the gas cost, as a number
            const gasCost = gasUsed * gasPrice

            // And keep this one around as a BigInt
            const gasCostBN = BigInt(gasCost)

            const endingFundMeBalance = await networkProvider.getBalance(
                fundMeInstance.address
            )
            const endingDeployerBalance = await networkProvider.getBalance(
                deployer
            )
            // Assert
            // The contract balance should be higher in the beginning than at the end
            // assert.isAbove(startingFundMeBalance, endingFundMeBalance)
            // While the deployer balance should be the other way around
            // assert.isBelow(startingDeployerBalance, endingDeployerBalance)

            // The following asserts imply a correct calculation of the total gas spent so far
            assert.equal(
                startingFundMeBalance + startingDeployerBalance,
                endingDeployerBalance + gasCostBN
            )

            // The contract balance should be 0 after the withdrawal
            assert.equal(endingFundMeBalance, 0)
        })

        it("reverts transaction with the correct custom error code", async function () {
            // To test this I need to, somehow, trigger the withdraw function in such a way that it does everything right
            // besides the final call, which should fail somehow to trigger the desired error

            // Try to withdraw the funds from the main contract to the helper contract. Should fail since the helper contract
            // does not have a receive function (did it on purpose to test this)
            await expect(
                fundMeHelperContract.helperWithdraw()
            ).to.be.revertedWithCustomError(
                fundMeContract,
                "FundMe__CallFailed"
            )
        })
    })

    describe("fallback", async function () {
        it("should invoke the fallback function when a non-existent function is attempted", async function () {
            // Inject a 'fake' function into the Helper contract so that I can call it and provoke the invocation of the fallback one
            // const fakeDemoContract = new ethers.Contract(
            //     fundMeHelperInstance.address,
            //     [
            //         ...fundMeHelperContract.inter
            //     ]
            // )

            // Extract the current abi for the helper contract. This is but an array describing, using JSON, the various
            // elements of the contract (variables, functions, events, etc.)
            var current_abi = await fundMeInstance.abi

            // Let's hijack the helper contract by inject a fake function into its abi. The fake function was created by adapting
            // the entry for an existing one
            const fakeFunction = {
                inputs: [],
                name: "functionFakeAsFuck",
                outputs: [],
                stateMutability: "payable",
                type: "function",
            }

            // Add the fake function to the helper's contract abi. From the abi standpoint, there's no way for it to determine that
            // the function does not exists in the real contract. This is necessary to "clear" things from hardhat's side. It's too
            // clever as it is: if I try to call a function that does not exists in the configured abi, it throws a high level
            // exception and stops the process way before it gets to the point where the fallback function can be called.
            // As such I need to "trick" hardhat by creating a fake abi just to do that one fake call
            const fake_abi = current_abi.push(fakeFunction)

            // To build the fake Contract I also need to provide a valid signer object (its an Hardhat thing) to the
            // contract constructor. As always, get the current signer (associated to the deployer address) and provide
            // it to the contract constructor later on. I've set the signer object back in the beforeEach block

            // Create a fake contract representation (using ethers) using the fake abi and the same address as the helper contract
            const fakeContract = new ethers.Contract(
                fundMeInstance.address,
                [...current_abi, fakeFunction],
                signer
            )

            // console.log("Original contract: ", fundMeHelperContract)
            // console.log("Fake contract: ", fakeContract)

            // Call the fake function and listen to the event emitted when the fallback function is called
            assert.isOk(
                await fakeContract.functionFakeAsFuck({
                    from: deployer,
                    value: sendValue,
                })
            )

            // Check also that the fund() function invoked by the fallback function was properly executed, i.e., the FundMe
            // contract structures were properly filled
            const fundedValue = await fundMeContract.addressToAmountFunded(
                deployer
            )
            const fundedAddress = await fundMeContract.founders(0)

            assert.equal(fundedValue.toString(), sendValue.toString())
            assert.equal(fundedAddress, deployer)
        })
    })

    describe("receive", async function () {
        it("should call the receive function when a simple send or call is invoked instead", async function () {
            /* 
                Lets test for 3 things: 
                · The FundMeReceivedInvoked event is emitted
                · The FundMe.addressToAmountFunded is correctly updated
                · The FundMe.founders array is also updated correctly
            */

            /* 
                Trigger the receive function by sending a simple valued transaction to the contract without specifying any functions
                Note: To send a simple transaction happens to be a dysfunctional scenario from hell... thanks Java fucking script
                It turns out that triggering the receive function in the other contract is not a "clean" process, as in it throws all
                sorts of retarded exceptions. Except... the fucking chai does not recognize them as exception. Fuck, from its point
                of view they are actually OK, even if the fucking test case breaks and the output is full of errors...
                So, I need to "capture" those to allow the test to finish. In a normal, logical, intelligent programming language,
                this would be as simple as using a try-catch or something equivalent. But when one mixes a retarded and idiotic
                programming language with an even more idiotic and confusing module as chai happens to be, all HELL BREAKS LOOSE
                in the most simple of tests!
                Since chai has *ONLY* half a billion of potential test conditions, it only took me almost a day to figure out which
                FUCKING ONE WORKED!!!! Turns out that asserting for an OK (even if the output is ridden with errors...) is the one
                that works. It would have been logic to test this one in the first place if this fucking thing was not spewing all
                sorts of errors and then some whenever I even attempt to look at it, but yeah... when in doubt...
                
                ADDEND: Originally I was emitting an event with the fallback and receive functions and thus I was expecting for an
                event emission, and that worked perfectly... but the damn linter does not like events being emitted in default
                functions (such those two) and I want to be the best programmer I can be, and that includes writing beautiful
                and correct code. I did not expect a goddamn saga just to stop emitting a freakin event, but that's Javascript
                for you...
            */
            assert.isOk(
                await signer.sendTransaction({
                    to: fundMeInstance.address,
                    value: sendValue,
                })
            )

            // await expect(
            //     signer.sendTransaction({
            //         to: fundMeInstance.address,
            //         value: sendValue,
            //     })
            // ).to.respondTo()

            const fundedValue = await fundMeContract.addressToAmountFunded(
                deployer
            )
            const fundedAddress = await fundMeContract.founders(0)

            assert.equal(fundedValue.toString(), sendValue.toString())
            assert.equal(fundedAddress, deployer)
        })
    })

    describe("getVersion", async function () {
        it("should return the correct version for the price aggregator module", async function () {
            const version = await fundMeContract.getVersion()

            // Since I have no idea what version number to expect, all I can do is to test if the response is of the expected
            // type. From the FundMe contract I can see that the version is a uint256. These don't exist in this side (testing)
            // but I know they get converted to bigint, so test that one then
            assert.typeOf(version, "bigint")
        })
    })
})

// TODO: Video stopped at 11:36:34 (console.log & Debugging)
