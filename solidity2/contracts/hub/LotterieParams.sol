pragma solidity ^0.4.23;

import { LotterieConf as LC } from "../LotterieConf.sol";


contract LotterieParams  {

  LC.LotterieParams [] public params; // TODO not public (access to set if public??)

  function getLotterieParamsCount() public view returns(uint) {
    return params.length;
  }


 
  LC.LotteriePhaseParams [] public phaseParams; // TODO not public (access to set if public??)

  function getPhaseParamsCount() public view returns(uint) {
    return phaseParams.length;
  }


  LC.WinningParams [] public winningParams; // TODO not public (access to set if public??)

  // wining params accessor 
  function getWiningParamsCount() public view returns(uint) {
    return winningParams.length;
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
    uint8 participationStartMode,
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
        participationStartMode : LC.CashoutEndMode(participationStartMode),
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
