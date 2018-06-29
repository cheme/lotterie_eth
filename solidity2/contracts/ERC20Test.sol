
pragma solidity ^0.4.23;

import './zeppelin/token/ERC20/StandardToken.sol';

contract ERC20Test is StandardToken {
 function name() constant returns (string _name) {
   return ("TestToken");
 }
 function symbol() constant returns (bytes32 _symbol) {
   return ('T');
 }
 function decimals() constant returns (uint8 _decimals) {
   return (3);
 }
 constructor(uint amount) {
   totalSupply_ = amount;
   balances[msg.sender] = totalSupply_;
 }

}
