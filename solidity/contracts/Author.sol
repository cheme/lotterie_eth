pragma solidity ^0.4.23;


contract Author {

  // no index (TODO same for owner ??)
  event AuthorContractTransferred(address previousOwner, address newOwner);
  // address to reward author TODO move in its contract
  address public authorContract;
	constructor(
    address _authorContract
  )
  public
  {
    authorContract = _authorContract;
  }

  modifier onlyContractAuthor() {
    require(msg.sender == authorContract);
    _;
  }
  function transferAuthoring(address newAuthor) public onlyContractAuthor {
    require(newAuthor != address(0));
    emit AuthorContractTransferred(authorContract, newAuthor);
    authorContract = newAuthor;
  }


}
