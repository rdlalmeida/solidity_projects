// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./IERC4907.sol";

contract ERC4907 is ERC721URIStorage, IERC4907 {
    constructor(
        string memory _name,
        string memory _symbol
    ) ERC721(_name, _symbol) {}

    struct UserInfo {
        address user; // Address of user role
        uint64 expires; // UNIX timestamp, user expires
    }

    mapping(uint256 => UserInfo) internal _users;
    uint256 public totalSupply;

    // Simple function to expose the internal UserInfo mapping (for debug purposes only)
    function getUserInfo() public view returns (UserInfo[] memory) {
        UserInfo[] memory my_users;

        for (uint8 i = 1; i <= totalSupply; i++) {
            my_users[i - 1] = _users[i];
        }

        return my_users;
    }

    /// @notice set the user and expires of a NFT
    /// @dev The zero address indicates there is no user
    /// Throws if `tokenId` is not valid NFT
    /// @param user The new user of the NFT
    /// @param expires UNIX timestamp, The new user could use the NFT before expires
    function setUser(
        uint256 tokenId,
        address user,
        uint64 expires
    ) public virtual override {
        require(
            _ownerOf(tokenId) == msg.sender,
            "ERC721: transfer caller is not owner nor approved"
        );

        UserInfo storage info = _users[tokenId];
        info.user = user;
        info.expires = expires;
        emit UpdateUser(tokenId, user, expires);
    }

    /// @notice Get the user address of a NFT
    /// @dev The zero address indicates that there is no user or the user is expired
    /// @param tokenId The NFT to get the user address for
    /// @return The user address from this NFT
    function userOf(
        uint256 tokenId
    ) public view virtual override returns (address) {
        if (uint256(_users[tokenId].expires) >= block.timestamp) {
            return _users[tokenId].user;
        } else {
            return address(0);
        }
    }

    /// @notice Get the user expires of a NFT
    /// @dev The zero vakue undicates that there is no user
    /// @param tokenId The NFT to get the user expires for
    /// @return uint256 The user expires for this NFT
    function userExpires(
        uint256 tokenId
    ) public view virtual override returns (uint256) {
        return _users[tokenId].expires;
    }

    /// @dev See {IERC165-supportsInterface}.
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override returns (bool) {
        return
            interfaceId == type(IERC4907).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    // function transferFrom(
    //     address from,
    //     address to,
    //     uint256 tokenId
    // ) public virtual override(ERC721, IERC721) {
    //     super.transferFrom(from, to, tokenId);

    //     if (from != to && _users[tokenId].user != address(0)) {
    //         delete _users[tokenId];
    //         emit UpdateUser(tokenId, address(0), 0);
    //     }
    // }
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        address from = super._update(to, tokenId, auth);

        if (from != to && _users[tokenId].user != address(0)) {
            delete _users[tokenId];
            emit UpdateUser(tokenId, address(0), 0);
        }

        return from;
    }
}
