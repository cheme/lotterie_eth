pragma solidity ^0.4.23;


contract LotterieThrowProxy {

constructor(address _add) public {
    assembly {
      sstore(0x10000,_add)
    }
}
/*
function () payable public {
    bytes memory data = msg.data;
    assembly {
      let _target := sload(0x10000)
      // dest address is a placeholder
      let result := delegatecall(gas, _target, add(data, 0x20), mload(data), 0, 0)
      let size := returndatasize

      let ptr := mload(0x40)
      returndatacopy(ptr, 0, size)

      switch result
      case 0 { revert(ptr, size) }
      default { return(ptr, size) }
    }
  }
  */

function () payable public {
  assembly {
    let _target := sload(0x10000)
    calldatacopy(0x0, 0x0, calldatasize) 
    let retval := delegatecall(gas, _target, 0x0, calldatasize, 0x0, 0)
    let returnsize := returndatasize
    returndatacopy(0x0, 0x0, returnsize)
    switch retval case 0 {revert(0, 0)} default {return (0, returnsize)}
  }
}

}
