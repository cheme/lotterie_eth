pragma solidity ^0.4.23;

import "../if/LotterieIf.sol";

contract FromLotterie {

  LotterieIf public lotterie;

/*	constructor(
  )
  public
  {
    lotterie = LotterieIf(msg.sender);
  }*/

  modifier onlyContractAuthor() {
    require(msg.sender == lotterie.getAuthorContract());
    _;
  }
  modifier onlyOwner() {
    require(msg.sender == lotterie.getOwner());
    _;
  }

}

