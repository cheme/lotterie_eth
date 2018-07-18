pragma solidity ^0.4.23;

import "../LotterieThrow.sol";
import "../../if/LotterieIf.sol";
//import './zeppelin/token/ERC20/ERC20.sol';
import '../../zeppelin/token/ERC721/ERC721Receiver.sol';
import '../../zeppelin/token/ERC721/ERC721.sol';
import { ThrowLib as TL } from "../lib/ThrowLib.sol";

contract LotterieThrow721 is LotterieThrow, ERC721Receiver {

  uint8 public nbERC721;
  struct PrizeErc721 {
    address token;
    uint256 tId;
  }
  PrizeErc721[] private erc721s;

  function nbErc721Prizes() external view returns(uint) {
    return (erc721s.length);
  }

  function prizeErc721(uint8 ix) external view returns(address, uint256) {
    return (erc721s[uint(ix)].token,erc721s[uint(ix)].tId);
  }


  function addErc721Prize(address tok, uint256 p) internal {

    require(thr.currentPhase == TL.Phase.Construct);
    require(erc721s.length < nbERC721);

    erc721s.push(PrizeErc721({
      token : tok,
      tId : p
    }));

    if (erc721s.length == nbERC721) {
      nbERC721 = 0; // gb eth or unlock other cond
      if (!otherConditionConstruct()) {
        thr.currentPhase = TL.Phase.Bidding;
      }
    }
  }

  function onERC721Received(
    address _operator,
    address,// _from,
    uint256 _tokenId,
    bytes _data
  )
    public
    returns(bytes4) {
    require(_data.length == 0);
    require(_operator == thrower);
    addErc721Prize(msg.sender, _tokenId);
    return (ERC721_RECEIVED);
  }


  function otherConditionConstruct() internal returns (bool);

  // ignore remaining initialization (erc721 or other erc initialbid) and start as is
  function forceStartNoPrize(
  )
  external 
  {
    require(thr.currentPhase == TL.Phase.Construct);
    require(msg.sender == thrower);
    // nbERC721 = 0; // keep trace of intended
    thr.currentPhase = TL.Phase.Bidding;
  }

  // let owner change state for stuct contract 
  // (here we check that we already pass the bidding phase delay)
  function constructForceOff(
  ) onlyOwner()
  external 
  {
    require(thr.currentPhase == TL.Phase.Construct);
    // if can switch to participation the contract is useless (no possibility to bid)
    require (TL.canSwitchToParticipation(thr,param,phaseParam));
    thr.currentPhase = TL.Phase.Off;
  }



  function internal_deffered_constructor(

    uint amount,
    uint8 _nbERC721,
    uint paramsId,
    uint paramsPhaseId,

    uint32 ownerMargin,
    uint32 authorContractMargin,
    uint32 authorDappMargin,
    uint32 throwerMargin
  ) 
  internal 
  {

    // warn Construct must be 0 (default value)
    require(thr.currentPhase == TL.Phase.Construct);
    // only from lotterie main contract -> NO
    //require(address(lotterie) == msg.sender);
    //FromLotterie()
    lotterie = LotterieIf(msg.sender);
    //Thrower(tx.origin)
    thrower = tx.origin;
    TL.initParams(paramsId,lotterie,param,winningParam);
    TL.initPhaseParams(paramsPhaseId,lotterie,phaseParam);
    TL.Phase cp; 
    if (_nbERC721 > 0 || otherConditionConstruct()) {
      nbERC721 = _nbERC721;
      cp = TL.Phase.Construct;
    } else {
      cp = TL.Phase.Bidding;
    }

    TL.internal_deffered_constructor(

     amount,
     paramsId,
     paramsPhaseId,

     ownerMargin,
     authorContractMargin,
     authorDappMargin,
     throwerMargin,

    cp,
    thr,
    phaseParam);
 
  }

  function withdraw721(uint64 participationId)
    public 
    forParticipation(participationId,TL.ParticipationState.Cashout,TL.Phase.End) 
    {
     // go through linked list
     TL.Participation storage part = participations[participationId];

     require(msg.sender == part.from);

     uint result = getWinningPos(participationId);

     while (result < erc721s.length) {
       // actual withdraw
       withdraw721(participationId, result);
       // common case is one it
       if (thr.results.totalCashout < winners.length) {
         result += thr.results.totalCashout;
       } else {
         result += winners.length;
       }
     }
  }

  function withdrawAllWin(uint64 participationId)
    public 
    forParticipation(participationId,TL.ParticipationState.Cashout,TL.Phase.End) 
    {
     // go through linked list
     TL.Participation storage part = participations[participationId];

     require(msg.sender == part.from);

     uint result = getWinningPos(participationId);
     // actual withdraw
     withdrawWinValue(participationId, result);
     while (result < erc721s.length) {
       // actual withdraw
       withdraw721(participationId, result);
       // common case is one it
       if (thr.results.totalCashout < winners.length) {
         result += thr.results.totalCashout;
       } else {
         result += winners.length;
       }
     }
  }

  event Win721(uint64 participationId, address winner, uint ix721);

  function withdraw721(uint64 participationId, uint result) internal {
    PrizeErc721 storage p = erc721s[result];
    ERC721(p.token).transferFrom(address(this),msg.sender,p.tId);
    emit Win721(participationId, msg.sender, result);
  }

  function off721(uint ix721)
    forThrowStorage(TL.Phase.Off) 
    onlyOwner
    external {
    PrizeErc721 storage p = erc721s[ix721];
    ERC721(p.token).transferFrom(address(this),msg.sender,p.tId);
  }



}


