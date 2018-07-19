
pragma solidity ^0.4.23;

import "../../if/LotterieIf.sol";
import { LotterieConf as LC } from "../../LotterieConf.sol";

import "../../zeppelin/math/SafeMath.sol";

library ThrowLib {

  using SafeMath for uint;
  using SafeMath for uint64; // TODO update safemath to latest openzeppelin (currently no fn)
	

  event ChangePhase(Phase newPhase);
  event NewParticipation(uint64 participationId,uint bid);

  // only to log, nothing useful to index, concealed seed could be removed if to costy (sha3 of hiddenseed or simply application of concealed function on seed)
  event Revealed(uint64 participationId, uint256 hiddenSeed, uint256 concealedSeed);

  struct LThrow {
    uint paramsId;
    uint paramsPhaseId;
    uint blockNumber; // not sure if needed : use to filter a bit
    //uint id; useless (is index)
    uint currentSeed;
    uint tmpTime;
    uint64 numberOfBid;
    uint64 numberOfRevealParticipation;

    // reward author of dapp
    Phase currentPhase;

    LC.LotterieWithdraw withdraws;
    LotterieResult results;
  }

  struct LotterieResult {
    uint totalBidValue;
    uint totalClaimedValue;
    uint8 totalCashout;
    // linked list over winners sort by rank
    uint8 firstWinner;
  }

  enum Phase {
    Construct,
    Bidding,
    Participation,
    Cashout,
    End,
    Off
  }

  struct Participation {
    uint seed;
    address from;
//   uint bid;
    ParticipationState state;
  }

  enum ParticipationState {
    BidSent,
    Revealed,
    Cashout
  }

  struct Winner {
    bool withdrawned;
    // warning it is not the user winnig but the winning at this position
    uint totalPositionWin;
    uint64 participationId;
    uint score;
    // winners is stored as a linked list (0 being null)
    uint8 nextWinner;
  }

  // ----- LotterieMargins
  function withdrawOwner(
    LThrow storage thr,
    LC.LotterieParams storage param,
    LC.LotteriePhaseParams storage phaseParam,
    LC.WinningParams storage winningParam
  ) public returns (uint) {
    forThrowStorageMyPhaseNot2(Phase.Bidding,Phase.Off,thr,param,phaseParam,winningParam);

    if (thr.withdraws.ownerWithdrawned == false) {
      uint amount = LC.calcMargin(thr.results.totalBidValue, thr.withdraws.ownerMargin);

      if (amount > 0) {
        thr.withdraws.ownerWithdrawned = true;
        thr.results.totalClaimedValue += amount;
//        msg.sender.transfer(amount);
        return amount;
      }
    }
    return 0;
  }

  function withdrawContractAuthor(
    LThrow storage thr,
    LC.LotterieParams storage param,
    LC.LotteriePhaseParams storage phaseParam,
    LC.WinningParams storage winningParam
  ) public returns (uint) {
    forThrowStorageMyPhaseNot2(Phase.Bidding,Phase.Off,thr,param,phaseParam,winningParam);
    
    if (thr.withdraws.authorContractWithdrawned == false) {
    uint amount = LC.calcMargin(thr.results.totalBidValue, thr.withdraws.authorContractMargin);
      if (amount > 0) {
        thr.withdraws.authorContractWithdrawned = true;
        thr.results.totalClaimedValue += amount;
        //msg.sender.transfer(amount);
        return amount;
      }
    }
    return 0;
  }

  function withdrawThrower(
    LThrow storage thr,
    LC.LotterieParams storage param,
    LC.LotteriePhaseParams storage phaseParam,
    LC.WinningParams storage winningParam
  ) public returns (uint) {
    forThrowStorageMyPhaseNot2(Phase.Bidding,Phase.Off,thr,param,phaseParam,winningParam);
 
    if (thr.withdraws.throwerWithdrawned == false) {
    uint amount = LC.calcMargin(thr.results.totalBidValue, thr.withdraws.throwerMargin);
      if (amount > 0) {
        thr.withdraws.throwerWithdrawned = true;
        thr.results.totalClaimedValue += amount;
        //msg.sender.transfer(amount);
        return amount;
      }
    }
    return 0;
  }

  function withdrawDappAuthor(
    LThrow storage thr,
    LC.LotterieParams storage param,
    LC.LotteriePhaseParams storage phaseParam,
    LC.WinningParams storage winningParam
  ) public returns (uint) {
    forThrowStorageMyPhaseNot2(Phase.Bidding,Phase.Off,thr,param,phaseParam,winningParam);

    if (thr.withdraws.authorDappWithdrawned == false) {
    uint amount = LC.calcMargin(thr.results.totalBidValue, thr.withdraws.authorDappMargin);
      if (amount > 0) {
        thr.withdraws.authorDappWithdrawned = true;
        thr.results.totalClaimedValue += amount;
        //msg.sender.transfer(amount);
        return amount;
      }
    }
    return 0;
  }


  // ---- Base
  function calcPositionWin(LC.WinningDistribution distribution,uint8 totalWin, uint base) public pure returns(uint) {
    if (distribution == LC.WinningDistribution.Equal) {
      return base / uint(totalWin);
    }
    return 0;
  }

  // ------------- LotteriePhase
  function canSwitchToParticipation(
    LThrow storage thr,
    LC.LotterieParams storage param,
    LC.LotteriePhaseParams storage phaseParam
    ) internal view returns(bool) {
    // costless criterion first
    if (param.maxParticipant > 0 && thr.numberOfBid == param.maxParticipant) {
      return true;
    }
    if (param.biddingTreshold > 0 && thr.results.totalBidValue >= param.biddingTreshold) {
      return true;
    }
    if (phaseParam.participationStartTreshold > 0) {
      if (now >= thr.tmpTime) {
        return true;
      }
    }
    return false;
  }

  function canSwitchToCashout(
    LThrow storage thr,
    LC.LotteriePhaseParams storage phaseParam
  ) public view returns(bool) {
    // test eager first (avoid call to now)
    if (phaseParam.participationEndMode == LC.ParticipationEndModes.EagerRelative
        || phaseParam.participationEndMode == LC.ParticipationEndModes.EagerAbsolute) {
      if (thr.numberOfRevealParticipation == thr.numberOfBid) {
        // TODO switch those == with >= and assert not > to detect problems during testing?
        return true;
      }
    }
    if (now >= thr.tmpTime) {
      return true;
    }

    return false;
  }

  function canSwitchToEnded(
    LThrow storage thr
  ) public view returns(bool) {
    if (now >= thr.tmpTime) {
      return true;
    }
    return false;
  }
  function canSwitchToOff(
    LThrow storage thr
  ) public view returns(bool) {
    return canSwitchToEnded(thr);
  }




  // do not try switching to phase + 2 due to relative time condition
  function getCurrentPhase(
    LThrow storage thr,
    LC.LotterieParams storage param,
    LC.LotteriePhaseParams storage phaseParam
  ) public view returns(Phase) {
    if (thr.currentPhase == Phase.Bidding) {
      if (canSwitchToParticipation(thr,param,phaseParam)) {
        return Phase.Participation;
      }
    } else if (thr.currentPhase == Phase.Participation) { 
      if (canSwitchToCashout(thr,phaseParam)) {
        return Phase.Cashout;
      }
    } else if (thr.currentPhase == Phase.Cashout
      && canSwitchToEnded(thr)) {
      return Phase.End;
    } else if (thr.currentPhase == Phase.End
      && canSwitchToOff(thr)) {
      return Phase.Off;
    }
 
    return thr.currentPhase;
  }

  // switch phase if needed and return current phase
  function forThrowStorageMyPhase(
    LThrow storage thr,
    LC.LotterieParams storage param,
    LC.LotteriePhaseParams storage phaseParam,
    LC.WinningParams storage winningParam
 
  ) public returns (Phase) {
    Phase calculatedNewPhase = getCurrentPhase(thr,param,phaseParam);
    // lazy init (additional cost on first user to switch phase)
    if (thr.currentPhase != calculatedNewPhase) {
      thr.currentPhase = calculatedNewPhase;
      if (calculatedNewPhase == Phase.Participation) {
        // calculate relative end time for relative mode
        if (phaseParam.participationEndValue > 0) {
          if (phaseParam.participationEndMode == LC.ParticipationEndModes.EagerRelative
           || phaseParam.participationEndMode == LC.ParticipationEndModes.Relative) {
            thr.tmpTime = now + phaseParam.participationEndValue;
          } else {
            thr.tmpTime = phaseParam.participationEndValue;
          }
        }
      } else if (calculatedNewPhase == Phase.Cashout) {
        // init winning base
        if (thr.results.totalBidValue != 0) {
          thr.withdraws.winningBase = thr.results.totalBidValue
            - LC.calcMargin(thr.results.totalBidValue, thr.withdraws.authorContractMargin)
            - LC.calcMargin(thr.results.totalBidValue, thr.withdraws.authorDappMargin)
            - LC.calcMargin(thr.results.totalBidValue, thr.withdraws.throwerMargin)
            - LC.calcMargin(thr.results.totalBidValue, thr.withdraws.ownerMargin);
        }
        // calculate nbCashout
        thr.results.totalCashout = calcTotalCashout(thr,winningParam);
        if (phaseParam.cashoutEndMode == LC.CashoutEndMode.Relative) {
          thr.tmpTime = now + phaseParam.cashoutEndValue;
        } else {
          thr.tmpTime = phaseParam.cashoutEndValue;
        }
      } else if (calculatedNewPhase == Phase.End) {
        if (phaseParam.throwEndMode == LC.CashoutEndMode.Relative) {
          thr.tmpTime = now + phaseParam.throwEndValue;
        } else {
          thr.tmpTime = phaseParam.throwEndValue;
        }
      }
      emit ChangePhase(calculatedNewPhase);
    }
    return (thr.currentPhase);
  }

  function forThrowStorageMyPhaseNot2(
    Phase throwPhase1,
    Phase throwPhase2,
    LThrow storage thr,
    LC.LotterieParams storage param,
    LC.LotteriePhaseParams storage phaseParam,
    LC.WinningParams storage winningParam
 
  ) public returns (Phase) {
    Phase currentPhase = forThrowStorageMyPhase(thr,param,phaseParam,winningParam);
    require(currentPhase != throwPhase1);
    require(currentPhase != throwPhase2);
    return currentPhase;
 
  }

  function calcTotalCashout(
   LThrow storage thr,
   LC.WinningParams storage winningParam
  ) public view returns (uint8) {
      uint ratioBidWinner = uint(thr.numberOfBid) * winningParam.nbWinnerMinRatio / 100;
      uint8 rcashout;
      // calculate nbCashout
      if (ratioBidWinner < uint(winningParam.nbWinners)) {
         if (ratioBidWinner == 0) {
           rcashout = 1;
         } else {
           rcashout = uint8(ratioBidWinner);
         }
      } else {
        rcashout = winningParam.nbWinners;
      }
      return(rcashout);
  }

  function totalCashout(
   LThrow storage thr,
   LC.LotterieParams storage param,
   LC.LotteriePhaseParams storage phaseParam,
   LC.WinningParams storage winningParam
  ) external view returns (uint8) {
    Phase currentPhase = getCurrentPhase(thr,param,phaseParam);
    if (currentPhase == Phase.Cashout) {
      return (calcTotalCashout(thr,winningParam));
    }
    return (thr.results.totalCashout);
  }




  // ------------- LotterieThrow
  function checkPositionHeavyCost(
    uint64 participationId,
    LThrow storage thr,
    LC.LotterieParams storage param,
    LC.LotteriePhaseParams storage phaseParam,
    Participation[] storage participations
  )
   public view returns (uint)
  {
    Phase calculatedNewPhase = getCurrentPhase(thr,param,phaseParam);
    require(calculatedNewPhase != Phase.Bidding);
    require(calculatedNewPhase != Phase.Participation);

    Participation storage part = participations[participationId];
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
 
  // bid logic without payment processing
  function internal_bid (
    address _from,
    uint commitmentSeed,
    uint amount,
    LThrow storage thr,
    Participation[] storage participations,
    LC.LotterieParams storage param,
    LC.LotteriePhaseParams storage phaseParam,
    LC.WinningParams storage winningParam
  ) public {

    require(amount >= param.minBidValue);
    Phase currentPhase = forThrowStorageMyPhase(thr,param,phaseParam,winningParam);
    require(currentPhase == Phase.Bidding);
 
    if (amount > 0) {
      thr.results.totalBidValue = thr.results.totalBidValue.add(amount);
    }
    thr.numberOfBid += 1;
    Participation memory part = Participation({
      from : _from,
//      bid : amount,
      seed : commitmentSeed,
      state : ParticipationState.BidSent
    });
    participations.push(part);
    uint64 participationId = uint64(participations.length - 1);
    emit NewParticipation(participationId,amount);
  }

  function revealParticipation (
    uint64 participationId,
    uint256 hiddenSeed,
    bool doSalt,
    LThrow storage thr,
    Participation storage part
  ) public {
    // check seed (phase and throw checked in forParticipation)
    require(part.seed == uint(keccak256(abi.encodePacked(hiddenSeed))));
    // update
    thr.numberOfRevealParticipation += 1;
    if (doSalt) {
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
  
  function cashOut (
    uint64 participationId,
    uint8 startPossibleIx,
    Participation storage part,
    LThrow storage thr,
    Winner[] storage winners,
    LC.WinningDistribution distribution
  ) public 
  {
    part.state = ParticipationState.Cashout;

    uint myScore = part.seed ^ thr.currentSeed;
    
    require(startPossibleIx <= winners.length);
    Winner storage w;
    uint8 ptr = thr.results.firstWinner;
    uint8 iter = 0;
    uint8 before = 255;
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
    uint8 next = 255;
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
        totalPositionWin : calcPositionWin(distribution,thr.results.totalCashout,thr.withdraws.winningBase), // TODO calculate winning part for next position
        participationId : participationId,
        score : myScore,
        nextWinner : next
      }));
      iter = uint8(winners.length - 1);
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

  function getWinner (
    uint winnerIx,
    LThrow storage thr,
    Winner[] storage winners
  ) view public returns (bool,uint,uint)
  {
     require(winnerIx < winners.length);
     Winner storage w;
     uint8 ptr = thr.results.firstWinner;
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

  // a function to avoid some gas cost in cash out
  function currentIxAmongWinners (
    uint64 participationId,
    LThrow storage thr,
    Winner[] storage winners,
    Participation[] storage participations
  ) view external returns(uint) {
     require(participationId < participations.length);
     uint result = 0;
     // go through linked list
     Participation storage part = participations[participationId];
     uint myScore = part.seed ^ thr.currentSeed;

     uint8 ptr = thr.results.firstWinner;

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

/*  function positionAtPhaseEnd (
    uint64 participationId,
    LThrow storage thr,
    Winner[] storage winners,
    uint participationsLength
 
  ) view external returns(uint) {
     require(participationId < participationsLength);
     // go through linked list

     uint8 ptr = thr.results.firstWinner;


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

*/
 
  function initPhaseParams (
  uint paramsPhaseId,
  LotterieIf lotterie,
  LC.LotteriePhaseParams storage phaseParam
  ) public {
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

  function initParams (
   uint paramsId,
   LotterieIf lotterie,
   LC.LotterieParams storage param,
   LC.WinningParams storage winningParam
   ) public  {
    (param.authorDapp,
     param.winningParamsId,
     param.minBidValue,
     ,
     ,
     )
    = lotterie.getParams(paramsId);
    (,
     ,
     ,
     param.biddingTreshold,
     param.maxParticipant,
     param.doSalt)
    = lotterie.getParams(paramsId);
  
    initWinningParams(param.winningParamsId,lotterie,winningParam);
  }

  function initWinningParams (
  uint winningParamsId,
  LotterieIf lotterie,
  LC.WinningParams storage winningParam
  ) internal {
   uint8 dis;
   (
     winningParam.nbWinners,
     winningParam.nbWinnerMinRatio,
     dis
   )
   = lotterie.getWinningParams(winningParamsId);
   winningParam.distribution = LC.WinningDistribution(dis);
  }



  // --------- LotterieThrow721
  function internal_deffered_constructor(

    uint amount,
    uint paramsId,
    uint paramsPhaseId,

    uint32 ownerMargin,
    uint32 authorContractMargin,
    uint32 authorDappMargin,
    uint32 throwerMargin,
    Phase cp,
    LThrow storage thr,
    LC.LotteriePhaseParams storage phaseParam
  ) 
  public
  {

    uint tnext;

    if (phaseParam.participationStartTreshold > 0) {
      if (phaseParam.participationStartMode == LC.CashoutEndMode.Relative) { 
        tnext = now + phaseParam.participationStartTreshold;
      } else {
        require (phaseParam.participationStartMode == LC.CashoutEndMode.Absolute);
        require (phaseParam.participationStartTreshold > now);
        tnext = phaseParam.participationStartTreshold;
      }
    } else {
      uint limit = 57 weeks; // not true infinite at 0 (a year seemleessly)
      tnext = now + limit;
    }
    thr.paramsId = paramsId;
    thr.paramsPhaseId = paramsPhaseId;
    thr.blockNumber = block.number;
    thr.numberOfBid = 0;
    thr.numberOfRevealParticipation = 0;
    thr.currentSeed = 0;
    thr.tmpTime = tnext;
    thr.currentPhase = cp;
    thr.withdraws = LC.LotterieWithdraw({
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
    thr.results = LotterieResult({
      totalBidValue : amount,
      totalClaimedValue : 0,
      firstWinner : 255,
      totalCashout : 0
      });

 
  }


}
