const web3_instance = require('web3');
require('dotenv').config();

const web3 = new web3_instance(process.env.SEPOLIA_URL);

let main = async function() {
    const jsonContract = require("../build/contracts/EventExample.json");

    const networks = jsonContract.networks;
    const networkId = Object.keys(networks)[0];

    const contract_address = networks[networkId].address;
    const contract_abi = jsonContract.abi;

    const contract_instance = new web3.eth.Contract(contract_abi, contract_address);

    console.log("Contract address = ", contract_address);

    var options = {
        address: contract_address,
        topics: []
    };

    await contract_instance.events.allEvents();
}

main();

// contract_instance.events.allEvents({
//     fromBlock: 0
// }, function(error, event) {
//     if (error) {
//         console.error(error);
//     }
//     else{
//         console.log(event);
//     }
// })

/*
var subscription = web3.eth.subscribe('DataStored', function (error, result) {
    if (!error) {
        console.log("Got some results back!");
        console.log(result);
    }
    else {
        console.log(error);
    }
}).on('data', function(log) {
    console.log("Got this data: ", log);
});
*/

// console.log(contract_instance);