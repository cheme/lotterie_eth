pragma solidity ^0.4.23;
//pragma experimental ABIEncoderV2;

import "./LotterieBase.sol";
import { LotterieConf as LC } from "../LotterieConf.sol";
import { ThrowLib as TL } from "./lib/ThrowLib.sol";

// phase related methods
contract LotteriePhases is LotterieBase {


  event ChangePhase(TL.Phase newPhase);



  // ensure right phase for throw action
  // TODO diff with a function call or find a way to use thr in fn
  // TODO rename to forThrow
  modifier forThrowStorage(TL.Phase throwPhase) {
    forThrowStorageInternal(throwPhase);
    _;
  }
/*  modifier forThrowStorageNot(TL.Phase throwPhase) {
    TL.Phase currentPhase = forThrowStorageMyPhase();
    require(currentPhase != throwPhase);
    _;
  }*/
/*  modifier forThrowStorageNot2(TL.Phase throwPhase1, TL.Phase throwPhase2) {
    TL.forThrowStorageMyPhaseNot2(throwPhase1,throwPhase2,thr,param,phaseParam,winningParam);
    _;
  }*/


  modifier forParticipation(uint64 participationId, TL.ParticipationState participationState, TL.Phase throwPhase) {
    forParticipationInternal(participationId, participationState, throwPhase);
    _;
  }

  function forParticipationInternal(uint64 participationId, TL.ParticipationState participationState, TL.Phase throwPhase) internal {
    require(participations.length > participationId);
    TL.Participation storage part = participations[participationId];
    require(part.state == participationState);
    TL.Phase currentPhase = TL.forThrowStorageMyPhase(thr,param,phaseParam,winningParam);
    require(currentPhase == throwPhase);
  }
 
  function forThrowStorageInternal(TL.Phase throwPhase) internal {
    TL.Phase currentPhase = TL.forThrowStorageMyPhase(thr,param,phaseParam,winningParam);
    require(currentPhase == throwPhase);
  }

  function totalCashout() external view returns (uint8) {
    return TL.totalCashout(thr,param,phaseParam,winningParam);
  }



  /// use it to force change state (if no user does cashout for instance and you need to wait relative time to get round cash as a owner)
  /// Note that transaction will only pass if newPhase is the right new phase (cang get it with getCurrentPhaes)
  /// Anybody can pay gas for it.
  function recalculateState (
    TL.Phase newPhase
  ) external payable forThrowStorage(newPhase) { }
 


  function getPhase() external view returns(uint8) {
    TL.Phase calculatedNewPhase = TL.getCurrentPhase(thr,param,phaseParam);
    return (uint8(calculatedNewPhase));
  }

  function getNextTimeTreshold() external view returns(uint) {
    return thr.tmpTime;
  }

}
