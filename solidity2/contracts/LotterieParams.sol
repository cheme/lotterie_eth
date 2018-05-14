pragma solidity ^0.4.23;

import { LotterieConf as LC } from "./LotterieConf.sol";


contract LotterieParams {

  LC.LotterieParams [] public params; // TODO not public (access to set if public??)

 
  LC.LotteriePhaseParams [] public phaseParams; // TODO not public (access to set if public??)

  LC.WinningParams [] public winningParams; // TODO not public (access to set if public??)

  // wining params accessor 
  function getWiningParamsCount() public view returns(uint) {
    return winningParams.length;
  }

  function getWinningParams(uint index) public view returns(uint16, uint16, uint8) {
    LC.WinningParams storage p = winningParams[index]; 
    return (p.nbWinners,p.nbWinnerMinRatio, uint8(p.distribution));
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


}
