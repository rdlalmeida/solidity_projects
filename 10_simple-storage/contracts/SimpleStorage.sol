pragma solidity ^0.8.10;

contract SimpleStorage {
  uint myVariable;

  function set(uint x) public {
    require(x == 0, "X need to be zero!");
    myVariable = x;
  }

  function get() view public returns (uint) {
    return myVariable;
  }
}