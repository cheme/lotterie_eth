pragma solidity ^0.4.23;
//pragma experimental ABIEncoderV2;

import "./LotterieLib.sol";
import "./LotterieParams.sol";
import { LotterieConf as LC } from "./LotterieConf.sol";

// Contract for Lotterie

contract LotterieBase is LotterieLib, LotterieParams {

  LotterieThrow [] public allthrows; // TODO not public (access to set if public??)

  // wining params accessor 
  function getThrowsCount() public view returns(uint) {
    return allthrows.length;
  }


  // TODO test other defs
  mapping(uint => Winner[]) public allwinners; // TODO not public (access to set if public??)


  Participation [] public participations; // TODO not public (access to set if public??)

  function getParticipationsCount() public view returns(uint) {
    return participations.length;
  }

 
  function getParticipation(uint participationId) public view returns(uint,uint,address,uint8) {
    Participation storage part = participations[participationId];
    return (part.throwId, part.seed, part.from, uint8(part.state));
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

  function getThrow(uint throwId) external view returns(uint,uint,uint,uint,uint64,uint64,address,uint) {
    require(allthrows.length > throwId);
    LotterieThrow storage thr = allthrows[throwId];
    return (thr.paramsId, thr.currentSeed, thr.results.totalBidValue, thr.results.totalClaimedValue, thr.numberOfBid, thr.numberOfRevealParticipation, thr.thrower,thr.blockNumber);
  }


  // seems useless when looking at public on allthrows
  // but it uses abiEncoderV2
  // TODO that seems unfair for external usage especially since abiEncoder is experimental :
  // how to read it from wasm contract or others : serialize library to use instead and add js decoding function
  // !! it is easier to use than a compiling logic where code is only readable as byte
/*  function getThrowV2(uint id) external view returns (LotterieThrow) {
    return allthrows[id];
  }
  function getParticipationV2(uint id) external view returns (Participation) {
    return participations[id];
  }*/


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

    LC.LotterieWithdraw withdraws;
    LotterieResult results;
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

  struct Participation {
    uint throwId;
    uint seed;
    address from;
//   uint bid;
    ParticipationState state;
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

  function calcPositionWin(LC.WinningDistribution distribution,uint16 totalWin, uint base) public pure returns(uint) {
    if (distribution == LC.WinningDistribution.Equal) {
      return base / uint(totalWin);
    }
    return 0;
  }
 

}
