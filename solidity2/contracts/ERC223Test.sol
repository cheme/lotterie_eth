
pragma solidity ^0.4.23;

import './ERC223-token-standard/token/ERC223/ERC223_token.sol';

contract ERC223Test is ERC223Token {
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
   totalSupply = amount;
   balances[msg.sender] = totalSupply;
 }

}
