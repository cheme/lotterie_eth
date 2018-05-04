pragma solidity ^0.4.23;
pragma experimental ABIEncoderV2;

import "./LotterieLib.sol";
import { LotterieConf as LC } from "./LotterieConf.sol";
import "./zeppelin/ownership/Ownable.sol";
import "./zeppelin/math/SafeMath.sol";

// Contract for Lotterie

contract Lotterie is Ownable, LotterieLib {

  // for debugging
  event Withdraw(address to, uint amount);
  // win event
  event Win(uint throwId, uint participationId, address winner, uint16 position, uint amount);
  // TODO index it and info for list of throw : harder than expected
  // probably need date to limit to a period range (which will be indexed)
  event NewThrow(uint throwId);

  // TODO index : throwId likely, participationId not really do not know)
  event NewParticipation(uint participationId,uint throwId,uint bid);

  // probby indexed on throwId TODO assert newPhase is uint8
  event ChangePhase(uint throwId, Phase newPhase);

  // only to log, nothing useful to index
  event Revealed(uint indexed throwId, uint participationId, uint256 hiddenSeed);

  // address to reward author TODO move in its contract
  address public authorContract;
  LotterieThrow [] public allthrows; // TODO not public (access to set if public??)
  // wining params accessor 
  function getThrowsCount() public constant returns(uint) {
    return allthrows.length;
  }


  // TODO test other defs
  mapping(uint => Winner[]) public allwinners; // TODO not public (access to set if public??)
  LC.LotterieParams [] public params; // TODO not public (access to set if public??)
  LC.LotteriePhaseParams [] public phaseParams; // TODO not public (access to set if public??)

  LC.WinningParams [] public winningParams; // TODO not public (access to set if public??)

  // wining params accessor 
  function getWiningParamsCount() public constant returns(uint) {
    return winningParams.length;
  }

  function getWinningParams(uint index) public constant returns(uint16, uint16, uint8) {
    LC.WinningParams storage p = winningParams[index]; 
    return (p.nbWinners,p.nbWinnerMinRatio, uint8(p.distribution));
  }

  Participation [] public participations; // TODO not public (access to set if public??)

  function getParticipationsCount() public constant returns(uint) {
    return participations.length;
  }

 
  function getParticipation(uint participationId) public constant returns(uint,uint,address,uint8) {
    Participation storage part = participations[participationId];
    return (part.throwId, part.seed, part.from, uint8(part.state));
  }




  // ensure right phase for throw action
  // TODO diff with a function call or find a way to use thr in fn
  // TODO rename to forThrow
  modifier forThrowStorage(uint throwId, Phase throwPhase) {
    forThrowStorageInternal(throwId, throwPhase);
    _;
  }
/*  modifier forThrowStorageNot(uint throwId, Phase throwPhase) {
    Phase currentPhase = forThrowStorageMyPhase(throwId);
    require(currentPhase != throwPhase);
    _;
  }*/
  modifier forThrowStorageNot2(uint throwId, Phase throwPhase1, Phase throwPhase2) {
    Phase currentPhase = forThrowStorageMyPhase(throwId);
    require(currentPhase != throwPhase1);
    require(currentPhase != throwPhase2);
    _;
  }


  modifier forParticipation(uint participationId, ParticipationState participationState, Phase throwPhase) {
    forParticipationInternal(participationId, participationState, throwPhase);
    _;
  }
  function forParticipationInternal(uint participationId, ParticipationState participationState, Phase throwPhase) internal {
    require(participations.length > participationId);
    Participation storage part = participations[participationId];
    require(part.state == participationState);
    Phase currentPhase = forThrowStorageMyPhase(part.throwId);
    require(currentPhase == throwPhase);
  }
 
  function forThrowStorageInternal(uint throwId, Phase throwPhase) internal {
    Phase currentPhase = forThrowStorageMyPhase(throwId);
    require(currentPhase == throwPhase);
  }

  // switch phase if needed and return current phase
  function forThrowStorageMyPhase(uint throwId) internal returns (Phase) {
    require(allthrows.length > throwId);
    LotterieThrow storage thr = allthrows[throwId];
    LC.LotterieParams storage thrparams = params[thr.paramsId];
    LC.LotteriePhaseParams storage thrphaseparams = phaseParams[thr.paramsPhaseId];
    Phase calculatedNewPhase = getCurrentPhase(thr,thrparams,thrphaseparams);
    // lazy init (additional cost on first user to switch phase)
    if (thr.currentPhase != calculatedNewPhase) {
      thr.currentPhase = calculatedNewPhase;
      if (calculatedNewPhase == Phase.Participation) {
        // calculate relative end time for relative mode
        if (thrphaseparams.participationEndValue > 0) {
          if (thrphaseparams.participationEndMode == LC.ParticipationEndModes.EagerRelative
           || thrphaseparams.participationEndMode == LC.ParticipationEndModes.Relative) {
            thr.tmpTime = now + thrphaseparams.participationEndValue;
          } else {
            thr.tmpTime = thrphaseparams.participationEndValue;
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
        LC.WinningParams wparams = winningParams[thrparams.winningParamsId];
        uint ratioBidWinner = uint(thr.numberOfBid) * wparams.nbWinnerMinRatio / 100;
        uint16 rcashout;
        // calculate nbCashout
        if (ratioBidWinner < uint(wparams.nbWinners)) {
           if (ratioBidWinner == 0) {
             rcashout = 1;
           } else {
             rcashout = uint16(ratioBidWinner);
           }
        } else {
          rcashout = wparams.nbWinners;
        }
        thr.results.totalCashout = rcashout;
        if (thrphaseparams.cashoutEndMode == LC.CashoutEndMode.Relative) {
          thr.tmpTime = now + thrphaseparams.cashoutEndValue;
        } else {
          thr.tmpTime = thrphaseparams.cashoutEndValue;
        }
      } else if (calculatedNewPhase == Phase.End) {
        if (thrphaseparams.throwEndMode == LC.CashoutEndMode.Relative) {
          thr.tmpTime = now + thrphaseparams.throwEndValue;
        } else {
          thr.tmpTime = thrphaseparams.throwEndValue;
        }
      }
      emit ChangePhase(throwId,calculatedNewPhase);
    }
    return (thr.currentPhase);
  }


  enum Phase {
    Bidding,
    Participation,
    Cashout,
    End,
    Off
  }

  enum ParticipationState {
    BidSent,
    Revealed,
    Cashout
  }


  struct LotterieThrow {
    uint paramsId;
    uint paramsPhaseId;
    uint blockNumber; // not sure if needed : use to filter a bit
    //uint id; useless (is index)
    uint currentSeed;
    uint tmpTime;
    uint64 numberOfBid;
    uint64 numberOfRevealParticipation;

    // reward thrower 
    address thrower;
    // reward author of dapp
    Phase currentPhase;

    LotterieWithdraw withdraws;
    LotterieResult results;
  }

  function getThrow(uint throwId) external constant returns(uint,uint,uint,uint,uint64,uint64,address,uint) {
    require(allthrows.length > throwId);
    LotterieThrow storage thr = allthrows[throwId];
    return (thr.paramsId, thr.currentSeed, thr.results.totalBidValue, thr.results.totalClaimedValue, thr.numberOfBid, thr.numberOfRevealParticipation, thr.thrower,thr.blockNumber);
  }


  struct LotterieResult {
    uint totalBidValue;
    uint totalClaimedValue;
    uint16 totalCashout;
    // linked list over winners sort by rank
    uint16 firstWinner;
  }

  struct Winner {
    bool withdrawned;
    // warning it is not the user winnig but the winning at this position
    uint totalPositionWin;
    uint participationId;
    uint score;
    // winners is stored as a linked list (0 being null)
    uint16 nextWinner;
  }
  struct LotterieWithdraw {
    uint winningBase;
    uint32 ownerMargin;
    uint32 authorContractMargin;
    uint32 authorDappMargin;
    uint32 throwerMargin;


    bool ownerWithdrawned;
    bool authorContractWithdrawned;
    bool authorDappWithdrawned;
    bool throwerWithdrawned;
  }

  struct Participation {
    uint throwId;
    uint seed;
    address from;
//   uint bid;
    ParticipationState state;
  }
 
  // seems useless when looking at public on allthrows
  // but it uses abiEncoderV2
  // TODO that seems unfair for external usage especially since abiEncoder is experimental :
  // how to read it from wasm contract or others : serialize library to use instead and add js decoding function
  // !! it is easier to use than a compiling logic where code is only readable as byte
  function getThrowV2(uint id) external returns (LotterieThrow) {
    return allthrows[id];
  }

	constructor(
    address _authorContract
  ) public {
    authorContract = _authorContract;
  }
  // no index (TODO same for owner ??)
  event AuthorContractTransferred(address previousOwner, address newOwner);
  modifier onlyContractAuthor() {
    require(msg.sender == authorContract);
    _;
  }
  function transferAuthoring(address newAuthor) public onlyContractAuthor {
    require(newAuthor != address(0));
    emit AuthorContractTransferred(authorContract, newAuthor);
    authorContract = newAuthor;
  }

   function addParams (

    uint winningParamsId,
    bool doSalt,

    address authorDapp,

    uint minBidValue,

    uint biddingTreshold,
    uint64 maxParticipant

  ) external {

    LC.LotterieParams memory param =
      LC.LotterieParams({
        winningParamsId : winningParamsId,
        authorDapp : authorDapp,
        minBidValue : minBidValue,
        biddingTreshold : biddingTreshold,
        maxParticipant : maxParticipant,
        doSalt : doSalt
      });
    params.push(param);
  }


  function addPhaseParams (

    uint participationStartTreshold,

    uint8 participationEndMode,
    uint participationEndValue,

    uint8 cashoutEndMode,
    uint cashoutEndValue,

    uint8 throwEndMode,
    uint throwEndValue
  ) external {
    require(LC.validCashoutSwitch(LC.ParticipationEndModes(participationEndMode),participationEndValue));
    require(LC.validEndSwitch(LC.CashoutEndMode(cashoutEndMode), cashoutEndValue));
    require(LC.validOffSwitch(LC.CashoutEndMode(throwEndMode), throwEndValue));

    LC.LotteriePhaseParams memory phaseParam = LC.LotteriePhaseParams({
        participationStartTreshold : participationStartTreshold,
        participationEndMode : LC.ParticipationEndModes(participationEndMode),
        participationEndValue : participationEndValue,
        cashoutEndMode : LC.CashoutEndMode(cashoutEndMode),
        cashoutEndValue : cashoutEndValue,
        throwEndMode : LC.CashoutEndMode(throwEndMode),
        throwEndValue : throwEndValue
    });
    phaseParams.push(phaseParam);
  }


  function addWinningParams (
    uint16 nbWinners,
    uint16 nbWinnerMinRatio,
    uint8 distribution
  ) external {
    require(LC.validWinningParams(nbWinners,nbWinnerMinRatio));

    LC.WinningParams memory param =
      LC.WinningParams({
        nbWinners : nbWinners,
        nbWinnerMinRatio : nbWinnerMinRatio,
        distribution : LC.WinningDistribution(distribution)
      });
    winningParams.push(param);
  }



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
    LotterieWithdraw memory wdraw = LotterieWithdraw({
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

  /// use it to force change state (if no user does cashout for instance and you need to wait relative time to get round cash as a owner)
  /// Note that transaction will only pass if newPhase is the right new phase (cang get it with getCurrentPhaes)
  /// Anybody can pay gas for it.
  function recalculateState (
    uint throwId,
    Phase newPhase
  ) external payable forThrowStorage(throwId,newPhase) { }
 
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

  // warning this function should not be use outside of testing 
  // (especially not for calculing bid commitment when using non local ethereum instance)
  function checkCommitment(uint256 hiddenSeed) pure external returns(uint) {
    return (uint(keccak256(hiddenSeed)));
  }
  // mainly for testing or asserting correct implementation
  function checkScore(uint256 hiddenSeed,uint256 currentSeed) pure external returns(uint) {
    return (hiddenSeed ^ currentSeed);
  }



  function challengeParticipation(uint participationId, uint256 hiddenSeed) view external returns(uint,uint) {
    Participation storage part = participations[participationId];
    return (part.seed,uint(keccak256(hiddenSeed)));
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
    uint com = part.seed;
    part.seed = hiddenSeed;
    part.state = ParticipationState.Revealed;

    emit Revealed(part.throwId, participationId,hiddenSeed);

  }

  // should not be use in dapp, log should be used
  function checkPositionHeavyCost(uint participationId)
   external constant returns (uint)
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
    
    Winner[] winners = allwinners[part.throwId];
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
  function calcPositionWin(LC.WinningDistribution distribution,uint16 totalWin, uint base) constant public returns(uint) {
    if (distribution == LC.WinningDistribution.Equal) {
      return base / uint(totalWin);
    }
    return 0;
  }
  function nbWinners (
    uint participationId
  ) view external returns (uint)
  {
     Participation storage part = participations[participationId];
     Winner[] winners = allwinners[part.throwId];
     return (winners.length);
  }

  function getWinner (
    uint throwId,
    uint winnerIx
  ) view external returns (bool,uint,uint)
  {
     LotterieThrow storage thr = allthrows[throwId];
     Winner[] winners = allwinners[throwId];
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
     LC.LotterieParams storage thrparams = params[thr.paramsId];
     LC.WinningParams storage wparams = winningParams[thrparams.winningParamsId];
     Winner[] winners = allwinners[throwId];
     Winner storage w;

     uint16 ptr = thr.results.firstWinner;

     for (; ptr != 255 && 
       result < thr.results.totalCashout;++result) {
       require(ptr < winners.length);
       w = winners[ptr];
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
     LC.LotterieParams storage thrparams = params[thr.paramsId];
     LC.WinningParams storage wparams = winningParams[thrparams.winningParamsId];
     Winner[] winners = allwinners[part.throwId];
     Winner storage w;

     uint16 ptr = thr.results.firstWinner;

     for (; ptr != 255 && 
       result < thr.results.totalCashout;++result) {
       require(ptr < winners.length);
       w = winners[ptr];
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
     Winner[] winners = allwinners[part.throwId];
     Winner storage w;

     uint16 ptr = thr.results.firstWinner;


     uint result = 0;
     for (; ptr != 255 && 
       result < thr.results.totalCashout;++result) {
       require(ptr < winners.length);
       w = winners[ptr];
       if (w.participationId == participationId) {
         return (result + 1);
       }
       ptr = w.nextWinner;
     }
     
     return (0);
  }
 
 
  function canSwitchToParticipation(LotterieThrow thr,LC.LotterieParams thrparams, LC.LotteriePhaseParams thrphaseparams) internal returns(bool) {
    // costless criterion first
    if (thrparams.maxParticipant > 0 && thr.numberOfBid == thrparams.maxParticipant) {
      return true;
    }
    if (thrparams.biddingTreshold > 0 && thr.results.totalBidValue >= thrparams.biddingTreshold) {
      return true;
    }
    if (thrphaseparams.participationStartTreshold > 0) {
      if (now >= thrphaseparams.participationStartTreshold) {
        return true;
      }
    }
    return false;
  }

  function canSwitchToCashout(LotterieThrow thr,LC.LotterieParams thrparams, LC.LotteriePhaseParams thrphaseparams) internal returns(bool) {
    // test eager first (avoid call to now)
    if (thrphaseparams.participationEndMode == LC.ParticipationEndModes.EagerRelative
        || thrphaseparams.participationEndMode == LC.ParticipationEndModes.EagerAbsolute) {
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

  function canSwitchToEnded(LotterieThrow thr) internal returns(bool) {
    if (now >= thr.tmpTime) {
      return true;
    }
    return false;
  }
  function canSwitchToOff(LotterieThrow thr) internal returns(bool) {
    return canSwitchToEnded(thr);
  }

  function getPhase(uint throwId) external constant returns(uint8) {
    require(allthrows.length > throwId);
    LotterieThrow storage thr = allthrows[throwId];
    LC.LotterieParams storage thrparams = params[thr.paramsId];
    LC.LotteriePhaseParams storage thrphaseparams = phaseParams[thr.paramsPhaseId];
    Phase calculatedNewPhase = getCurrentPhase(thr,thrparams,thrphaseparams);
    return (uint8(calculatedNewPhase));
  }

  // do not try switching to phase + 2 due to relative time condition
  function getCurrentPhase(LotterieThrow thr,LC.LotterieParams thrparams, LC.LotteriePhaseParams thrphaseparams) internal returns(Phase) {
//    LotterieThrow thr = allthrows[throwId];
    if (thr.currentPhase == Phase.Bidding) {
      if (canSwitchToParticipation(thr,thrparams,thrphaseparams)) {
        return Phase.Participation;
      }
    } else if (thr.currentPhase == Phase.Participation) { 
      if (canSwitchToCashout(thr,thrparams,thrphaseparams)) {
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

  function withdrawWin(uint throwId, uint participationId)
    public 
    forParticipation(participationId,ParticipationState.Cashout,Phase.End) 
    {
     // go through linked list
     Participation storage part = participations[participationId];

     require(msg.sender == part.from);

     LotterieThrow storage thr = allthrows[part.throwId];
     Winner[] winners = allwinners[part.throwId];
     Winner storage w;

     uint16 ptr = thr.results.firstWinner;


     uint result = 0;
     for (; ptr != 255 && 
       result < thr.results.totalCashout;++result) {
       require(ptr < winners.length);
       w = winners[ptr];
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

  // can withdraw in participation
  function withdrawOwner(uint throwId)
    forThrowStorageNot2(throwId,Phase.Bidding,Phase.Off)
    onlyOwner 
    public returns (uint) {
    
    LotterieThrow storage thr = allthrows[throwId];
    if (thr.withdraws.ownerWithdrawned == false) {
    uint amount = LC.calcMargin(thr.results.totalBidValue, thr.withdraws.ownerMargin);

    if (amount > 0) {
        thr.withdraws.ownerWithdrawned = true;
        thr.results.totalClaimedValue += amount;
        msg.sender.transfer(amount);
        emit Withdraw(msg.sender, amount);
        return amount;
      }
    }
    return 0;
  }
  function withdrawContractAuthor(uint throwId)
    forThrowStorageNot2(throwId,Phase.Bidding,Phase.Off)
    onlyContractAuthor
    public returns (uint) {
    
    LotterieThrow storage thr = allthrows[throwId];
    if (thr.withdraws.authorContractWithdrawned == false) {
    uint amount = LC.calcMargin(thr.results.totalBidValue, thr.withdraws.authorContractMargin);
      if (amount > 0) {
        thr.withdraws.authorContractWithdrawned = true;
        thr.results.totalClaimedValue += amount;
        msg.sender.transfer(amount);
        emit Withdraw(msg.sender, amount);
        return amount;
      }
    }
    return 0;
  }
  function withdrawThrower(uint throwId)
    forThrowStorageNot2(throwId,Phase.Bidding,Phase.Off)
    public returns (uint) {
    
    LotterieThrow storage thr = allthrows[throwId];
    require(thr.thrower == msg.sender);
    if (thr.withdraws.throwerWithdrawned == false) {
    uint amount = LC.calcMargin(thr.results.totalBidValue, thr.withdraws.throwerMargin);
      if (amount > 0) {
        thr.withdraws.throwerWithdrawned = true;
        thr.results.totalClaimedValue += amount;
        msg.sender.transfer(amount);
        emit Withdraw(msg.sender, amount);
        return amount;
      }
    }
    return 0;
  }
  function withdrawDappAuthor(uint throwId)
    forThrowStorageNot2(throwId,Phase.Bidding,Phase.Off)
    public returns (uint) {
    
    LotterieThrow storage thr = allthrows[throwId];
    LC.LotterieParams storage thrparams = params[thr.paramsId];
    require(thrparams.authorDapp == msg.sender);
    if (thr.withdraws.authorDappWithdrawned == false) {
    uint amount = LC.calcMargin(thr.results.totalBidValue, thr.withdraws.authorDappMargin);
      if (amount > 0) {
        thr.withdraws.authorDappWithdrawned = true;
        thr.results.totalClaimedValue += amount;
        msg.sender.transfer(amount);
        emit Withdraw(msg.sender, amount);
        return amount;
      }
    }
    return 0;
  }

  // do not let stuck value in a throw
  function emptyOffThrow(uint throwId)
    forThrowStorage(throwId,Phase.Off) 
    onlyOwner
    external {
    LotterieThrow storage thr = allthrows[throwId];
    var amount = thr.results.totalBidValue.sub(thr.results.totalClaimedValue);
    if (amount != 0) {
      thr.results.totalClaimedValue += amount;
      msg.sender.transfer(amount);
    }
  }



  function validWithdrawMargins(
      uint32 ownerMargin,
      uint32 authorContractMargin,
      uint32 authorDappMargin,
      uint32 throwerMargin)
      pure returns(bool) {

      // check for sum overflow (allows no gain from winner : 100% margin)
      adduint32req(ownerMargin,
        adduint32req(authorContractMargin,
          adduint32req(authorDappMargin,
          throwerMargin)));
      return true;
  }
  function adduint32req(uint32 a, uint32 b) internal pure returns (uint32 c) {
    c = a + b;
    require(c >= a);
    return c;
  }

/*
	mapping (address => uint) balances;

	event Transfer(address indexed _from, address indexed _to, uint256 _value);

	constructor() public {
		balances[tx.origin] = 10000;
	}

	function sendCoin(address receiver, uint amount) public returns(bool sufficient) {
		if (balances[msg.sender] < amount) return false;
		balances[msg.sender] -= amount;
		balances[receiver] += amount;
		emit Transfer(msg.sender, receiver, amount);
		return true;
	}

	function getBalanceInEth(address addr) public view returns(uint){
		return LotterieLib.convert(getBalance(addr),2);
	}

	function getBalance(address addr) public view returns(uint) {
		return balances[addr];
	}
  */
}
