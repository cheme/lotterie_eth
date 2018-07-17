pragma solidity ^0.4.23;

import { LotterieConf as LC } from "../LotterieConf.sol";


contract LotterieParam {

  LC.LotterieParams public param;
  LC.LotteriePhaseParams public phaseParam;
  LC.WinningParams public winningParam;

  function getWinningParam() public view returns(uint8, uint8, uint8) {
    return (winningParam.nbWinners,winningParam.nbWinnerMinRatio, uint8(winningParam.distribution));
  }



}
