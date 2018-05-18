pragma solidity ^0.4.23;
//pragma experimental ABIEncoderV2;

import "./zeppelin/ownership/Ownable.sol";
import "./LotterieThrow.sol";
import "./LotterieThrowProxy.sol";
import "./LotterieParams.sol";
import "./Author.sol";
import "./LotterieIf.sol";

// Contract for Lotterie
contract Lotterie is Ownable, LotterieParams, Author, LotterieIf {


  event NewThrowTemplate(address throwTemplateAddress);

  address throwTemplate;

  function setThrowTemplate(address newTemplate) external onlyOwner {
    throwTemplate = newTemplate;
    emit NewThrowTemplate(newTemplate);
  }

  event NewThrow(address throwAddress);

  function getParams(uint ix) external returns(
    address,
    uint,
    uint,
    uint,
    uint64,
    bool
  ) {
    return (
      params[ix].authorDapp,
      params[ix].winningParamsId,
      params[ix].minBidValue,
      params[ix].biddingTreshold,
      params[ix].maxParticipant,
      params[ix].doSalt);
  }

  function getPhaseParams(uint ix) external returns(
    uint,
    uint,
    uint,
    uint,
    uint8,
    uint8,
    uint8 

  ) {
    return (
      phaseParams[ix].participationStartTreshold,
      phaseParams[ix].participationEndValue,
      phaseParams[ix].cashoutEndValue,
      phaseParams[ix].throwEndValue,
      uint8(phaseParams[ix].participationEndMode),
      uint8(phaseParams[ix].cashoutEndMode),
      uint8(phaseParams[ix].throwEndMode)
    );
  }

  function getWiningParams(uint ix) external returns(
    uint16,
    uint16,
    uint8
  ) {
    return(
      winningParams[ix].nbWinners,
      winningParams[ix].nbWinnerMinRatio,
      uint8(winningParams[ix].distribution)
    );
  }


 
  LotterieThrow [] public allthrows;

  function getThrowAddress(uint ix) view external returns (address) {
    return address(allthrows[ix]);
  }

  constructor(
    address _authorContract,
    address _throwTemplate
  )
  Author(_authorContract)
  public
  {
     throwTemplate = _throwTemplate;
     emit NewThrowTemplate(_throwTemplate);
  }

  function getAuthorContract()  external returns(address) {
    return authorContract;
  }

  function getOwner() external returns(address) {
    return owner;
  }

  // TODO start with already defined pointers (set of const pointers in storage on deploy)
  // start a thow
  // @payable value is added as inital win value (that way you can do free lotterie with something to win with minBidValue to 0 and not participating)
  function initThrow (
    uint paramsId,
    uint paramsPhaseId,

    uint32 ownerMargin,
    uint32 authorContractMargin,
    uint32 authorDappMargin,
    uint32 throwerMargin

  ) external payable {
    require(LC.validParticipationSwitch(
      params[paramsId].maxParticipant,
      params[paramsId].biddingTreshold,
      phaseParams[paramsPhaseId].participationStartTreshold
    ));
    require(LC.validWithdrawMargins(
      ownerMargin,
      authorContractMargin,
      authorDappMargin,
      throwerMargin));
    // TODO 
    LotterieThrowProxy thr_proxy = new LotterieThrowProxy(throwTemplate);
    //LotterieThrowProxy thr_proxy = new LotterieThrowProxy();
    LotterieThrow thr = LotterieThrow(address(thr_proxy));

 
    thr.deffered_constructor.value(msg.value)(
      paramsId,
      paramsPhaseId,

      ownerMargin,
      authorContractMargin,
      authorDappMargin,
      throwerMargin
    );
    allthrows.push(thr);

    emit NewThrow(address(thr));
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


}
