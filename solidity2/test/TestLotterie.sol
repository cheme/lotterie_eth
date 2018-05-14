pragma solidity ^0.4.23;
//pragma experimental ABIEncoderV2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Lotterie.sol";
import "../contracts/LotterieBase.sol";
import {LotterieConf as LC} from "../contracts/LotterieConf.sol";

contract TestLotterie {
/*
  function testInitialBalanceUsingDeployedContract() public {
    uint expected = 1 wei;

    Lotterie manager = Lotterie(DeployedAddresses.Lotterie());

//    uint thrId = manager.allthrows().length;
//    manager.initThrow(1 wei);


//    Assert.equal(manager.allthrows[thrId].totalBidValue, expected, "Throw should initialize to its thrower value");
  }

  function testInitialBalanceWithNewLotterie() public {
    Lotterie manager = new Lotterie();
//    Assert.equal(manager.allthrows().length, 0, "New lotterie should be empty"); TODO find how to get length without new function
    manager.initThrow(1 wei);
    uint expected = 0 wei;
    Assert.equal(manager.getThrow(0).totalBidValue, expected, "Throw should initialize to its thrower value");
    //Assert.equal(manager.allthrows(0).totalBidValue, expected, "Throw should initialize to its thrower value");

    // TODO test owner
  }
  function testABidToLow() public {
    Lotterie manager = new Lotterie();
    manager.initThrow(1 wei);
    uint expected = 0 wei;
    manager.bid(0,0);
    // TODO assert a revert : might need to test from js instead
  }
 
  function testABid() public {
    Lotterie manager = new Lotterie();
    manager.initThrow(0 wei);
    uint expected = 0 wei;
    manager.bid(0,0);
    // TODO test owner
  }
*/

  // check enum representation in targetted val
  function testParticipationEndModesVals () {
    Assert.equal(uint(uint8(LC.ParticipationEndModes.EagerAbsolute)),0,"wrong enum rep");
    Assert.equal(uint(uint8(LC.ParticipationEndModes.EagerRelative)),1,"wrong enum rep");
    Assert.equal(uint(uint8(LC.ParticipationEndModes.Absolute)),2,"wrong enum rep");
    Assert.equal(uint(uint8(LC.ParticipationEndModes.Relative)),3,"wrong enum rep");
  }
  function testCashoutEndModesVals () {
    Assert.equal(uint(uint8(LC.CashoutEndMode.Absolute)),0,"wrong enum rep");
    Assert.equal(uint(uint8(LC.CashoutEndMode.Relative)),1,"wrong enum rep");
  }
  function testPhaseVals () {
    Assert.equal(uint(uint8(LotterieBase.Phase.Bidding)),0,"wrong enum rep");
    Assert.equal(uint(uint8(LotterieBase.Phase.Participation)),1,"wrong enum rep");
    Assert.equal(uint(uint8(LotterieBase.Phase.Cashout)),2,"wrong enum rep");
    Assert.equal(uint(uint8(LotterieBase.Phase.End)),3,"wrong enum rep");
  }
  function testParticipationStateVals () {
    Assert.equal(uint(uint8(LotterieBase.ParticipationState.BidSent)),0,"wrong enum rep");
    Assert.equal(uint(uint8(LotterieBase.ParticipationState.Revealed)),1,"wrong enum rep");
  }

  function testMarginCalc () {
    Assert.equal(LC.calcMargin(1,uint32(0)),0,
      "0 margin ret 0");
    Assert.equal(LC.calcMargin(uint(-1),0),0,
      "0 margin val big ret 0");
    Assert.isBelow(LC.calcMargin(500,uint32(-1)/2),251,
      "50% margin all small");
    // need mult of max val to 0 round value
    Assert.equal(LC.calcMargin(uint(uint32(-1)/5000),uint32(-1)/2),(uint32(-1)/5000)/2,
      "50% margin all small");
    Assert.equal(LC.calcMargin(uint(uint32(-1)),uint32(-1)/2),(uint32(-1))/2,
      "50% margin all small");
    Assert.isBelow(LC.calcMargin(uint(uint32(-1)),uint32(-1)/2 -1),(uint32(-1))/2,
      "50% margin all small2");
    Assert.equal(LC.calcMargin(uint(uint32(-1)/2),uint32(-1)/2),(uint32(-1))/4,
      "50% margin all small3");
    Assert.isBelow(LC.calcMargin(uint(uint32(-1)/2),uint32(-1)/2 -1),(uint32(-1))/4,
      "50% margin all small4");
 
    Assert.isBelow(LC.calcMargin(uint(-1),uint32(-1)/2 -1),uint(-1)/2,
      "50% margin big");
    Assert.equal(LC.calcMargin(500,uint32(-1)),500,
      "100% margin ret all small");
    Assert.equal(LC.calcMargin(uint(-1),uint32(-1)),uint(-1),
      "100% margin ret all big");
    Assert.equal(LC.calcMargin(0,uint32(-1)/3),0,
      "0 bid ret 0");
    Assert.equal(LC.calcMargin(0,0),0,
      "0 bid ret 0 no margin");
    Assert.equal(LC.calcMargin(uint(-1),uint32(-1)),uint(-1),
      "very big (max) got no round value");
    Assert.equal(LC.calcMargin(333,uint32(-1)),333,
      "normal got no round value");
  }

}
