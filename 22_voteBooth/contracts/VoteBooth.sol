// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

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
    uint256 private nextVoteId;

    // The location "served" by this particular Vote Booth instance.
    string public location;

    // This is the main ballot in this election, i.e., the question for what this election is all
    // about. To save data, this variable is set once upon deployment, and retrieved as read-only
    // as needed 
    string private ballot;

    // MAPPINGS
    // This mapping is used to determine if a voter is voting, i.e., casting a vote for the first time in this election,
    // or re-voting, i.e., changing a previously submitted vote. This mapping counts the number of times a given
    // vote NFT was modified. 0 means the user hasn't vote but the NFT was sent to his/her account, 1 means the user as voted once,
    // and so on.
    mapping(uint256 tokenId => uint256) private _voted;

    // EVENTS

    // Just a bunch of events to track the lifetime of a vote NFT.
    event VoteMinted(uint _voteId);
    event VoteSubmitted(uint256 _voteId);
    event VoteModified(uint256 _voteId);


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
     * @param _ballot The text with the question central to the election. If the idea is to vote for one of many candidates, this text specifies how many candidates are
     * and/or assign them id numbers, if needed.
     */
    constructor(address _boothOwner, string memory _name, string memory _symbol, string memory _location, string memory _ballot) ERC721(_name, _symbol) Ownable(_boothOwner){
        nextVoteId = 0;
        ballot = _ballot;
        location = _location;
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

    /**
     * Simple getter to retrieve the text of the ballot for this election.
     */
    function getBallot() public view returns (string memory) {
        return ballot;
    }
    /**
     * This function is but a version of the 'tokenURI' version from the ERC721URIStorage interface, but more adapted to the voting context. But fundamentally
     * it does the exact same thing.
     * @param _voteId The id number of the vote NFT whose data is to be retrieved.
     * @return string The contents of the data field, i.e., a voter's choice for the token with voteId.
     */
    function getVote(uint256 _voteId) public view returns(string memory) {
        return ERC721URIStorage.tokenURI(_voteId);
    }

    /**
     * This function creates the Vote NFT, which for now is a set of two synchronized records into two internal mappings from the ERC721 interface, namely
     * setting the _owners mapping, with a voteId => address relation that establish the ownership of the vote, and another one, this one to an internal
     * mapping from the ERC721URIStorage interface, _tokenURIs, which maps an id (voteId) to a string. In this case, a mint sets that data to simply
     * "Choice?". The idea is for the voter (identified by the address '_to') to replace this text by his/her choice, the answer to 'ballot', at a later stage.
     * The id of the vote to mint is automatically calculated by incrementing the respective contract parameter.
     * @param _to  The address of the owner of the vote NFT.
     * @return uint256 If successful, this function returns the vote Id of the token minted.
     */
    function mintVoteNFT(address _to) public onlyOwner returns(uint256) {

        uint256 currentVoteId = nextVoteId++;
        // Set the ownership chain in motion
        _safeMint(_to, currentVoteId);

        // And then set the main data, which for now it's just a stand in
        _setTokenURI(currentVoteId, "Choice?");

        // And emit the event before exiting
        emit VoteMinted(currentVoteId);

        return currentVoteId;
    }

    /**
     * This one returns the address of the owner of the Vote NFT identified with vote id.
     * @param _voteId The vote id of the NFT token whose owner is to be retrieved.
     * @return address The address of the owner of the NFT.
     */
    function getVoteOwner(uint256 _voteId) public view returns(address) {
        // Simply invoke the ERC721 function that does exactly what is needed.
        return ownerOf(_voteId);
    }

    function vote(uint256 _voteId, string memory _vote) public returns (bool) {
        // Only the owner of the vote NFT with the provided id can proceed, i.e, the transaction that invokes
        // this function needs to be digitally signed by the token owner.
        require(msg.sender == getVoteOwner(_voteId), "User not authorized to vote!");

        // Protect also to the eventuality of a single owner having more than one vote. The assumption is this mapping
        // guarantees that no user can, somehow, mint more than one Vote NFT into his/her account. I mean, it is possible, but
        // that ensures that the user is unable to vote any more because this condition is always violated.
        // This also works as a primitive fault detection system: if a user as a balance > 1, there's a chance of foul play.
        require(balanceOf(msg.sender) == 1, "Missing a vote to proceed");

        // TODO: Create a routine to validate the data to change (once I have a format defined for it)

        // User is validated. Change the vote
        _setTokenURI(_voteId, _vote);

        // Increment the counter mapping and emit the relevant event according to the value of the counter.
        _voted[_voteId] += 1;

        if (_voted[_voteId] == 1) {
            // It s a first time vote
            emit VoteSubmitted(_voteId);
        }
        else {
            // It's a redo
            emit VoteModified(_voteId);
        }

        // Return true just to signal a successful process. Right now, there's no way for this function to return false.
        // Later, once I have a valid format to apply, this may change.
        return true;
    }
}