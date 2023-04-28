// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

// import "../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
// import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../node_modules/@openzeppelin/contracts/token/common/ERC2981.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/utils/Counters.sol";

contract RoyalPets is ERC721URIStorage, ERC2981, Ownable {
	using Counters for Counters.Counter;
	Counters.Counter private _tokenIds;

	constructor() ERC721("RoyalPets", "RP") {
		// Define the royalty percentage to 1%. This is because, internally, there's a default  denominator defined at 
		// 10000 (10k) and the second argument in this function defines the numerator for the royalty percentage
		// calculator which in this case is going to be 100/10000 = 1/100 = 1%
		_setDefaultRoyalty(msg.sender, 100);
	}

	// Override the 'supportsInterface' function defined in both the ERC721 and ERC2981 contract interfaces
	function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC2981) returns (bool) {
		return super.supportsInterface(interfaceId);
	}

	// Re-define the '_burn' function since the ERC721Royalty interface is not inherited anymore
	function _burn(uint256 tokenId) internal virtual override {
		super._burn(tokenId);
		_resetTokenRoyalty(tokenId);
	}

	// Re-write a public version of the previous function to allow other users to burn their NFTs
	function burnNFT (uint256 tokenId) public {
		_burn(tokenId);
	}

	// Set the NFT minting functions: one using the default (1%) royalty fee and another one with this parameter configurable
	// onlyOwner - specifies that the only person that can mint one of these NFTs is the contract deployer
	function mintNFT(address recipient, string memory tokenURI) public onlyOwner returns (uint256) {
		_tokenIds.increment();

		uint256 newItemId = _tokenIds.current();
		_safeMint(recipient, newItemId);
		_setTokenURI(newItemId, tokenURI);
		
		return newItemId;
	}

	function mintNFTWithRoyalty(address recipient, string memory tokenURI, address royaltyReceiver, uint96 feeNumerator) public onlyOwner returns (uint256) {
		uint256 tokenId = mintNFT(recipient, tokenURI);
		_setTokenRoyalty(tokenId, royaltyReceiver, feeNumerator);

		return tokenId;
	}
}
