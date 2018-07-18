pragma solidity ^0.4.23;
//pragma experimental ABIEncoderV2;

import "./LotterieMargins.sol";
import "./FromLotterie.sol";
import { ThrowLib as TL } from "./lib/ThrowLib.sol";

// Contract for Lotterie
contract LotterieThrow is LotterieMargins {


  event NewParticipation(uint64 participationId,uint bid);
  // win event
  event Win(uint64 participationId, address winner, uint8 position, uint amount);
  // TODO index it and info for list of throw : harder than expected
  // probably need date to limit to a period range (which will be indexed)
  event NewThrow(uint throwId);

  // only to log, nothing useful to index, concealed seed could be removed if to costy (sha3 of hiddenseed or simply application of concealed function on seed)
  event Revealed(uint64 participationId, uint256 hiddenSeed, uint256 concealedSeed);


  function initPhaseParams (uint paramsPhaseId) internal {
    uint8 m1;
    uint8 m2;
   ( phaseParam.participationStartTreshold,
     phaseParam.participationEndValue,
     m1,
     m2
     )
     = lotterie.getPhaseParams1(paramsPhaseId);

   phaseParam.participationStartMode =
     LC.CashoutEndMode(m1);
   phaseParam.participationEndMode = 
     LC.ParticipationEndModes(m2);
   (
     phaseParam.cashoutEndValue,
     phaseParam.throwEndValue,
     m1,
     m2)
     = lotterie.getPhaseParams2(paramsPhaseId);

   phaseParam.cashoutEndMode = 
     LC.CashoutEndMode(m1);
   phaseParam.throwEndMode =
     LC.CashoutEndMode(m2);
  }

  function initParams (uint paramsId) internal {
    (param.authorDapp,
     param.winningParamsId,
     param.minBidValue,
     param.biddingTreshold,
     param.maxParticipant,
     param.doSalt)
    = lotterie.getParams(paramsId);
    initWinningParams(param.winningParamsId);
  }

  function initWinningParams (uint winningParamsId) internal {
   uint8 dis;
   (
     winningParam.nbWinners,
     winningParam.nbWinnerMinRatio,
     dis
   )
   = lotterie.getWinningParams(winningParamsId);
   winningParam.distribution = LC.WinningDistribution(dis);
  }


  function getThrow() external view returns(uint,uint,uint,uint,uint,uint64,uint64,address,uint,uint8) {
    return (thr.paramsId, thr.paramsPhaseId, thr.currentSeed, thr.results.totalBidValue, thr.results.totalClaimedValue, thr.numberOfBid, thr.numberOfRevealParticipation, thrower,thr.blockNumber, uint8(thr.currentPhase));
  }

  function getThrowWithdrawInfo() external view returns(uint32,uint32,uint32,uint32,bool,bool,bool,bool) {
    return (thr.withdraws.ownerMargin,thr.withdraws.authorContractMargin, thr.withdraws.authorDappMargin, thr.withdraws.throwerMargin,
    thr.withdraws.ownerWithdrawned, thr.withdraws.authorContractWithdrawned, thr.withdraws.authorDappWithdrawned, thr.withdraws.throwerWithdrawned);
  }

  function internal_bid (
    address _from,
    uint commitmentSeed,
    uint amount
  ) internal {

    TL.internal_bid(_from,commitmentSeed,amount,thr,participations,param,phaseParam,winningParam);
  }



  /// note that any user can use it, this is intended
  function revealParticipation (
    uint64 participationId,
    uint256 hiddenSeed
  ) external forParticipation(participationId,TL.ParticipationState.BidSent,TL.Phase.Participation) {
    TL.Participation storage part = participations[participationId];
    TL.revealParticipation (
    participationId,
    hiddenSeed,
    param.doSalt,
    thr,
    part
    );
  }

  // should not be use in dapp, log should be used
  function checkPositionHeavyCost(uint64 participationId)
   external view returns (uint)

  {
    return TL.checkPositionHeavyCost(participationId,thr,param,phaseParam,participations);
  }
  
 
  // startPossibleIx is current position in the last block state winners list
  // position is final calculated position; position is 0 for winner (-1)
  function cashOut (
    uint64 participationId,
    uint8 startPossibleIx
    //uint8 position
  ) external 

    forParticipation(participationId,TL.ParticipationState.Revealed,TL.Phase.Cashout)
  {
    // using fn instead of modifier due to stack size
    TL.Participation storage part = participations[participationId];
    TL.cashOut(
      participationId,
      startPossibleIx,
      part,
      thr,
      winners,
      winningParam.distribution
      );

  }

  function nbWinners (
  ) view external returns (uint)
  {
     return (winners.length);
  }

  function fisrtWinner (
  ) view external returns (uint)
  {
     return (thr.results.firstWinner);
  }
 

  function getWinner (
    uint winnerIx
  ) view external returns (bool,uint,uint)
  {
     return TL.getWinner(winnerIx, thr, winners);
  }

  // TODO remove (redundant with other method)
  function linkedWinnersLength (
  ) view external returns(uint) {
     uint result = 0;
     // go through linked list

     uint8 ptr = thr.results.firstWinner;

     for (; ptr != 255 && 
       result < thr.results.totalCashout;++result) {
       require(ptr < winners.length);
       TL.Winner storage w = winners[ptr];
       ptr = w.nextWinner;
     }
     
     return (result);
  }
 
  // a function to avoid some gas cost in cash out
  function currentIxAmongWinners (
    uint64 participationId
  ) view external returns(uint) {
     return TL.currentIxAmongWinners(participationId,thr,winners,participations);
  }

  // check the wining ix of a participation (after all cashout (phase end))
  // returns position win (0 for loser)
  function positionAtPhaseEnd (
    uint64 participationId
  ) view external returns(uint) {
//  return TL.positionAtPhaseEnd(participationId,thr,winners,participations.length);
     require(participationId < participations.length);
     // go through linked list

     uint8 ptr = thr.results.firstWinner;


     uint result = 0;
     for (; ptr != 255 && 
       result < thr.results.totalCashout;++result) {
       require(ptr < winners.length);
       TL.Winner storage w = winners[ptr];
       if (w.participationId == participationId) {
         return (result + 1);
       }
       ptr = w.nextWinner;
     }
     
     return (0);
  }

  // do not let stuck value in a throw
  function emptyOffThrow()
    forThrowStorage(TL.Phase.Off) 
    onlyOwner
    external {
    uint amount = thr.results.totalBidValue.sub(thr.results.totalClaimedValue);
    if (amount != 0) {
      thr.results.totalClaimedValue += amount;
      //msg.sender.transfer(amount);
      withdrawAmount(amount);
    }
  }

/*  function emptyOffThrow2()
    onlyOwner
    external {

    TL.Phase currentPhase = TL.getCurrentPhase(thr,param,phaseParam);
//    Phase currentPhase = thr.currentPhase;
    require(currentPhase == TL.Phase.Off);
    uint amount = thr.results.totalBidValue.sub(thr.results.totalClaimedValue);
    if (amount != 0) {
      thr.results.totalClaimedValue += amount;
      //msg.sender.transfer(amount);
      withdrawAmount(amount);
    }
  }*/

  function withdrawWin(uint64 participationId)
    public 
    forParticipation(participationId,TL.ParticipationState.Cashout,TL.Phase.End) 
    {
     // go through linked list
     TL.Participation storage part = participations[participationId];

     require(msg.sender == part.from);

     uint result = getWinningPos(participationId);
     // actual withdraw
     withdrawWinValue(participationId, result);
  }

  function withdrawWinValue(uint64 participationId, uint result) internal {
     uint amount = winners[result].totalPositionWin;
     require(winners[result].withdrawned == false);
     winners[result].withdrawned = true;
     if (amount > 0) {
       thr.results.totalClaimedValue += amount;
       // msg.sender.transfer(amount);
       withdrawAmount(amount);
     }
     emit Win(participationId, msg.sender, uint8(result) + 1, amount);
  }

  function getWinningPos(uint64 participationId) internal view returns (uint) {

     uint8 ptr = thr.results.firstWinner;
     uint result = 0;
     for (; ptr != 255 && result < thr.results.totalCashout; ++result) {
       require(ptr < winners.length);
       TL.Winner storage w = winners[ptr];
       if (w.participationId == participationId) {
         return(result);
       }
       ptr = w.nextWinner;
     }
     // fail if not found
     require(false);
  }


}
