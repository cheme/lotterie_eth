
pragma solidity ^0.4.23;

import "./LotterieThrow.sol";
import './zeppelin/token/ERC20/ERC20.sol';

contract LotterieThrow20 is LotterieThrow {

  ERC20 token;
  bool waitingInitValue = false;

  function bid (
    uint commitmentSeed
  ) public {
    // require(msg.value == 0);

    uint amount = token.allowance(msg.sender, address(this));
    require(token.transferFrom(msg.sender, address(this), amount));
    internal_bid(msg.sender,commitmentSeed,amount);
  }

  function mode() view public returns(uint8,address) {
    return (2,address(token)); // 20 mode
  }

  function withdrawAmount(uint amount) internal {
    token.transfer(msg.sender,amount);
  }

  function deffered_constructor(
    bool waitValue,
    address _token,
    uint paramsId,
    uint paramsPhaseId,
    uint32 ownerMargin,
    uint32 authorContractMargin,
    uint32 authorDappMargin,
    uint32 throwerMargin
  ) 
  public
  {
    require(waitingInitValue == false);
    token = ERC20(_token);

    internal_deffered_constructor(
      0,
      paramsId,
      paramsPhaseId,
      ownerMargin,
      authorContractMargin,
      authorDappMargin,
      throwerMargin
    );
    if (waitValue) {
      thr.currentPhase = Phase.Construct;
      waitingInitValue = true;
    }
  }

  function initPrize(
  )
  public
  {
    require(msg.sender == thrower);
    uint amount = token.allowance(msg.sender, address(this));
    require(token.transferFrom(msg.sender, address(this), amount));
    thr.results.totalBidValue = amount;
    thr.currentPhase = Phase.Bidding;
  }


}
