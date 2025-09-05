// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract ExampleNFT is ERC721, ERC721URIStorage, ERC721Burnable, Ownable {
    uint256 totalSupply;
    uint256 nextTokenId;

    constructor(address _initialOwner, string memory _name, string memory _symbol) ERC721(_name, _symbol) Ownable(_initialOwner) {
        // Set the internal counters
        totalSupply = 0;
        nextTokenId = 0;
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function safeMint(address to, uint256 tokenId, string memory uri) public onlyOwner {
        // Set the token id to be automatically set by the contract
        tokenId = nextTokenId++;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // Alternative function to the tokenURI one, because I get to some points where I don't know what else I can do and I need to rule out Javascript errors
    function getTokenMetadata(uint256 tokenId) public view returns (string memory) {
        return ERC721URIStorage.tokenURI(tokenId);
    }

    function getMetadataSize(uint256 tokenId) public view returns (uint256) {
        string memory tokenMetadata = ERC721URIStorage.tokenURI(tokenId);

        bytes memory data = bytes(tokenMetadata);

        return data.length;
    }

    function getTokenOwner(uint256 tokenId) public view returns(address) {
        return ownerOf(tokenId);
    }

    function getAccountBalance(address acct) public view returns(uint256) {
        return balanceOf(acct);
    }

    function getTokenApproval(uint256 tokenId) public view returns(address) {
        return getApproved(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        // This contract implements the IERC721 interface. Set this to the return type
        return
            // This one states the support of the IERC165 interface 
            super.supportsInterface(interfaceId) || 
            // This one states the support of the IERC721 interface
            interfaceId == type(IERC721).interfaceId ||
            // This one does the same for the IERC721Metadata
            interfaceId == type(IERC721Metadata).interfaceId ||
            // This one does the IERC721Receiver
            interfaceId == type(IERC721Receiver).interfaceId ||
            // Finally, this contract also implements the Ownable interface
            interfaceId == type(Ownable).interfaceId;
    }

    function getApprovedForAll(address owner, address operator) public view returns(bool) {
        return isApprovedForAll(owner, operator);
    }

    function getTotalSupply() public view returns(uint256) {
        return totalSupply;
    }

    function getNextTokenId() public view returns(uint256) {
        return nextTokenId;
    }

    function burn(uint256 tokenId) public override(ERC721Burnable) {
        super.burn(tokenId);
    }
}