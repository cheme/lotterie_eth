pragma solidity ^0.4.23;
//pragma experimental ABIEncoderV2;

import "../zeppelin/ownership/Ownable.sol";
import "../throw/ether/LotterieThrowEther.sol";
import "../throw/223/LotterieThrow223.sol";
import "../throw/20/LotterieThrow20.sol";
import "../throw/721/LotterieThrow721.sol";
import "./LotterieThrowProxy.sol";
import "./LotterieParams.sol";
import "../throw/Author.sol";
import "../if/LotterieIf.sol";

// Contract for Lotterie
contract Lotterie is Ownable, LotterieParams, Author, LotterieIf {


  event NewThrowTemplate(address throwTemplateAddress,uint8);

  address throwTemplate;
  address throwTemplate223;
  address throwTemplate20;

  bool blockTemplates;

  function setThrowTemplate(address newTemplate) external onlyOwner {
    require(blockTemplates == false);
    throwTemplate = newTemplate;
    emit NewThrowTemplate(newTemplate,0);
  }
  function setThrow223Template(address newTemplate) external onlyOwner {
    require(blockTemplates == false);
    throwTemplate223 = newTemplate;
    emit NewThrowTemplate(newTemplate,1);
  }
  function setThrow20Template(address newTemplate) external onlyOwner {
    require(blockTemplates == false);
    throwTemplate20 = newTemplate;
    emit NewThrowTemplate(newTemplate,2);
  }



  // if contract templates ok, block it (no template update possible)
  function doBlockTemplates() external onlyOwner {
    blockTemplates = true;
  }

  event NewThrow(address throwAddress,uint8 mode);


 
  // any kind of throw
  LotterieThrow721 [] public allthrows;

  function getTotalNbThrow() view external returns (uint) {
    return allthrows.length;
  }


  function getThrowAddress(uint ix) view external returns (address) {
    return address(allthrows[ix]);
  }

  constructor(
    address _authorContract,
    address _throwTemplate,
    address _throwTemplate223,
    address _throwTemplate20
  )
  Author(_authorContract)
  public
  {
     blockTemplates = false;
     throwTemplate = _throwTemplate;
     throwTemplate223 = _throwTemplate223;
     throwTemplate20 = _throwTemplate20;
     emit NewThrowTemplate(_throwTemplate,0);
     emit NewThrowTemplate(_throwTemplate223,1);
     emit NewThrowTemplate(_throwTemplate20,2);
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
    uint8 nb721,
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
      phaseParams[paramsPhaseId].participationStartMode,
      phaseParams[paramsPhaseId].participationStartTreshold
    ));
    require(LC.validWithdrawMargins(
      ownerMargin,
      authorContractMargin,
      authorDappMargin,
      throwerMargin));
    // TODO 
//    LotterieThrowProxy thr_proxy = new LotterieThrowProxy(throwTemplate);

    address thr_proxy;
    address thr_template = throwTemplate; 
    assembly {
      let contractCode_init := mload(0x40) // free memory ptr

      let contractCode := contractCode_init
           
     
       mstore(add(contractCode, 0x0b), thr_template)
       mstore(sub(contractCode, 0x09), 0x000000000000000000603160008181600b9039f3600080808080368092803773)
       mstore(add(contractCode, 0x2b), 0x5af43d828181803e808314602f57f35bfd000000000000000000000000000000)
            
       thr_proxy := create(0, contractCode_init, 60)
            
/*
//6080604052348015600f57600080fd5b5060748061001e6000396000f300608060405236600080376000803660007f
      mstore(contractCode, 
0x6080604052348015600f57600080fd5b5060748061001e6000396000f3006080)
      contractCode := add(contractCode, 0x20)
      mstore(contractCode, 
0x60405236600080376000803660007f0000000000000000000000000000000000)
      contractCode := add(contractCode, 0xf)
//1234567890000000000000000000000000000000000000000000000123456789
      mstore(contractCode, thr_template)
//5af43d806000803e818015604357816000f35b600080fd00a165627a7a723058200604f8368392853a3b25491e46dc26811e266b70c2d5d6b58a9878af7f4c7e2b0029
      contractCode := add(contractCode, 0x20)
      mstore(contractCode, 
0x5af43d806000803e818015604357816000f35b600080fd00a165627a7a723058)
      contractCode := add(contractCode, 0x20)
      mstore(contractCode, 
0x200604f8368392853a3b25491e46dc26811e266b70c2d5d6b58a9878af7f4c7e)
      contractCode := add(contractCode, 0x20)
      mstore(contractCode, 
0x2b00290000000000000000000000000000000000000000000000000000000000)
       thr_proxy := create(0, contractCode_init, 146) // length (4 * 32) + 15 + 3
*/
       if iszero(extcodesize(thr_proxy)) {
         revert(0, 0)
       }
    }

    //LotterieThrowProxy thr_proxy = new LotterieThrowProxy();
    LotterieThrowEther thr = LotterieThrowEther(address(thr_proxy));

 
    thr.deffered_constructor.value(msg.value)(
      nb721,
      paramsId,
      paramsPhaseId,

      ownerMargin,
      authorContractMargin,
      authorDappMargin,
      throwerMargin
    );
    allthrows.push(thr);

    emit NewThrow(address(thr),0);
  }

  function initThrow223 (
    bool waitValue,
    uint8 nb721,
    address token,
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
      phaseParams[paramsPhaseId].participationStartMode,
      phaseParams[paramsPhaseId].participationStartTreshold
    ));
    require(LC.validWithdrawMargins(
      ownerMargin,
      authorContractMargin,
      authorDappMargin,
      throwerMargin));

    address thr_proxy;
    address thr_template = throwTemplate223;
    assembly {
      let contractCode_init := mload(0x40) // free memory ptr

      let contractCode := contractCode_init
           
     
       mstore(add(contractCode, 0x0b), thr_template)
       mstore(sub(contractCode, 0x09), 0x000000000000000000603160008181600b9039f3600080808080368092803773)
       mstore(add(contractCode, 0x2b), 0x5af43d828181803e808314602f57f35bfd000000000000000000000000000000)
            
       thr_proxy := create(0, contractCode_init, 60)
            
       if iszero(extcodesize(thr_proxy)) {
         revert(0, 0)
       }
    }
    //LotterieThrowProxy thr_proxy = new LotterieThrowProxy();
    LotterieThrow223 thr = LotterieThrow223(address(thr_proxy));

 
    thr.deffered_constructor(
      waitValue,
      nb721,
      token,
      paramsId,
      paramsPhaseId,

      ownerMargin,
      authorContractMargin,
      authorDappMargin,
      throwerMargin
    );
    allthrows.push(thr);

    emit NewThrow(address(thr),1);
  }
  function initThrow20 (
    bool waitValue,
    uint8 nb721,
    address token,
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
      phaseParams[paramsPhaseId].participationStartMode,
      phaseParams[paramsPhaseId].participationStartTreshold
    ));
    require(LC.validWithdrawMargins(
      ownerMargin,
      authorContractMargin,
      authorDappMargin,
      throwerMargin));

    address thr_proxy;
    address thr_template = throwTemplate20;
    assembly {
      let contractCode_init := mload(0x40) // free memory ptr

      let contractCode := contractCode_init
           
     
       mstore(add(contractCode, 0x0b), thr_template)
       mstore(sub(contractCode, 0x09), 0x000000000000000000603160008181600b9039f3600080808080368092803773)
       mstore(add(contractCode, 0x2b), 0x5af43d828181803e808314602f57f35bfd000000000000000000000000000000)
            
       thr_proxy := create(0, contractCode_init, 60)
            
       if iszero(extcodesize(thr_proxy)) {
         revert(0, 0)
       }
    }
    //LotterieThrowProxy thr_proxy = new LotterieThrowProxy();
    LotterieThrow20 thr = LotterieThrow20(address(thr_proxy));

 
    thr.deffered_constructor(
      waitValue,
      nb721,
      token,
      paramsId,
      paramsPhaseId,

      ownerMargin,
      authorContractMargin,
      authorDappMargin,
      throwerMargin
    );
    allthrows.push(thr);

    emit NewThrow(address(thr),2);
  }
 
  // warning this function should not be use outside of testing 
  // (especially not for calculing bid commitment when using non local ethereum instance)
  function checkCommitment(uint256 hiddenSeed) pure external returns(uint) {
    return (uint(keccak256(abi.encodePacked(hiddenSeed))));
  }
  // mainly for testing or asserting correct implementation
  function checkScore(uint256 hiddenSeed,uint256 currentSeed) pure external returns(uint) {
    return (hiddenSeed ^ currentSeed);
  }

  // TODO find a way to declare and address with two If at the same time and move this to params implementing paramsif
  function getWinningParams(uint ix) external returns(
    uint8,
    uint8,
    uint8
  ) {
    return(
      winningParams[ix].nbWinners,
      winningParams[ix].nbWinnerMinRatio,
      uint8(winningParams[ix].distribution)
    );
  }



  function getPhaseParams1(uint ix) external returns(
    uint,
    uint,
    uint8,
    uint8
  ) {
    return (
      phaseParams[ix].participationStartTreshold,
      phaseParams[ix].participationEndValue,
      uint8(phaseParams[ix].participationStartMode),
      uint8(phaseParams[ix].participationEndMode)
    );
  }
  function getPhaseParams2(uint ix) external returns(
    uint,
    uint,
    uint8,
    uint8
  ) {
    return (
      phaseParams[ix].cashoutEndValue,
      phaseParams[ix].throwEndValue,
      uint8(phaseParams[ix].cashoutEndMode),
      uint8(phaseParams[ix].throwEndMode)
    );
  }


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



}
