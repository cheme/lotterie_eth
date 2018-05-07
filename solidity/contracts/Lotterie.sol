pragma solidity ^0.4.23;
//pragma experimental ABIEncoderV2;

import "./LotterieMargins.sol";

// Contract for Lotterie
contract Lotterie is LotterieMargins {

  event NewParticipation(uint participationId,uint throwId,uint bid);
  // win event
  event Win(uint throwId, uint participationId, address winner, uint16 position, uint amount);
  // TODO index it and info for list of throw : harder than expected
  // probably need date to limit to a period range (which will be indexed)
  event NewThrow(uint throwId);

  // only to log, nothing useful to index, concealed seed could be removed if to costy (sha3 of hiddenseed or simply application of concealed function on seed)
  event Revealed(uint indexed throwId, uint participationId, uint256 hiddenSeed, uint256 concealedSeed);



  constructor(
    address _authorContract
  )
  Author(_authorContract)
  public
  { }


  // TODO start with already defined pointers (set of const pointers in storage on deploy)
  // start a thow
  // @payable value is added as inital win value (that way you can do free lotterie with something to win with minBidValue to 0 and not participating)
  function initThrow (
    uint paramsId,
    uint paramsPhaseId,

    uint32 ownerMargin,
    uint32 authorContractMargin,
    uint32 authorDappMargin,
    uint32 throwerMargin

  ) external payable {

    require(LC.validParticipationSwitch(
      params[paramsId].maxParticipant,
      params[paramsId].biddingTreshold,
      phaseParams[paramsPhaseId].participationStartTreshold
    ));
    uint throwId = allthrows.length;
    require(validWithdrawMargins(
      ownerMargin,
      authorContractMargin,
      authorDappMargin,
      throwerMargin));
    LC.LotterieWithdraw memory wdraw = LC.LotterieWithdraw({
      winningBase : 0,
      ownerMargin : ownerMargin,
      authorContractMargin : authorContractMargin,
      authorDappMargin : authorDappMargin,
      throwerMargin : throwerMargin,

      ownerWithdrawned : false,
      authorContractWithdrawned : false,
      authorDappWithdrawned : false,
      throwerWithdrawned : false

    });
    LotterieResult memory results = LotterieResult({
      totalBidValue : msg.value,
      totalClaimedValue : 0,
      firstWinner : 255,
      totalCashout : 0
    });

    LotterieThrow memory thr = LotterieThrow({
      paramsId : paramsId,
      paramsPhaseId : paramsPhaseId,
//      id : throwId,
      blockNumber : block.number,
      numberOfBid : 0,
      numberOfRevealParticipation : 0,
      currentSeed : 0,
      tmpTime : 0,
      thrower : msg.sender,
      currentPhase : Phase.Bidding,
      withdraws : wdraw,
      results : results
    });
    allthrows.push(thr);

    emit NewThrow(throwId);
  }

  function bid (
    uint throwId,
    uint commitmentSeed
  ) external payable forThrowStorage(throwId,Phase.Bidding) {
    // TODO this storage access is done in modifier, does compiler optimize it?
    // TODO diff with a function call for doing this check
    LotterieThrow storage thr = allthrows[throwId];
    LC.LotterieParams storage thrparams = params[thr.paramsId];
    require(msg.value >= thrparams.minBidValue);
    if (msg.value > 0) {
      thr.results.totalBidValue = thr.results.totalBidValue.add(msg.value);
    }
    thr.numberOfBid += 1;
    uint participationId = participations.length;
    Participation memory part = Participation({
      throwId : throwId,
      from : msg.sender,
//      bid : msg.value,
      seed : commitmentSeed,
      state : ParticipationState.BidSent
    });
    participations.push(part);
    emit NewParticipation(participationId,throwId,msg.value);
  }

  /// note that any user can use it, this is intended
  function revealParticipation (
    uint participationId,
    uint256 hiddenSeed
  ) external forParticipation(participationId,ParticipationState.BidSent,Phase.Participation) {
    Participation storage part = participations[participationId];
    // check seed (phase and throw checked in forParticipation)
    require(part.seed == uint(keccak256(hiddenSeed)));
    // update
    LotterieThrow storage thr = allthrows[part.throwId];
    LC.LotterieParams storage thrparams = params[thr.paramsId];
    thr.numberOfRevealParticipation += 1;
    if (thrparams.doSalt) {
      uint salt = LC.salt();
      thr.currentSeed = thr.currentSeed ^ hiddenSeed ^ salt;
    } else {
      thr.currentSeed = thr.currentSeed ^ hiddenSeed;
    }
    uint concealed = part.seed;
    part.seed = hiddenSeed;
    part.state = ParticipationState.Revealed;

    emit Revealed(part.throwId, participationId,hiddenSeed,concealed);

  }

  // should not be use in dapp, log should be used
  function checkPositionHeavyCost(uint participationId)
   external view returns (uint)
  {
    Participation storage part = participations[participationId];
    LotterieThrow storage thr = allthrows[part.throwId];
    LC.LotterieParams storage thrparams = params[thr.paramsId];
    LC.LotteriePhaseParams storage thrphaseparams = phaseParams[thr.paramsPhaseId];
    Phase calculatedNewPhase = getCurrentPhase(thr,thrparams,thrphaseparams);
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
    uint participationId,
    uint16 startPossibleIx
    //uint16 position
  ) external 
  {
    // using fn instead of modifier due to stack size
    forParticipationInternal(participationId,ParticipationState.Revealed,Phase.Cashout);
    Participation storage part = participations[participationId];

    part.state = ParticipationState.Cashout;

    LotterieThrow storage thr = allthrows[part.throwId];
    uint myScore = part.seed ^ thr.currentSeed;
    LC.LotterieParams storage thrparams = params[thr.paramsId];
    LC.WinningParams storage wparams = winningParams[thrparams.winningParamsId];
    
    Winner[] storage winners = allwinners[part.throwId];
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
        totalPositionWin : calcPositionWin(wparams.distribution,thr.results.totalCashout,thr.withdraws.winningBase), // TODO calculate winning part for next position
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
    uint participationId
  ) view external returns (uint)
  {
     Participation storage part = participations[participationId];
     Winner[] storage winners = allwinners[part.throwId];
     return (winners.length);
  }

  function getWinner (
    uint throwId,
    uint winnerIx
  ) view external returns (bool,uint,uint)
  {
     LotterieThrow storage thr = allthrows[throwId];
     Winner[] storage winners = allwinners[throwId];
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
     return (w.withdrawned, w.participationId, w.score);
 
  }

  // TODO remove (redundant with other method)
  function linkedWinnersLength (
    uint throwId
  ) view external returns(uint) {
     uint result = 0;
     // go through linked list
     LotterieThrow storage thr = allthrows[throwId];
     //LC.LotterieParams storage thrparams = params[thr.paramsId];
     //LC.WinningParams storage wparams = winningParams[thrparams.winningParamsId];
     Winner[] storage winners = allwinners[throwId];

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
    uint participationId
  ) view external returns(uint) {
     require(participationId < participations.length);
     uint result = 0;
     // go through linked list
     Participation storage part = participations[participationId];
     LotterieThrow storage thr = allthrows[part.throwId];
     uint myScore = part.seed ^ thr.currentSeed;
     //LC.LotterieParams storage thrparams = params[thr.paramsId];
     //LC.WinningParams storage wparams = winningParams[thrparams.winningParamsId];
     Winner[] storage winners = allwinners[part.throwId];

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
    uint participationId
  ) view external returns(uint) {
     require(participationId < participations.length);
     // go through linked list
     Participation storage part = participations[participationId];
     LotterieThrow storage thr = allthrows[part.throwId];
     Winner[] storage winners = allwinners[part.throwId];

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
  function emptyOffThrow(uint throwId)
    forThrowStorage(throwId,Phase.Off) 
    onlyOwner
    external {
    LotterieThrow storage thr = allthrows[throwId];
    uint amount = thr.results.totalBidValue.sub(thr.results.totalClaimedValue);
    if (amount != 0) {
      thr.results.totalClaimedValue += amount;
      msg.sender.transfer(amount);
    }
  }

/*  function emptyOffThrow2(uint throwId)
    onlyOwner
    external {

    LotterieThrow storage thr = allthrows[throwId];
    LC.LotterieParams storage thrparams = params[thr.paramsId];
    LC.LotteriePhaseParams storage thrphaseparams = phaseParams[thr.paramsPhaseId];
    Phase currentPhase = getCurrentPhase(thr,thrparams,thrphaseparams);
//    Phase currentPhase = thr.currentPhase;
    require(currentPhase == Phase.Off);
    uint amount = thr.results.totalBidValue.sub(thr.results.totalClaimedValue);
    if (amount != 0) {
      thr.results.totalClaimedValue += amount;
      msg.sender.transfer(amount);
    }
  }*/

  function withdrawWin(uint throwId, uint participationId)
    public 
    forParticipation(participationId,ParticipationState.Cashout,Phase.End) 
    {
     // go through linked list
     Participation storage part = participations[participationId];

     require(msg.sender == part.from);

     LotterieThrow storage thr = allthrows[part.throwId];
     Winner[] storage winners = allwinners[part.throwId];

     uint16 ptr = thr.results.firstWinner;


     uint result = 0;
     for (; ptr != 255 && result < thr.results.totalCashout; ++result) {
       require(ptr < winners.length);
       Winner storage w = winners[ptr];
       if (w.participationId == participationId) {
         // actual withdraw
         uint amount = winners[result].totalPositionWin;
         require(w.withdrawned == false);
         w.withdrawned = true;
         if (amount > 0) {
           thr.results.totalClaimedValue += amount;
           msg.sender.transfer(amount);
         }
         emit Win(throwId, participationId, msg.sender, uint16(result) + 1, amount);
         break;
       }
       ptr = w.nextWinner;
     }
     // fail if not found
     require(result != thr.results.totalCashout);
  }


}
