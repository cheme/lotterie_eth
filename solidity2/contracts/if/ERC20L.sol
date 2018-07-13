
pragma solidity ^0.4.23;

// small addition on erc20 for lotterie lib

import '../zeppelin/token/ERC20/ERC20.sol';

contract ERC20L is ERC20 {
 function name() constant returns (string _name);
 function symbol() constant returns (bytes32 _symbol);
 function decimals() constant returns (uint8 _decimals);
} 
