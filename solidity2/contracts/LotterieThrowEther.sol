
pragma solidity ^0.4.23;

import "./LotterieThrow.sol";


contract LotterieThrowEther is LotterieThrow {
  function bid (
    uint commitmentSeed
  ) external payable  {
    internal_bid(msg.sender,commitmentSeed,msg.value);
  }

  function mode() view public returns(uint8,address) {
    return (0,0); // Ether mode
  }

  function withdrawAmount(uint amount) internal {
    msg.sender.transfer(amount);
  }
  function deffered_constructor (
    uint paramsId,
    uint paramsPhaseId,
    uint32 ownerMargin,
    uint32 authorContractMargin,
    uint32 authorDappMargin,
    uint32 throwerMargin
  ) 
  public
  payable
  {
    internal_deffered_constructor(
      msg.value,
      paramsId,
      paramsPhaseId,
      ownerMargin,
      authorContractMargin,
      authorDappMargin,
      throwerMargin
    );
  }

}
