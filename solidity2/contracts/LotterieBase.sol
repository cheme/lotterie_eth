pragma solidity ^0.4.23;
//pragma experimental ABIEncoderV2;

import "./LotterieLib.sol";
import "./LotterieParam.sol";
import { LotterieConf as LC } from "./LotterieConf.sol";

// Contract for Lotterie

contract LotterieBase is LotterieLib, LotterieParam {

  LThrow  public thr;


  // TODO test other defs
  Winner[] public winners;


  Participation [] public participations; // TODO not public (access to set if public??)

  function getParticipationsCount() public view returns(uint) {
    return participations.length;
  }

 
  function getParticipation(uint64 participationId) public view returns(uint,address,uint8) {
    Participation storage part = participations[participationId];
    return (part.seed, part.from, uint8(part.state));
  }


  enum Phase {
    Construct,
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
    uint16 totalCashout;
    // linked list over winners sort by rank
    uint16 firstWinner;
  }

  struct Winner {
    bool withdrawned;
    // warning it is not the user winnig but the winning at this position
    uint totalPositionWin;
    uint64 participationId;
    uint score;
    // winners is stored as a linked list (0 being null)
    uint16 nextWinner;
  }

  struct Participation {
    uint seed;
    address from;
//   uint bid;
    ParticipationState state;
  }
 

  

  function challengeParticipation(uint64 participationId, uint256 hiddenSeed) view external returns(uint,uint) {
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
