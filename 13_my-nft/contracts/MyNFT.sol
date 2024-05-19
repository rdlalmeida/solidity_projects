// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// NOTE: The Counters contract became irrelevant with Solidity v8.0 and newer (this contract was adapted accordingly)
// import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract MyNFT is ERC721URIStorage {
    // using Counters for Counters.Counter;
    // Counters.Counter private _tokenIds;
    uint256 private _tokenIds;

    constructor() ERC721("MyNFT", "NFT") {}

    function mintNFT(
        address recipient,
        string memory tokenURI
    ) public returns (uint256) {
        //_tokenIds.increment();

        uint256 newItemId = _tokenIds;
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);

        // Increment the internal counter for the next iteration
        _tokenIds++;

        return newItemId;
    }
}
