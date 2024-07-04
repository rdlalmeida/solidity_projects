// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./ERC4907.sol";

contract RentablePets is ERC4907 {
    uint256 private _tokenIds;

    constructor() ERC4907("RentablePets", "RP") {}

    function mintNFT(
        address recipient,
        string memory token_uri
    ) public returns (uint256) {
        _tokenIds++;
        uint256 newItemId = _tokenIds;

        _safeMint(recipient, newItemId);
        _setTokenURI(newItemId, token_uri);

        return newItemId;
    }

    function burn(uint256 tokenId) public {
        _burn(tokenId);
    }
}
