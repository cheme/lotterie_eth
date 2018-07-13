pragma solidity ^0.4.23;
//pragma experimental ABIEncoderV2;

import "./LotterieMargins.sol";
import "./FromLotterie.sol";

// Contract for Lotterie
contract LotterieThrow is LotterieMargins {


  event NewParticipation(uint64 participationId,uint bid);
  // win event
  event Win(uint64 participationId, address winner, uint16 position, uint amount);
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

  // bid logic without payment processing
  function internal_bid (
    address _from,
    uint commitmentSeed,
    uint amount
  ) internal forThrowStorage(Phase.Bidding) {
    require(amount >= param.minBidValue);
    if (amount > 0) {
      thr.results.totalBidValue = thr.results.totalBidValue.add(amount);
    }
    thr.numberOfBid += 1;
    uint64 participationId = uint64(participations.length);
    Participation memory part = Participation({
      from : _from,
//      bid : amount,
      seed : commitmentSeed,
      state : ParticipationState.BidSent
    });
    participations.push(part);
    emit NewParticipation(participationId,amount);
  }



  /// note that any user can use it, this is intended
  function revealParticipation (
    uint64 participationId,
    uint256 hiddenSeed
  ) external forParticipation(participationId,ParticipationState.BidSent,Phase.Participation) {
    Participation storage part = participations[participationId];
    // check seed (phase and throw checked in forParticipation)
    require(part.seed == uint(keccak256(abi.encodePacked(hiddenSeed))));
    // update
    thr.numberOfRevealParticipation += 1;
    if (param.doSalt) {
      uint salt = LC.salt();
      thr.currentSeed = thr.currentSeed ^ hiddenSeed ^ salt;
    } else {
      thr.currentSeed = thr.currentSeed ^ hiddenSeed;
    }
    uint concealed = part.seed;
    part.seed = hiddenSeed;
    part.state = ParticipationState.Revealed;

    emit Revealed(participationId,hiddenSeed,concealed);

  }

  // should not be use in dapp, log should be used
  function checkPositionHeavyCost(uint64 participationId)
   external view returns (uint)
  {
    Participation storage part = participations[participationId];
    Phase calculatedNewPhase = getCurrentPhase();
    require(calculatedNewPhase != Phase.Bidding);
    require(calculatedNewPhase != Phase.Participation);

    uint myScore = part.seed ^ thr.currentSeed;
    uint position = thr.numberOfBid;
    for(uint i = 0; i < participations.length; ++i) {
      if (i != participationId) {
        Participation storage pelse = participations[i];
        uint pscore = pelse.seed ^ thr.currentSeed;
        if (myScore > pscore || (myScore == pscore && participationId < i)) {
          --position;
        }
      }
    }
    return (position);
  }
  
 
  // startPossibleIx is current position in the last block state winners list
  // position is final calculated position; position is 0 for winner (-1)
  function cashOut (
    uint64 participationId,
    uint16 startPossibleIx
    //uint16 position
  ) external 
  {
    // using fn instead of modifier due to stack size
    forParticipationInternal(participationId,ParticipationState.Revealed,Phase.Cashout);
    Participation storage part = participations[participationId];

    part.state = ParticipationState.Cashout;

    uint myScore = part.seed ^ thr.currentSeed;
    
    require(startPossibleIx <= winners.length);
    Winner storage w;
    uint16 ptr = thr.results.firstWinner;
    uint16 iter = 0;
    uint16 before = 255;
    if (startPossibleIx > 0) {
      require(ptr != 255);
      for (;ptr != 255 && iter < startPossibleIx; iter++) {
        w = winners[ptr];
        before = ptr;
        ptr = w.nextWinner;
      }
      //w = winners[before];
      // compare with previous
      // we need to check n-1 is superior 
      // (otherwhise best score could take place of others)
      // TODO remove those require when correctly tested (no cost gain currently)
      require(myScore <= w.score);
      if (w.score == myScore) {
        require(participationId > w.participationId);
      }
    }
    for (;
      // not null ptr
      ptr != 255 &&
      // in result nb
      iter < thr.results.totalCashout; iter++) {
      w = winners[ptr];
      if (myScore > w.score || (myScore == w.score && participationId < w.participationId)) {
        break; 
      } else {
        before = ptr;
        ptr = w.nextWinner;
      }
    }
    uint16 next = 255;
    // next TODO include in loop
    if (before == 255) {
      next = thr.results.firstWinner;
    } else {
      next = winners[before].nextWinner;
    }


    if (winners.length < thr.results.totalCashout) {
      // initiate a cashout value if not all used
      winners.push(Winner({
        withdrawned : false,
        totalPositionWin : calcPositionWin(winningParam.distribution,thr.results.totalCashout,thr.withdraws.winningBase), // TODO calculate winning part for next position
        participationId : participationId,
        score : myScore,
        nextWinner : next
      }));
      iter = uint16(winners.length) - 1;
    } else {
      for (; w.nextWinner != 255 && iter < thr.results.totalCashout; iter++) {
        ptr = w.nextWinner;
        w = winners[ptr];
      }
      w.participationId = participationId;
      w.score = myScore;
      w.nextWinner = next;
      iter = ptr;
    }

    // insert
    if (before == 255) {
      thr.results.firstWinner = iter;
    } else {
      winners[before].nextWinner = iter;
    }

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
     require(winnerIx < winners.length);
     Winner storage w;
     uint16 ptr = thr.results.firstWinner;
     for (uint iter = 0; ptr != 255 && 
       iter < winnerIx;++iter) {
       require(ptr < winners.length);
       w = winners[ptr];
       ptr = w.nextWinner;
     }
     require(ptr != 255);
     w = winners[ptr];
     return (winners[winnerIx].withdrawned, w.participationId, w.score);
  }

  // TODO remove (redundant with other method)
  function linkedWinnersLength (
  ) view external returns(uint) {
     uint result = 0;
     // go through linked list

     uint16 ptr = thr.results.firstWinner;

     for (; ptr != 255 && 
       result < thr.results.totalCashout;++result) {
       require(ptr < winners.length);
       Winner storage w = winners[ptr];
       ptr = w.nextWinner;
     }
     
     return (result);
  }
 
  // a function to avoid some gas cost in cash out
  function currentIxAmongWinners (
    uint64 participationId
  ) view external returns(uint) {
     require(participationId < participations.length);
     uint result = 0;
     // go through linked list
     Participation storage part = participations[participationId];
     uint myScore = part.seed ^ thr.currentSeed;

     uint16 ptr = thr.results.firstWinner;

     for (; ptr != 255 && 
       result < thr.results.totalCashout;++result) {
       require(ptr < winners.length);
       Winner storage w = winners[ptr];
       if (myScore > w.score || (myScore == w.score && participationId < w.participationId)) {
         return (result);
       }
       ptr = w.nextWinner;
     }
     
     return (result);
  }

  // check the wining ix of a participation (after all cashout (phase end))
  // returns position win (0 for loser)
  function positionAtPhaseEnd (
    uint64 participationId
  ) view external returns(uint) {
     require(participationId < participations.length);
     // go through linked list

     uint16 ptr = thr.results.firstWinner;


     uint result = 0;
     for (; ptr != 255 && 
       result < thr.results.totalCashout;++result) {
       require(ptr < winners.length);
       Winner storage w = winners[ptr];
       if (w.participationId == participationId) {
         return (result + 1);
       }
       ptr = w.nextWinner;
     }
     
     return (0);
  }

  // do not let stuck value in a throw
  function emptyOffThrow()
    forThrowStorage(Phase.Off) 
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

    Phase currentPhase = getCurrentPhase();
//    Phase currentPhase = thr.currentPhase;
    require(currentPhase == Phase.Off);
    uint amount = thr.results.totalBidValue.sub(thr.results.totalClaimedValue);
    if (amount != 0) {
      thr.results.totalClaimedValue += amount;
      //msg.sender.transfer(amount);
      withdrawAmount(amount);
    }
  }*/

  function withdrawWin(uint64 participationId)
    public 
    forParticipation(participationId,ParticipationState.Cashout,Phase.End) 
    {
     // go through linked list
     Participation storage part = participations[participationId];

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
     emit Win(participationId, msg.sender, uint16(result) + 1, amount);
  }

  function getWinningPos(uint64 participationId) internal view returns (uint) {

     uint16 ptr = thr.results.firstWinner;
     uint result = 0;
     for (; ptr != 255 && result < thr.results.totalCashout; ++result) {
       require(ptr < winners.length);
       Winner storage w = winners[ptr];
       if (w.participationId == participationId) {
         return(result);
       }
       ptr = w.nextWinner;
     }
     // fail if not found
     require(false);
  }

 
}
