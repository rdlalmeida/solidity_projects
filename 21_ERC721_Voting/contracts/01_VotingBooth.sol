// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";


/**
 * @dev Custom implementation of a ERC721 type NFT contract, hopefully without making it an abstract contract.
 * The main goal with this project it to set a base contract to extend towards my goals of creating a voting
 * system based on NFT with editable metadata.
 */
abstract contract VotingBooth is ERC721, IERC721Receiver {

    // Each vote has to be unique for the set minted by this contract. Using this id achieves this.
    uint256 public nextVoteIdToMint;

    // This is just an organizational aspect. This owner parameter was inherited from the ERC721 standard but it may be useful later on.
    address public boothOwner;

    // The name of the current election
    string private electionName;

    // The ticker of the current election
    string private electionSymbol;

    // token_id => owner
    mapping(uint256 => address) internal _owners;

    // owner => vote_count
    mapping(address => uint256) internal _balances;

    // token_id => approved_address
    mapping(uint256 => address) internal _voteApprovals;

    // owner => (operator => yes/no)
    mapping(address => mapping(address => bool)) internal _voterApprovals;

    // vote_id => vote_data
    mapping(uint256 => string) _voteData;


    // NOTE: The following events are already defined in IERC165.sol. Since these are not overwritting those ones, they are deactivated.
    // event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId);
    // event Approval(address indexed _owner, address indexed _approved, uint256 indexed _tokenId);
    // event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);

    /**
     * @dev Constructor function that expands from the ERC721.sol base contract implementation. For now, there's not a lot of stuff added to it
     * to keep it as simple as possible. Once it's minimally functional, then it's time to adjust it to my goals
     * @param _electionName The name of the election. 
     * @param _electionSymbol The ticker to identify this specific election among other. The usefulness of this field is debatable 
     */
    constructor(string memory _electionName, string memory _electionSymbol) ERC721(_electionName, _electionSymbol) {
        electionName = _electionName;
        electionSymbol = _electionSymbol;
        nextVoteIdToMint = 0;
        boothOwner = msg.sender;
    }

    /**
     * @dev Simple 'getter' for the private parameter election name
     */
    function getElectionName() public view returns (string memory) {
        return electionName;
    }

    /**
     * @dev Simple 'getter' for the private parameter election symbol
     */
    function getElectionSymbol() public view returns (string memory) {
        return electionSymbol;
    }

    /**
     * @dev Function to return the current token (vote) balance of a given account. Useful to ensure that only one vote is allowed per
     * account/voter
     * 
     * @param _owner Not the best designation for this parameter. As 'owner' one should look at this as the owner of the account that contains
     * a certain number of vote tokens.
     */
    function balanceOf(address _owner) public view override returns(uint256) {
        require(_owner != address(0), "Address 0 detected!");
        return _balances[_owner];
    }

    /**
     * @dev This one works kinda opposite of the 'balanceOf' one in the sense that it gets a vote id value and returns the address of the
     * account that received that vote token. 
     * @param _voteId The id of the vote token whose ownership is to be determined.
     */
    function ownerOf(uint256 _voteId) public view override returns(address) {
        return _owners[_voteId];
    }

    /**
     * @dev The actual implementation of the safeTransferFrom function. Basically it starts by validating the input arguments
     * and, if all is OK, proceed with the actual transfer. The main difference between "my" implementation and the base one
     * from ERC721.sol are the 'requires' in the beginning that ensure the input data is as correct as one can ensure at this
     * point. After that, this function simply delegates to the base one while providing the same input arguments. Also, what
     * makes this transfer 'safe' is a final verification (after the actual transfer itself) in the base contract that guarantees
     * that the format of the token received is consistent with the ERC721 format.
     * @param _from The address of the account currently owning the vote token to transfer.
     * @param _to The address of the account that is to receive the vote token to transfer.
     * @param _voteId The id of the vote token to transfer. Ideally there should be only one of those in any account at some time.
     * @param _data This is the stringy-fied function signature so that, at a later point, the function selector can be derived. 
     */
    function safeTransferFrom(address _from, address _to, uint256 _voteId, bytes memory _data) public virtual override {
        // Condition #1
        require(ownerOf(_voteId) == msg.sender, "You do not own the vote specified!");
        // Condition #2
        require(_voteApprovals[_voteId] == msg.sender, "You are not authorized to transfer this vote!");
        // Condition #3
        require(_voterApprovals[ownerOf(_voteId)][msg.sender], "Vote transfer to this address is not approved!");

        ERC721.safeTransferFrom(_from, _to, _voteId, _data);
    }

    /**
     * @dev Unsafe version of the transfer function. This one does not check for a correct format of the vote received.
     * @param _from  The address of the account currently ownning the vote token to transfer,
     * @param _to  The address of the account that is to receive the vote token to transfer.
     * @param _voteId The if of the vote token to transfer. Ideally there should be only one of those in any account at some time.
     */
    function transferFrom(address _from, address _to, uint256 _voteId) public override {
        // Condition #1
        require(ownerOf(_voteId) == msg.sender, "You do not own the vote specified!");

        // Condition #2
        require(_voteApprovals[_voteId] == msg.sender, "You are not authorized to tranfer this vote!");
        
        // Condition #3
        require(_voterApprovals[ownerOf(_voteId)][msg.sender], "Vote transfer to this address is not approved!");
        
        _transfer(_from, _to, _voteId);
    }

    /**
     * @dev This function is used to "authorize" a vote by enabling the transfer of a vote token to this address. The function creates a mapping record
     * between the authorized address and the vote id of the token that it is authorized to receive the vote token.
     * @param _approved The address approved for the vote token transfer.
     * @param _voteId The id of the vote token authorized for transfer.
     */
    function approve(address _approved, uint256 _voteId) public override {
        require(ownerOf(_voteId) == msg.sender, "The message sender is not the token owner!");
        _voteApprovals[_voteId] = _approved;
        emit Approval(ownerOf(_voteId), _approved, _voteId);
    }

    /**
     * @dev This function manipulates the access rights for the address provided as input. The mapping entry associated to this address can be set to a boolean value. NOTE: All approvals are indexed to a "owner" address, provided via 'msg.sender'. 
     * @param _operator Address whose access status is going to be change.
     * @param _approved The access status to set for the provided address.
     */
    function setApprovalForAll(address _operator, bool _approved) public override {
        _voterApprovals[msg.sender][_operator] = _approved;
        emit ApprovalForAll(msg.sender, _operator, _approved);
    }

    /**
     * @dev This function is sort of a getter, to retrieve the address that is authorized for transfer.
     * @param _voteId The id of the vote token to retrieve the address that it is authorized to transfer the vote token to.
     */
    function getApproved(uint256 _voteId) public view override returns (address) {
        return _voteApprovals[_voteId];
    }

    /**
     * @dev This function is also a sort of a getter, but this one retrieves the access status for a given owner and an operator address.
     * @param _owner The address of the 'owner' of the approved list. It is not clear yet if this is useful or not.
     * @param _operator The address of the operator whose access status we want to retrieve.
     */
    function isApprovedForAll(address _owner, address _operator) public view override returns (bool) {
        return _voterApprovals[_owner][_operator];
    }

    /**
     * @dev This is the minting function. This one creates the NFT, which in Solidity essentially consists in creating a series of (hopefully) synchronized
     * records that functionally read as a NFT. Obviously, minting is highly conditioned, which in this function is implemented by establishing a hard requirement
     * of contract ownership. (Is it enough?)
     * @param _to The address that the vote token is to be sent to
     * @param _data The data to include in the NFT. This is the most important aspect, since this is where the vote choices are going to be encoded. On minting
     * I think this parameter should be the framework of an empty vote. For now, lets see if this works minimally first.
     */
    function mintTo(address _to, string memory _data) public {
        // Only the contract owner should be able to run this function
        require(boothOwner == msg.sender, "Minting not authorized for this address!");
        
        // Start by setting the address to send this vote token as one 'owning' it already, associating it also to the id of the token to "produce" in a bit.
        _owners[nextVoteIdToMint] = _to;

        // Increase by one the number of vote tokens associated to this address
        _balances[_to] += 1;

        // Set the data of the vote in the usual mapping
        _voteData[nextVoteIdToMint] = _data;

        // Emit the event as well
        emit Transfer(address(0), _to, nextVoteIdToMint);
        
        // Increment the id counter to leave the function ready for the next one
        nextVoteIdToMint += 1;

        // And that's it! This is how a NFT is created in Ethereum/Solidity. A NFT in this context is nothing but a series of synchronized (and immutable) records. It's
        // the immutability thing that makes it "real"
    }

    /**
     * @dev This is the mother of all sensitive functions. I'm not sure if I'm OK with a function like this one as private in the mainnet contract! It obviouly does what it says: 
     * you give it a vote Id and it tells you what the data in it is. This is a glaring breach in voter privacy (duh...) but I need one of this while I'm developing this thing
     * NOTE: DELETE THIS ONE AS SOON AS POSSIBLE
     * @param _voteId The id of the vote token whose data we want to get back.
     */
    function getVoteData(uint256 _voteId) public view returns (string memory) {
        return _voteData[_voteId];
    }

    /**
     * @dev This one is simple one to get the total number of vote tokens emitted thus far.
     */
    function totalSupply() public view returns (uint256) {
        return nextVoteIdToMint;
    }

    /**
     * @dev The basic, "unsafe", version of the transfer function. This one is pretty much bare-bones because all the data validation happens
     * in the wrapper ones.
     * @param _from Address from where the vote token is to be transfered from
     * @param _to Address to where the vote token is to be sent to.
     * @param _voteId The id of the vote token to transfer.
     */
    function _transfer(address _from, address _to, uint256 _voteId) internal {
        require(ownerOf(_voteId) == _from, "Not the owner of the vote token!");
        require(_to != address(0), "Transfer to address 0! Not authorized!");

        delete _voteApprovals[_voteId];
        _balances[_from] -= 1;
        _balances[_to] += 1;
        _owners[_voteId] = _to;

        emit Transfer(_from, _to, _voteId);
    }
}