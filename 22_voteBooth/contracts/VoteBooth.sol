// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

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

    function saySomething(string memory _what) public pure returns (string memory) {
        return string.concat("Here is", _what);
    }
}

/**
 * @title VoteBooth - This contract implements the element of the solution that emulates (as much as possible) a coventional voting booth. This one has three main
 * objectives:
 * 1. Validate a user as a valid voter or not (to implement at a later stage)
 * 2. Mint and distribute Vote NFTs among eligible voters.
 * 3. Store returned Vote NFTs until the end of the election period.
 * @author Ricardo Almeida
 * @notice TODO:
 * 1. Implement the Vote NFT. Its metadata (tokenURI) needs to be editable by the token owner and only him/her.
 * 2. Test that the only the owner can edit the NFT metadata and also it has limited (ideally one) number of times that it can be altered.
 * 3. Implement the voter eligibility logic.
 * 4. Implement the multiple vote logic. NOTE: The Vote NFT should be able to have its metadata editable at least once, but one should be able to revoke
 * a submitted NFT and replace it for a new one.
 */
contract VoteBooth is ERC721, ERC721URIStorage, ERC721Burnable, Ownable {

    // The main identifier counter for the tokens minted.
    uint nextTokenId;

    /**
     * The main constructor for the VotingBooth instance. This constructor instantiates a Voting Booth instance that is able to be invoked to mint Vote NFTs for 
     * a given address. The mechanics of how this should happen are still under development.
     * @param _boothOwner The address of the account that is going to be able to edit this token's metadata.
     * @param _name This one is a ERC721 specific parameter and it is required by the base (ERC721) interface. Since I need to name the election at some point, this
     * happens to be a quite useful parameter after all.
     * @param _symbol Another ERC721 mandated parameter, but that also has some usefulness in this context. The symbol is just a "ticker" to indentify this token using
     * a shorter definition.
     * @param _location This one indicates the "geographically logic" location of this contract. The idea is to have these contracts working similarly as traditional 
     * voting booth, in which each covers a certain geographical area of interest. But since these contracts are going to be stored in a blockchain block, this value
     * is merely illustrative.
     */
    constructor(address _boothOwner, string memory _name, string memory _symbol, string memory _location) ERC721(_name, _symbol) Ownable(_boothOwner){
        nextTokenId = 0;
    }

    /**
     * ERC721 bounded function to determine if an interface identified by the interfaceId parameter is supported or not (by what I don't know at this point)
     * @param interfaceId The interface id to determine its supportability status.
     */
    function supportsInterface(bytes4 interfaceId) public view override (ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * This function is quite useful for development but it may cause some problems in production... It receives a tokenId and returns the token metadata 
     * (here identified as tokenId) and returns the metadata set for the token so far. Well, if that data is always encrypted, it should not be a problem I think...
     * @param tokenId The token identification number whose metadata is to be retrieved.
     */
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function mintVoteNFT(address _to, uint _tokenId) public onlyOwner
}