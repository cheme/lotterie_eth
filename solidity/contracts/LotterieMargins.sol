pragma solidity ^0.4.23;


import "./zeppelin/ownership/Ownable.sol";
import "./Author.sol";
import { LotterieConf as LC } from "./LotterieConf.sol";
import "./LotteriePhases.sol";

contract LotterieMargins is Author, Ownable,  LotteriePhases {


  // for debugging
  event Withdraw(address to, uint amount);

  

  // can withdraw in participation
  function withdrawOwner(uint throwId)
    forThrowStorageNot2(throwId,Phase.Bidding,Phase.Off)
    onlyOwner 
    public returns (uint) {
    
    LotterieThrow storage thr = allthrows[throwId];
    if (thr.withdraws.ownerWithdrawned == false) {
      uint amount = LC.calcMargin(thr.results.totalBidValue, thr.withdraws.ownerMargin);

      if (amount > 0) {
        thr.withdraws.ownerWithdrawned = true;
        thr.results.totalClaimedValue += amount;
        msg.sender.transfer(amount);
        emit Withdraw(msg.sender, amount);
        return amount;
      }
    }
    return 0;
  }
  function withdrawContractAuthor(uint throwId)
    forThrowStorageNot2(throwId,Phase.Bidding,Phase.Off)
    onlyContractAuthor
    public returns (uint) {
    
    LotterieThrow storage thr = allthrows[throwId];
    if (thr.withdraws.authorContractWithdrawned == false) {
    uint amount = LC.calcMargin(thr.results.totalBidValue, thr.withdraws.authorContractMargin);
      if (amount > 0) {
        thr.withdraws.authorContractWithdrawned = true;
        thr.results.totalClaimedValue += amount;
        msg.sender.transfer(amount);
        emit Withdraw(msg.sender, amount);
        return amount;
      }
    }
    return 0;
  }
  function withdrawThrower(uint throwId)
    forThrowStorageNot2(throwId,Phase.Bidding,Phase.Off)
    public returns (uint) {
    
    LotterieThrow storage thr = allthrows[throwId];
    require(thr.thrower == msg.sender);
    if (thr.withdraws.throwerWithdrawned == false) {
    uint amount = LC.calcMargin(thr.results.totalBidValue, thr.withdraws.throwerMargin);
      if (amount > 0) {
        thr.withdraws.throwerWithdrawned = true;
        thr.results.totalClaimedValue += amount;
        msg.sender.transfer(amount);
        emit Withdraw(msg.sender, amount);
        return amount;
      }
    }
    return 0;
  }
  function withdrawDappAuthor(uint throwId)
    forThrowStorageNot2(throwId,Phase.Bidding,Phase.Off)
    public returns (uint) {
    
    LotterieThrow storage thr = allthrows[throwId];
    LC.LotterieParams storage thrparams = params[thr.paramsId];
    require(thrparams.authorDapp == msg.sender);
    if (thr.withdraws.authorDappWithdrawned == false) {
    uint amount = LC.calcMargin(thr.results.totalBidValue, thr.withdraws.authorDappMargin);
      if (amount > 0) {
        thr.withdraws.authorDappWithdrawned = true;
        thr.results.totalClaimedValue += amount;
        msg.sender.transfer(amount);
        emit Withdraw(msg.sender, amount);
        return amount;
      }
    }
    return 0;
  }

  function validWithdrawMargins (
      uint32 ownerMargin,
      uint32 authorContractMargin,
      uint32 authorDappMargin,
      uint32 throwerMargin)
      public pure returns(bool) {

      // check for sum overflow (allows no gain from winner : 100% margin)
      adduint32req(ownerMargin,
        adduint32req(authorContractMargin,
          adduint32req(authorDappMargin,
          throwerMargin)));
      return true;
  }
  function adduint32req(uint32 a, uint32 b) internal pure returns (uint32 c) {
    c = a + b;
    require(c >= a);
    return c;
  }



}
