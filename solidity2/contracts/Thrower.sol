pragma solidity ^0.4.23;


contract Thrower {

  address public thrower;

/*	constructor(
    address _thrower
  )
  public
  {
    thrower = _thrower;
  }*/

  modifier onlyThrower() {
    require(msg.sender == thrower);
    _;
  }

}
