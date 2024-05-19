require("dotenv").config();

const API_URL = process.env.API_URL;
const PRIVATE_KEY = process.env.METAMASK_PRIVATE_KEY;
const PUBLIC_KEY = process.env.METAMASK_PUBLIC_KEY;

const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(API_URL);

const contract = require("../artifacts/contracts/MyNFT.sol/MyNFT.json");
const contract_address = process.env.SEPOLIA_CONTRACT_ADDRESS;
const nftContract = new web3.eth.Contract(contract.abi, contract_address);

const gas_limit = process.env.GAS_LIMIT;

async function mintNFT(tokenURI) {
    const nonce = await web3.eth.getTransactionCount(PUBLIC_KEY, "latest"); // Get the latest nonce

    // Setup the transaction
    const tx = {
        from: PUBLIC_KEY,
        to: contract_address,
        nonce: nonce,
        gas: gas_limit,
        data: nftContract.methods.mintNFT(PUBLIC_KEY, tokenURI).encodeABI(),
    };

    // Sign the transaction
    const signPromise = web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);

    // Run the thing using error catching methods to ensure the transaction was not dropped by the miners
    signPromise
        .then((signedTx) => {
            web3.eth.sendSignedTransaction(
                signedTx.rawTransaction,
                function (err, hash) {
                    if (!err) {
                        console.log(
                            "The hash of your transaction is ",
                            hash,
                            "\nCheck Achemy's Mempool to view the status of your transaction!"
                        );
                    } else {
                        console.log(
                            "Something went wrong when submitting your transaction: ",
                            err
                        );
                    }
                }
            );
        })
        .catch((err) => {
            console.log("Promise failed: ", err);
        });
}

// Run the minting function
mintNFT("ipfs://QmS3HmkL8aX1xXe1pJ9tDP8V3ACKrYt4LYRa7hptfCFbN6");

// console.log("MyNFT contract ABI interface " + JSON.stringify(contract.abi));
