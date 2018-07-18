pragma solidity ^0.4.23;
//pragma experimental ABIEncoderV2;

import "../LotterieLib.sol";
import "./LotterieParam.sol";
import { LotterieConf as LC } from "../LotterieConf.sol";
import { ThrowLib as TL } from "./lib/ThrowLib.sol";

// Contract for Lotterie

contract LotterieBase is LotterieLib, LotterieParam {

  TL.LThrow public thr;


  // TODO test other defs
  TL.Winner[] public winners;


  TL.Participation [] public participations; // TODO not public (access to set if public??)

  function getParticipationsCount() public view returns(uint) {
    return participations.length;
  }

 
  function getParticipation(uint64 participationId) public view returns(uint,address,uint8) {
    TL.Participation storage part = participations[participationId];
    return (part.seed, part.from, uint8(part.state));
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



  

  

  function challengeParticipation(uint64 participationId, uint256 hiddenSeed) view external returns(uint,uint) {
    TL.Participation storage part = participations[participationId];
    return (part.seed,uint(keccak256(abi.encodePacked(hiddenSeed))));
  }

  function calcPositionWin(LC.WinningDistribution distribution,uint8 totalWin, uint base) public pure returns(uint) {
    return TL.calcPositionWin(distribution,totalWin,base);
  }

 
 

}
