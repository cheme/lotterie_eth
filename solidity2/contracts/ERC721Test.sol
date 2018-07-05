
pragma solidity ^0.4.23;

import './zeppelin/token/ERC721/ERC721Token.sol';

contract ERC721Test is ERC721Token {
  constructor()
  public
  ERC721Token("MyERC721","7")
  {

    super.addTokenTo(msg.sender, 0);
    super.addTokenTo(msg.sender, 1);
    super.addTokenTo(msg.sender, 2);
    super.addTokenTo(msg.sender, 3);
    super.addTokenTo(msg.sender, 4);
  }
}
