pragma solidity ^0.4.23;

import { LotterieConf as LC } from "./LotterieConf.sol";

interface LotterieIf {

  function getAuthorContract() external returns(address);

  function getOwner() external returns(address);

 
  function initThrow (
    uint16 nb721,
    uint paramsId,
    uint paramsPhaseId,

    uint32 ownerMargin,
    uint32 authorContractMargin,
    uint32 authorDappMargin,
    uint32 throwerMargin

  ) external payable;

  function getParams(uint ix) external returns(
    address,
    uint,
    uint,
    uint,
    uint64,
    bool
  );

  function getPhaseParams1(uint ix) external returns(
    uint,
    uint,
    uint8,
    uint8 
  );
  function getPhaseParams2(uint ix) external returns(
    uint,
    uint,
    uint8,
    uint8 
  );

 function getWinningParams(uint ix) external returns(
    uint16,
    uint16,
    uint8
  );

}
