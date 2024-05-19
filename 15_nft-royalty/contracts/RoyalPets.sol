// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract RoyalPets is ERC721, ERC2981, ERC721URIStorage, Ownable {
    uint256 private _tokenIds;
    address initalOwner;

    constructor(
        address initialOwner
    ) Ownable(initialOwner) ERC721("RoyalPets", "RP") {
        _setDefaultRoyalty(msg.sender, 100);
    }

    // function _burn(uint256 tokenId) internal virtual override(ERC721) {
    //     super._burn(tokenId);
    //     _resetTokenRoyalty(tokenId);
    // }

    function royal_burn(uint256 tokenId) internal {
        ERC721._burn(tokenId);
        _resetTokenRoyalty(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(ERC721, ERC2981, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function burnNFT(uint256 tokenId) public {
        // _burn(tokenId);
        royal_burn(tokenId);
    }

    function mintNFT(
        address recipient,
        string memory token_uri
    ) public onlyOwner returns (uint256) {
        _tokenIds++;
        uint256 newItemId = _tokenIds;

        _safeMint(recipient, newItemId);
        _setTokenURI(newItemId, token_uri);

        return newItemId;
    }

    function mintNFTWithRoyalty(
        address recipient,
        string memory token_uri,
        address royaltyReceiver,
        uint96 feeNumerator
    ) public onlyOwner returns (uint256) {
        uint256 tokenId = mintNFT(recipient, token_uri);
        _setTokenRoyalty(tokenId, royaltyReceiver, feeNumerator);

        return tokenId;
    }

    function tokenURI(
        uint256 tokenId
    )
        public
        view
        virtual
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        // I'm making an executive decision here: the function tokenURI is defined diferently in two of the inherited contracts (ERC721 and ERC721URIStorage). Given that the
        // ERC721URIStorage is more complete, I'm simpling invoking this one with the input arguments and returning its output too.

        return ERC721URIStorage.tokenURI(tokenId);
    }
}
