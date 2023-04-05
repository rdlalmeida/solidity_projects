pragma solidity ^0.5.0;

contract Adoption {
    address[16] public adopters;

    // Adopting a pet
    uint public min_index = 0;
    uint public max_index = 15;

    function adopt(uint petId) public returns (uint) {
        require (petId >= min_index && petId <= max_index, "Please provide a petId between " + min_index + " and " + max_index);

        adopters[petId] = msg.sender;

        return petId;
    }

    // Retrieving the adopters
    function getAdopters() public view returns (address[16] memory) {
        return adopters;
    }

    
}