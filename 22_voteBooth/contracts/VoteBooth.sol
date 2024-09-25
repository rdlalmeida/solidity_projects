// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {ERC721Burnable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

/**
 * @title VoteBooth - This contract implements the element of the solution that emulates (as much as possible) a coventional voting booth. This one has three main
 * objectives:
 * 1. Validate a user as a valid voter or not (to implement at a later stage)
 * 2. Mint and distribute Vote NFTs among eligible voters.
 * 3. Store returned Vote NFTs until the end of the election period.
 * @author Ricardo Almeida
 * TODO: Implement the voter eligibility logic.
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

    // Given that one user can only hold 0 or 1 Vote NFT at a time, I have a 1:1 relationship
    // for this particular case. As such, it is useful to maintain an inverse mapping (address => tokenId) so
    // that I can recover the id of the token transfered to an input address. This makes little sense with "normal" NFTs
    // but this ones are different
    mapping(address voteOwner => uint256) private _voteOwners;

    // EVENTS

    // Just a bunch of events to track the lifetime of a vote NFT.
    event VoteMinted(uint _voteId);
    event VoteSubmitted(uint256 _voteId);
    event VoteModified(uint256 _voteId);
    event VoteBurned(uint256 _voteId);

    // Throw this one if a user tries to access a non-existent VoteNFT
    error NonExistentVote();


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
        // Set this counter to start at '1' so that I can identify a '0' in any voteId mappings as a non-existent value (not-set)
        nextVoteId = 1;
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
        // Only the owner of the token can check its contents
        require(ownerOf(_voteId) == msg.sender, "Sender is not the token owner!");

        return ERC721URIStorage.tokenURI(_voteId);
    }

    /**
     * This function creates the Vote NFT, which for now is a set of two synchronized records into two internal mappings from the ERC721 interface, namely
     * setting the _owners mapping, with a voteId => address relation that establish the ownership of the vote, and another one, this one to an internal
     * mapping from the ERC721URIStorage interface, _tokenURIs, which maps an id (voteId) to a string. In this case, a mint sets that data to simply
     * "Choice?". The idea is for the voter (identified by the address '_to') to replace this text by his/her choice, the answer to 'ballot', at a later stage.
     * The id of the vote to mint is automatically calculated by incrementing the respective contract parameter.
     * 
     * NOTE: It's tempting to return the id of the token created as a return for this function, but... this function changes the state of the blockchain,
     * if anything by creating a new NFT. Therefore, returning anything of a transaction like this one is super tricky (if I listen for the return value,
     * I get a ContractTransactionResponse object instead, which tells me nothing about the execution result), so the trick is to subscribe and listen to
     * the event instead.
     * @param _to  The address of the owner of the vote NFT.
     */
    function mintVoteNFT(address _to) public onlyOwner {
        // In my specific case, I don't want one voter to accumulate vote NFTs, by obvious reasons.
        // I'm using the balanceOf to guarantee than one address contains one and only one single Vote NFT at a point
        require(balanceOf(_to) == 0, "User already has a VoteNFT in the account!");

        uint256 currentVoteId = nextVoteId++;
        // Set the ownership chain in motion
        _safeMint(_to, currentVoteId);

        // And then set the main data, which for now it's just a stand in
        _setTokenURI(currentVoteId, "Choice?");

        // Set our internal vote owner mapping
        _voteOwners[_to] = currentVoteId;

        // And emit the event before exiting
        emit VoteMinted(currentVoteId);
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

    /**
     * The normal getter for this things, but this one for the internal (owner => voteId) mapping
     * @param owner The address of the token owner
     * @return uint256 If the owner has a vote token in his/her account, this function returns its id.
     */
    function getVoteId(address owner) public view returns (uint256) {
        uint256 id = _voteOwners[owner];
        
        if (id == 0) {
            // If there is no token associated to the provided address, revert this using the proper error so that
            // this mapping behaves just like the ones from ERC721 standard
            revert ERC721NonexistentToken(0);
        }
        else {
            // Otherwise return the id
            return id;
        }
    }

    function vote(uint256 _voteId, string memory _vote) public {
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
    }

    /**
     * An overwritten (of sorts) version of the burn function, which in our case has to take into account the management of
     * the _voteOwners mapping. I also need this function for development purposes.
     * @param tokenId The id of the vote to be burned. The interface requires tokenId as the name of the argument.
     */
    function burn(uint256 tokenId) public override(ERC721Burnable) {
        // NOTE: I'm assuming that the msg.sender is also the current owner of the tokenId provided. This is an imposition from the
        // super.burn function, i.e., only the token owner can burn the token, obviously. I'm using this logic to my advantage
        require(_voteOwners[msg.sender] == tokenId, "Only the token owner can burn it!");

        // Remove the internal association
        delete _voteOwners[msg.sender];

        // And then the rest of the parent function
        super.burn(tokenId);

        // Finalize by emiting the respective event
        emit VoteBurned(tokenId);
    
    }

    /**
     * This function serves solely for me to test my damn deployments! I've had nightmares trying to deploy contracts with hardhat and ethers,
     * getting all sorts of annoying errors or, in some cases, the lack of these when needed...
     * So much so that I need the simplest function around to be able to test the most basic of contract functionality. Ish...
     */
    function saySomething() public pure returns (string memory) {
        return "My reset script works perfectly!!";
    }
}