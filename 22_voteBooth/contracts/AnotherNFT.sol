// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";


/**
 * @title AnotherNFT - This is a simple, ERC721-based contract so that I could use to iron out all the deployment and contract calling issues before starting with more
 * complex contracts. It is a bare-bones contract that implements the basic needed for deployment, and has a simple, string return function (saySomething()) to 
 * test return types, contract calls and the such.
 * @author Ricardo Almeida 
 * @notice _initialOwner An address to which the deployed contract gets associated to.
 * @notice _name The name of the NFT to mint.
 * @notice _symbol The symbol of the NFT token to mint.
 */
contract AnotherNFT is ERC721, ERC721URIStorage, ERC721Burnable, Ownable {
    constructor(address _initialOwner, string memory _name, string memory _symbol) ERC721(_name, _symbol) Ownable(_initialOwner) {
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function safeMint(address to, uint256 tokenId, string memory uri) public onlyOwner {
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // Simple override of the approval functions


    function saySomething() public pure returns (string memory) {
        return string.concat("Congrats, this thing is working!");
    }

    // Alternative function to the tokenURI one, because I get to some points where I don't know what else I can do and I need to rule out Javascript errors
    function getTokenMetadata(uint256 tokenId) public view returns (string memory) {
        return ERC721URIStorage.tokenURI(tokenId);
    }

    function getTokenOwner(uint256 tokenId) public view returns(address) {
        return ownerOf(tokenId);
    }

    function burn(uint256 tokenId) public override(ERC721Burnable) {
        console.log("Burn message.sender = ", msg.sender);
        super.burn(tokenId);
    }
}