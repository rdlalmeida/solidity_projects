const { getNamedAccounts, ethers, deployments } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { assert } = require("chai")

// Do the next part ONLY if I'm not in a development chain, i.e., a local emulated blockchain. The staging tests should happen
// only in test chains
developmentChains.includes(network.name)
    ? describe.skip
    : describe("Staging FundMe", async function () {
          let fundMeInstance
          let fundMeContract
          let deployer
          let networkProvider
          const sendValue = ethers.parseEther("0.1")

          beforeEach(async function () {
              // this.timeout(0)
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["testnet"])
              fundMeInstance = await deployments.get("FundMe")
              fundMeContract = await ethers.getContractAt(
                  fundMeInstance.abi,
                  fundMeInstance.address
              )

              networkProvider = ethers.provider
          })

          it("allows people to fund and withdraw", async function () {
              // this.timeout(0)
              await fundMeContract.fund({ value: sendValue })
              await fundMeContract.withdraw()
              const endingBalance = await networkProvider.getBalance(
                  fundMeInstance.address
              )

              assert.equal(Number(endingBalance), 0)
          })
      })

/* 
            To start the tutorial video at this timestamp, do
            $ vlc <video_filename.mp4> --start-time="<number_of_seconds_to_elapse>"

            NOTE1: Stopped because when trying to test on a local network, out of fucking
            nowhere, this piece of shit begun complaining about not finding a deployment for "FundMe". I... I lost my patience
            after this and quit for the day. So try to deploy this mess once again and, once I have a green test locally, try
            this shit in Sepolia.
            NOTE2: In Sepolia the problem I was having (before the moronic missing deployment...) was that the minimum usd
            limit was way above my current balance of Sepolia test ETH. Change these limits or put more fake ETH in the
            account before running this again..
      */
