pragma solidity ^0.4.23;

import "./zeppelin/math/SafeMath.sol";
//library LotterieLib {
contract LotterieLib {
  using SafeMath for uint;
  using SafeMath for uint64; // TODO update safemath to latest openzeppelin (currently no fn)
	function convert(uint amount,uint conversionRate) public pure returns (uint convertedAmount)
	{
		return amount.add(conversionRate);
	}
}
