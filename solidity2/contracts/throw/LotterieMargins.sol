pragma solidity ^0.4.23;


import "./Thrower.sol";
import "./FromLotterie.sol";
import "../LotteriePayment.sol";
import { LotterieConf as LC } from "../LotterieConf.sol";
import { ThrowLib as TL } from "./lib/ThrowLib.sol";
import "./LotteriePhases.sol";

contract LotterieMargins is Thrower, LotteriePhases, FromLotterie, LotteriePayment {


  // for debugging
  event Withdraw(address to, uint amount);
 
  // can withdraw in participation
  function withdrawOwner()
    onlyOwner 
    public returns (uint) {
    uint amount = TL.withdrawOwner(thr,param,phaseParam,winningParam);
    if (amount > 0) {
      withdrawAmount(amount);
      emit Withdraw(msg.sender, amount);
    }
    return amount;
  }

  function withdrawContractAuthor()
    onlyContractAuthor
    public returns (uint) {
    uint amount = TL.withdrawContractAuthor(thr,param,phaseParam,winningParam);
    if (amount > 0) {
      withdrawAmount(amount);
      emit Withdraw(msg.sender, amount);
    }
    return amount;
  }

  function withdrawThrower()
    public returns (uint) {
    require(thrower == msg.sender);
    uint amount = TL.withdrawThrower(thr,param,phaseParam,winningParam);
    if (amount > 0) {
      withdrawAmount(amount);
      emit Withdraw(msg.sender, amount);
    }
    return amount;
  }

  function withdrawDappAuthor()
    public returns (uint) {
    require(param.authorDapp == msg.sender);
    uint amount = TL.withdrawDappAuthor(thr,param,phaseParam,winningParam);
    if (amount > 0) {
      withdrawAmount(amount);
      emit Withdraw(msg.sender, amount);
    }
    return amount;
  }

}
