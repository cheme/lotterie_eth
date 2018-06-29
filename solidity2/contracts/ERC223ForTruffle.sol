pragma solidity ^0.4.11;
// simplified if to avoid variadic call in truffle TODO retest with a truffle that use web3 1.0
contract ERC223ForTruffle {
    uint public totalSupply;
    function balanceOf(address who) constant returns (uint);
//    function transfer(address to, uint value);
    function transfer(address to, uint value, bytes data);
    event Transfer(address indexed from, address indexed to, uint value, bytes data);
}
