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
  // TODO index it and info for list of throw : harder than expected
  // probably need date to limit to a period range (which will be indexed)
  event NewThrow(uint throwId);

  // TODO index : throwId likely, participationId not really do not know)
  event NewParticipation(uint participationId,uint throwId,uint bid);

  // probby indexed on throwId TODO assert newPhase is uint8
  event ChangePhase(uint throwId, Phase newPhase);

  // only to log, nothing useful to index
  event Revealed(uint participationId, uint256 hiddenSeed);

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

  LC.WinningParams [] public winningParams; // TODO not public (access to set if public??)

  // wining params accessor 
  function getWiningParamsCount() public constant returns(uint) {
    return winningParams.length;
  }

  function getWinningParams(uint index) public constant returns(uint16, uint16) {
    LC.WinningParams storage p = winningParams[index]; 
    return (p.nbWinners,p.nbWinnerMinRatio);
  }

  Participation [] public participations; // TODO not public (access to set if public??)


  // ensure right phase for throw action
  // TODO diff with a function call or find a way to use thr in fn
  // TODO rename to forThrow
  modifier forThrowStorage(uint throwId, Phase throwPhase) {
    forThrowStorageInternal(throwId, throwPhase, true);
    _;
  }
  modifier forThrowStorageNot(uint throwId, Phase throwPhase) {
    forThrowStorageInternal(throwId, throwPhase, false);
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
    forThrowStorageInternal(part.throwId, throwPhase, true);
  }
 
  function forThrowStorageInternal(uint throwId, Phase throwPhase, bool eq) internal {
    require(allthrows.length > throwId);
    LotterieThrow storage thr = allthrows[throwId];
    LC.LotterieParams storage thrparams = params[thr.paramsId];
    Phase calculatedNewPhase = getCurrentPhase(thr,thrparams);
    // lazy init (additional cost on first user to switch phase)
    if (thr.currentPhase != calculatedNewPhase) {
      thr.currentPhase = calculatedNewPhase;
      if (calculatedNewPhase == Phase.Participation) {
        // calculate relative end time for relative mode
        if (thrparams.participationEndValue > 0) {
          if (thrparams.participationEndMode == LC.ParticipationEndModes.EagerRelative
           || thrparams.participationEndMode == LC.ParticipationEndModes.Relative) {
            thr.tmpTime = now + thrparams.participationEndValue;
          } else {
            thr.tmpTime = thrparams.participationEndValue;
          }
        }
      } else if (calculatedNewPhase == Phase.Cashout) {
        LC.WinningParams wparams = winningParams[thrparams.winningParamsId];
        uint ratioBidWinner = uint(thr.numberOfBid) * wparams.nbWinnerMinRatio / 100;
        uint16 rcashout;
        // calculate nbCashout
        if (ratioBidWinner < uint(wparams.nbWinners)) {
           if (ratioBidWinner == 0) {
             rcashout = 0;
           } else {
             rcashout = uint16(ratioBidWinner);
           }
        } else {
          rcashout = wparams.nbWinners;
        }
        thr.results.totalCashout = rcashout;
        if (thrparams.cashoutEndMode == LC.CashoutEndMode.Relative) {
          thr.tmpTime = now + thrparams.cashoutEndValue;
        } else {
          thr.tmpTime = thrparams.cashoutEndValue;
        }
      }
      emit ChangePhase(throwId,calculatedNewPhase);
    }
    if (eq) {
      require(thr.currentPhase == throwPhase);
    } else {
      require(thr.currentPhase != throwPhase);
    }
  }

  enum Phase {
    Bidding,
    Participation,
    Cashout,
    End
  }
  enum ParticipationState {
    BidSent,
    Revealed
  }


  struct LotterieThrow {
    uint paramsId;
    //uint id; useless (is index)
    uint currentSeed;
    uint totalBidValue;
    uint totalClaimedValue;
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

  function getThrow(uint throwId) external constant returns(uint,uint,uint,uint,uint64,uint64,address) {
    require(allthrows.length > throwId);
    LotterieThrow storage thr = allthrows[throwId];
    return (thr.paramsId, thr.currentSeed, thr.totalBidValue, thr.totalClaimedValue, thr.numberOfBid, thr.numberOfRevealParticipation, thr.thrower);
  }


  struct LotterieResult {
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
    uint commitmentSeed;
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
    uint participationStartTreshold,
    uint64 maxParticipant,

    uint8 participationEndMode,
    uint participationEndValue,

    uint8 cashoutEndMode,
    uint cashoutEndValue
  ) external {
    require(LC.validParticipationSwitch(maxParticipant,biddingTreshold,participationStartTreshold));
    require(LC.validCashoutSwitch(LC.ParticipationEndModes(participationEndMode),participationEndValue));
    require(LC.validEndSwitch(LC.CashoutEndMode(cashoutEndMode), cashoutEndValue));

    uint paramId = params.length;
    LC.LotterieParams memory param =
      LC.LotterieParams({
        winningParamsId : winningParamsId,
        authorDapp : authorDapp,
        minBidValue : minBidValue,
        biddingTreshold : biddingTreshold,
        participationStartTreshold : participationStartTreshold,
        maxParticipant : maxParticipant,
        participationEndMode : LC.ParticipationEndModes(participationEndMode),
        participationEndValue : participationEndValue,
        cashoutEndMode : LC.CashoutEndMode(cashoutEndMode),
        cashoutEndValue : cashoutEndValue,
        doSalt : doSalt
      });
    params.push(param);
  }
  function addWinningParams (
    uint16 nbWinners,
    uint16 nbWinnerMinRatio
  ) external {
    require(LC.validWinningParams(nbWinners,nbWinnerMinRatio));

    uint paramId = winningParams.length;
    LC.WinningParams memory param =
      LC.WinningParams({
        nbWinners : nbWinners,
        nbWinnerMinRatio : nbWinnerMinRatio
      });
    winningParams.push(param);
  }



  // TODO start with already defined pointers (set of const pointers in storage on deploy)
  // start a thow
  // @payable value is added as inital win value (that way you can do free lotterie with something to win with minBidValue to 0 and not participating)
  function initThrow (
    uint paramsId,

    uint32 ownerMargin,
    uint32 authorContractMargin,
    uint32 authorDappMargin,
    uint32 throwerMargin

  ) external payable {
    uint throwId = allthrows.length;
    require(validWithdrawMargins(
      ownerMargin,
      authorContractMargin,
      authorDappMargin,
      throwerMargin));
    LotterieWithdraw memory wdraw = LotterieWithdraw({
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
      firstWinner : 255,
      totalCashout : 0
    });

    LotterieThrow memory thr = LotterieThrow({
      paramsId : paramsId,
//      id : throwId,
      numberOfBid : 0,
      numberOfRevealParticipation : 0,
      currentSeed : 0,
      totalBidValue : msg.value,
      totalClaimedValue : 0,
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
      thr.totalBidValue = thr.totalBidValue.add(msg.value);
    }
    thr.numberOfBid += 1;
    uint participationId = participations.length;
    Participation memory part = Participation({
      throwId : throwId,
      from : msg.sender,
//      bid : msg.value,
      commitmentSeed : commitmentSeed,
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
    require(part.commitmentSeed == uint(keccak256(hiddenSeed)));
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
    uint com = part.commitmentSeed;
    part.commitmentSeed = hiddenSeed;
    part.state = ParticipationState.Revealed;

    emit Revealed(participationId,com);

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
    LotterieThrow storage thr = allthrows[part.throwId];
    uint myScore = part.commitmentSeed ^ thr.currentSeed;
    LC.LotterieParams storage thrparams = params[thr.paramsId];
    LC.WinningParams storage wparams = winningParams[thrparams.winningParamsId];
    
    Winner[] winners = allwinners[part.throwId];
    require(startPossibleIx <= winners.length);
    uint16 before = 255;
    uint16 next = 255;
    Winner storage w;
    uint16 ptr = thr.results.firstWinner;
    uint16 iter = 0;
    if (startPossibleIx > 0) {
      require(ptr != 255);
      w = winners[ptr];
      for (;ptr != 255 && iter < startPossibleIx; iter++) {
        before = ptr;
        ptr = w.nextWinner;
      }
      w = winners[before];
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
      // not found
      next == 255 &&
      // in result nb
      iter < thr.results.totalCashout; iter++) {
      w = winners[ptr];
      before = ptr;
      ptr = w.nextWinner;
      if (myScore >= w.score) {
        if (myScore == w.score) {
          if(participationId < w.participationId) {
            next = ptr;
          }
        } else {
          next = ptr;
        }
      }
    }
    if (winners.length < thr.results.totalCashout) {
      // initiate a cashout value if not all used
      winners.push(Winner({
        withdrawned : false,
        totalPositionWin : 0, // TODO calculate winning part for next position
        participationId : participationId,
        score : myScore,
        nextWinner : next
      }));
      iter = uint16(winners.length);
    } else {
      // get last ix
      for (; iter < thr.results.totalCashout; iter++) {
        w = winners[ptr];
        ptr = w.nextWinner;
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

    // TODO change state for participation (do not write twice) + check before starting


  }

  function getPosition (
    uint participationId) external view {
    // TODO very costy funtion to call before cashOut call
  }
 
  function canSwitchToParticipation(LotterieThrow thr,LC.LotterieParams thrparams) internal returns(bool) {
    // costless criterion first
    if (thrparams.maxParticipant > 0 && thr.numberOfBid == thrparams.maxParticipant) {
      return true;
    }
    if (thrparams.biddingTreshold > 0 && thr.totalBidValue >= thrparams.biddingTreshold) {
      return true;
    }
    if (thrparams.participationStartTreshold > 0) {
      if (now >= thrparams.participationStartTreshold) {
        return true;
      }
    }
    return false;
  }

  function canSwitchToCashout(LotterieThrow thr,LC.LotterieParams thrparams) internal returns(bool) {
    // test eager first (avoid call to now)
    if (thrparams.participationEndMode == LC.ParticipationEndModes.EagerRelative
        || thrparams.participationEndMode == LC.ParticipationEndModes.EagerAbsolute) {
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

  function getPhase(uint throwId) external constant returns(uint8) {
    require(allthrows.length > throwId);
    LotterieThrow storage thr = allthrows[throwId];
    LC.LotterieParams storage thrparams = params[thr.paramsId];
    Phase calculatedNewPhase = getCurrentPhase(thr,thrparams);
    return (uint8(calculatedNewPhase));
  }

  // do not try switching to phase + 2 due to relative time condition
  function getCurrentPhase(LotterieThrow thr,LC.LotterieParams thrparams) internal returns(Phase) {
//    LotterieThrow thr = allthrows[throwId];
    if (thr.currentPhase == Phase.Bidding) {
      if (canSwitchToParticipation(thr,thrparams)) {
        return Phase.Participation;
      }
    } else if (thr.currentPhase == Phase.Participation) { 
      if (canSwitchToCashout(thr,thrparams)) {
        return Phase.Cashout;
      }
    } else if (thr.currentPhase == Phase.Cashout
      && canSwitchToEnded(thr)) {
      return Phase.End;
    }
    return thr.currentPhase;
  }

  // can withdraw in participation
  function withdrawOwner(uint throwId)
    forThrowStorageNot(throwId,Phase.Bidding)
    onlyOwner 
    public returns (uint) {
    
    LotterieThrow storage thr = allthrows[throwId];
    if (thr.withdraws.ownerWithdrawned == false) {
    uint amount = LC.calcMargin(thr.totalBidValue, thr.withdraws.ownerMargin);

    if (amount > 0) {
        thr.withdraws.ownerWithdrawned = true;
        thr.totalClaimedValue += amount;
        msg.sender.transfer(amount);
        emit Withdraw(msg.sender, amount);
        return amount;
      }
    }
    return 0;
  }
  function withdrawContractAuthor(uint throwId)
    forThrowStorageNot(throwId,Phase.Bidding)
    onlyContractAuthor
    public returns (uint) {
    
    LotterieThrow storage thr = allthrows[throwId];
    if (thr.withdraws.authorContractWithdrawned == false) {
    uint amount = LC.calcMargin(thr.totalBidValue, thr.withdraws.authorContractMargin);
      if (amount > 0) {
        thr.withdraws.authorContractWithdrawned = true;
        thr.totalClaimedValue += amount;
        msg.sender.transfer(amount);
        emit Withdraw(msg.sender, amount);
        return amount;
      }
    }
    return 0;
  }
  function withdrawThrower(uint throwId)
    forThrowStorageNot(throwId,Phase.Bidding)
    public returns (uint) {
    
    LotterieThrow storage thr = allthrows[throwId];
    require(thr.thrower == msg.sender);
    if (thr.withdraws.throwerWithdrawned == false) {
    uint amount = LC.calcMargin(thr.totalBidValue, thr.withdraws.throwerMargin);
      if (amount > 0) {
        thr.withdraws.throwerWithdrawned = true;
        thr.totalClaimedValue += amount;
        msg.sender.transfer(amount);
        emit Withdraw(msg.sender, amount);
        return amount;
      }
    }
    return 0;
  }
  function withdrawDappAuthor(uint throwId)
    forThrowStorageNot(throwId,Phase.Bidding)
    public returns (uint) {
    
    LotterieThrow storage thr = allthrows[throwId];
    LC.LotterieParams storage thrparams = params[thr.paramsId];
    require(thrparams.authorDapp == msg.sender);
    if (thr.withdraws.authorDappWithdrawned == false) {
    uint amount = LC.calcMargin(thr.totalBidValue, thr.withdraws.authorDappMargin);
      if (amount > 0) {
        thr.withdraws.authorDappWithdrawned = true;
        thr.totalClaimedValue += amount;
        msg.sender.transfer(amount);
        emit Withdraw(msg.sender, amount);
        return amount;
      }
    }
    return 0;
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
