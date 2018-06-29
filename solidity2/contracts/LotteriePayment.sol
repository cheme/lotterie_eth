
pragma solidity ^0.4.23;

// abstract contract to allow specialization for ether or Ercxxx payment
contract LotteriePayment {
  function withdrawAmount(uint amount) internal;
  function mode() view public returns(uint8,address);
}
