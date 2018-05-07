pragma solidity ^0.4.23;
//pragma experimental ABIEncoderV2;

import "./LotterieBase.sol";
import { LotterieConf as LC } from "./LotterieConf.sol";

// phase related methods
contract LotteriePhases is LotterieBase {


  // probby indexed on throwId TODO assert newPhase is uint8
  event ChangePhase(uint throwId, Phase newPhase);



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
        LC.WinningParams storage wparams = winningParams[thrparams.winningParamsId];
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



  /// use it to force change state (if no user does cashout for instance and you need to wait relative time to get round cash as a owner)
  /// Note that transaction will only pass if newPhase is the right new phase (cang get it with getCurrentPhaes)
  /// Anybody can pay gas for it.
  function recalculateState (
    uint throwId,
    Phase newPhase
  ) external payable forThrowStorage(throwId,newPhase) { }
 

  function canSwitchToParticipation(
    LotterieThrow thr,
    LC.LotterieParams thrparams,
    LC.LotteriePhaseParams thrphaseparams) internal view returns(bool) {
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

  function canSwitchToCashout(
    LotterieThrow thr,
//    LC.LotterieParams thrparams,
    LC.LotteriePhaseParams thrphaseparams) internal view returns(bool) {
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

  function canSwitchToEnded(LotterieThrow thr) internal view returns(bool) {
    if (now >= thr.tmpTime) {
      return true;
    }
    return false;
  }
  function canSwitchToOff(LotterieThrow thr) internal view returns(bool) {
    return canSwitchToEnded(thr);
  }

  function getPhase(uint throwId) external view returns(uint8) {
    require(allthrows.length > throwId);
    LotterieThrow storage thr = allthrows[throwId];
    LC.LotterieParams storage thrparams = params[thr.paramsId];
    LC.LotteriePhaseParams storage thrphaseparams = phaseParams[thr.paramsPhaseId];
    Phase calculatedNewPhase = getCurrentPhase(thr,thrparams,thrphaseparams);
    return (uint8(calculatedNewPhase));
  }

  // do not try switching to phase + 2 due to relative time condition
  function getCurrentPhase(LotterieThrow thr,LC.LotterieParams thrparams, LC.LotteriePhaseParams thrphaseparams) internal view returns(Phase) {
//    LotterieThrow thr = allthrows[throwId];
    if (thr.currentPhase == Phase.Bidding) {
      if (canSwitchToParticipation(thr,thrparams,thrphaseparams)) {
        return Phase.Participation;
      }
    } else if (thr.currentPhase == Phase.Participation) { 
      if (canSwitchToCashout(thr,thrphaseparams)) {
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


}
