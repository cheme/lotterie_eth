
pragma solidity ^0.4.23;

import "../721/LotterieThrow721.sol";
import '../../zeppelin/token/ERC20/ERC20.sol';
import { ThrowLib as TL } from "../lib/ThrowLib.sol";

contract LotterieThrow20 is LotterieThrow721 {

  ERC20 token;
  uint8 public waitingInitValue = 0;

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
    uint8 nb721,
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
    require(waitingInitValue == 0);
    token = ERC20(_token);
    if (waitValue) {
      waitingInitValue = 1;
    } else {
      waitingInitValue = 2;
    }

    internal_deffered_constructor(
      0,
      nb721,
      paramsId,
      paramsPhaseId,
      ownerMargin,
      authorContractMargin,
      authorDappMargin,
      throwerMargin
    );
  }

  function otherConditionConstruct() internal returns (bool) {
    return (waitingInitValue == 1);
  }

  function initPrize(
  )
  public
  {
    require(thr.currentPhase == TL.Phase.Construct);
    require (waitingInitValue == 1);
    require(msg.sender == thrower);
    uint amount = token.allowance(msg.sender, address(this));
    require(token.transferFrom(msg.sender, address(this), amount));
    thr.results.totalBidValue = amount;

    if (0 == nbERC721) {
      thr.currentPhase = TL.Phase.Bidding;
    } else {
      waitingInitValue = 2;
    }
  }



}
