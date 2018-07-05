// keep 223 version with costy delegatecall for possible future reuse (currently it is simple enough to avoid dcall

pragma solidity ^0.4.23;

import "./LotterieThrow721.sol";
import './ERC223-token-standard/token/ERC223/ERC223_interface.sol';
import './ERC223-token-standard/token/ERC223/ERC223_receiving_contract.sol';

contract LotterieThrow223 is LotterieThrow721, ERC223ReceivingContract {

  ERC223Interface token;
  bool waitingInitValue = false;
  uint private currentAmount = 0;
  address private currentFrom = 0;

  function bid (
    uint commitmentSeed
  ) public {
    // require(msg.value == 0);
    if (currentAmount == 0) {
      internal_bid(msg.sender,commitmentSeed,0);
    } else {
      internal_bid(currentFrom,commitmentSeed,currentAmount);
      currentAmount = 0;
    }
  }

  function mode() view public returns(uint8,address) {
    return (1,address(token)); // 223 mode
  }

  function withdrawAmount(uint amount) internal {
    token.transfer(msg.sender,amount);
  }

  function tokenFallback(address _from, uint _value, bytes _data) {
    // code does not allow 0 (0 indicates direct api call)
    require(_value != 0);
    require(msg.sender == address(token));
    // corner case of possible phase switch (but if right call should not happen)
    require(thr.currentPhase == Phase.Bidding || thr.currentPhase == Phase.Construct);
    currentAmount = _value;
    currentFrom = _from;
    require(address(this).delegatecall(_data));
  }

  function deffered_constructor(
    bool waitValue,
    uint16 nb721,
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
    token = ERC223Interface(_token);

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
    if (waitValue) {
      thr.currentPhase = Phase.Construct;
      waitingInitValue = true;
    }
  }

  function initPrize(
  )
  public
  {
    require(currentFrom == thrower);
    thr.currentPhase = Phase.Bidding;
    thr.results.totalBidValue = currentAmount;
    currentAmount = 0;
  }


}
