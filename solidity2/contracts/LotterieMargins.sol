pragma solidity ^0.4.23;


import "./Thrower.sol";
import "./FromLotterie.sol";
import { LotterieConf as LC } from "./LotterieConf.sol";
import "./LotteriePhases.sol";

contract LotterieMargins is Thrower, LotteriePhases, FromLotterie {


  // for debugging
  event Withdraw(address to, uint amount);

  // can withdraw in participation
  function withdrawOwner()
    forThrowStorageNot2(Phase.Bidding,Phase.Off)
    onlyOwner 
    public returns (uint) {
    
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
  function withdrawContractAuthor()
    forThrowStorageNot2(Phase.Bidding,Phase.Off)
    onlyContractAuthor
    public returns (uint) {
    
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
  function withdrawThrower()
    forThrowStorageNot2(Phase.Bidding,Phase.Off)
    public returns (uint) {
    
    require(thrower == msg.sender);
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
  function withdrawDappAuthor()
    forThrowStorageNot2(Phase.Bidding,Phase.Off)
    public returns (uint) {
    
    require(param.authorDapp == msg.sender);
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

}
