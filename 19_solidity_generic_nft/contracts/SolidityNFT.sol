// SPDX-License-Identifier: MIT 

pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

abstract contract SolidityNFT is ERC721URIStorage, Ownable {
    uint256 _tokenIds;

    constructor (string memory _name, string memory _symbol) ERC721(_name, _symbol) {

    }

    function mintNFT(address recipient, string memory tokenURI) public onlyOwner returns (uint256) {
        _tokenIds += 1;

        _mint(recipient, _tokenIds);
        _setTokenURI(_tokenIds, tokenURI);

        return _tokenIds;
    }

    // Simple function that returns a string, just to test the deployment status of this contract
    function sayHello(string memory hello) public pure returns (string memory) {
        string memory greet = string.concat(hello, " from the SolidityNFT contract!");

        return greet;
    }
}