pragma solidity ^0.4.23;
//pragma experimental ABIEncoderV2;

import "./LotterieBase.sol";
import { LotterieConf as LC } from "./LotterieConf.sol";

// phase related methods
contract LotteriePhases is LotterieBase {


  event ChangePhase(Phase newPhase);



  // ensure right phase for throw action
  // TODO diff with a function call or find a way to use thr in fn
  // TODO rename to forThrow
  modifier forThrowStorage(Phase throwPhase) {
    forThrowStorageInternal(throwPhase);
    _;
  }
/*  modifier forThrowStorageNot(Phase throwPhase) {
    Phase currentPhase = forThrowStorageMyPhase();
    require(currentPhase != throwPhase);
    _;
  }*/
  modifier forThrowStorageNot2(Phase throwPhase1, Phase throwPhase2) {
    Phase currentPhase = forThrowStorageMyPhase();
    require(currentPhase != throwPhase1);
    require(currentPhase != throwPhase2);
    _;
  }


  modifier forParticipation(uint64 participationId, ParticipationState participationState, Phase throwPhase) {
    forParticipationInternal(participationId, participationState, throwPhase);
    _;
  }
  function forParticipationInternal(uint64 participationId, ParticipationState participationState, Phase throwPhase) internal {
    require(participations.length > participationId);
    Participation storage part = participations[participationId];
    require(part.state == participationState);
    Phase currentPhase = forThrowStorageMyPhase();
    require(currentPhase == throwPhase);
  }
 
  function forThrowStorageInternal(Phase throwPhase) internal {
    Phase currentPhase = forThrowStorageMyPhase();
    require(currentPhase == throwPhase);
  }
  function totalCashout() external view returns (uint16) {
    Phase currentPhase = getCurrentPhase();
    if (currentPhase == Phase.Cashout) {
      return (calcTotalCashout());
    }
    return (thr.results.totalCashout);
  }

  // TODO assert it is similar cost wise as a macro
  function calcTotalCashout() internal view returns (uint16) {
       uint ratioBidWinner = uint(thr.numberOfBid) * winningParam.nbWinnerMinRatio / 100;
      uint16 rcashout;
      // calculate nbCashout
      if (ratioBidWinner < uint(winningParam.nbWinners)) {
         if (ratioBidWinner == 0) {
           rcashout = 1;
         } else {
           rcashout = uint16(ratioBidWinner);
         }
      } else {
        rcashout = winningParam.nbWinners;
      }
      return(rcashout);
  }

  // switch phase if needed and return current phase
  function forThrowStorageMyPhase() internal returns (Phase) {
    Phase calculatedNewPhase = getCurrentPhase();
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
        thr.results.totalCashout = calcTotalCashout();
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



  /// use it to force change state (if no user does cashout for instance and you need to wait relative time to get round cash as a owner)
  /// Note that transaction will only pass if newPhase is the right new phase (cang get it with getCurrentPhaes)
  /// Anybody can pay gas for it.
  function recalculateState (
    Phase newPhase
  ) external payable forThrowStorage(newPhase) { }
 

  function canSwitchToParticipation(
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
    ) internal view returns(bool) {
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

  function canSwitchToEnded() internal view returns(bool) {
    if (now >= thr.tmpTime) {
      return true;
    }
    return false;
  }
  function canSwitchToOff() internal view returns(bool) {
    return canSwitchToEnded();
  }

  function getPhase() external view returns(uint8) {
    Phase calculatedNewPhase = getCurrentPhase();
    return (uint8(calculatedNewPhase));
  }

  function getNextTimeTreshold() external view returns(uint) {
    return thr.tmpTime;
  }

  // do not try switching to phase + 2 due to relative time condition
  function getCurrentPhase() internal view returns(Phase) {
    if (thr.currentPhase == Phase.Bidding) {
      if (canSwitchToParticipation()) {
        return Phase.Participation;
      }
    } else if (thr.currentPhase == Phase.Participation) { 
      if (canSwitchToCashout()) {
        return Phase.Cashout;
      }
    } else if (thr.currentPhase == Phase.Cashout
      && canSwitchToEnded()) {
      return Phase.End;
    } else if (thr.currentPhase == Phase.End
      && canSwitchToOff()) {
      return Phase.Off;
    }
 
    return thr.currentPhase;
  }


}
