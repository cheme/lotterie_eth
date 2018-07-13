
pragma solidity ^0.4.23;

import '../zeppelin/token/ERC721/ERC721Token.sol';

contract ERC721Test is ERC721Token {
  constructor(uint nb)
  public
  ERC721Token("MyERC721","7")
  {
    for (uint i = 0; i < nb; i++) {
      super.addTokenTo(msg.sender, i);
    }
  }
}
