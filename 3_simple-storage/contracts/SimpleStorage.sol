pragma solidity ^0.8.10;

contract SimpleStorage {
  uint myVariable;

  function set(uint x) public {
    assert(x == 0);
    myVariable = x;
  }

  function get() view public returns (uint) {
    return myVariable;
  }
}