
pragma solidity ^0.4.23;

// small addition on erc223 for lotterie lib
import '../ERC223-token-standard/token/ERC223/ERC223_interface.sol';


contract ERC223L is ERC223Interface {
 function name() constant returns (string _name);
 function symbol() constant returns (bytes32 _symbol);
 function decimals() constant returns (uint8 _decimals);
} 
