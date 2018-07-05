
pragma solidity ^0.4.23;

import "./LotterieThrow721.sol";
import './ERC223-token-standard/token/ERC223/ERC223_interface.sol';
import './ERC223-token-standard/token/ERC223/ERC223_receiving_contract.sol';

contract LotterieThrow223 is LotterieThrow721, ERC223ReceivingContract {

  ERC223Interface token;
  uint8 waitingInitValue = 0;

  function bid (
    uint commitmentSeed
  ) public {
    // require(msg.value == 0);
    internal_bid(msg.sender,commitmentSeed,0);
  }

  function mode() view public returns(uint8,address) {
    return (1,address(token)); // 223 mode
  }

  function withdrawAmount(uint amount) internal {
    token.transfer(msg.sender,amount);
  }

  function tokenFallback(address _from, uint _value, bytes _data) {
    // code does not allow 0 (0 indicates direct api call)
    require(_value != 0);
    require(msg.sender == address(token));
    // corner case of possible phase switch (but if right call should not happen)
    if(thr.currentPhase == Phase.Bidding) {
      uint commitmentSeed;
      if (_data.length == 36) {
        // check signature of bid call
        require(_data[0] == 69 &&
                _data[1] == 74 &&
                _data[2] == 42 &&
                _data[3] == 179);
        commitmentSeed = bytesToUInt256(4, _data);
      } else {
        // direct bid parameter usage
        require(_data.length == 32);
        commitmentSeed = bytesToUInt256(0, _data);
      }
      internal_bid(_from,commitmentSeed,_value);
    } else {
      require(thr.currentPhase == Phase.Construct);
      require(waitingInitValue == 1);
      require(_from == thrower);
      if (_data.length == 4) {
        require(_data[0] == 56 &&
                _data[1] == 55 &&
                _data[2] == 57 &&
                _data[3] == 159);
      } else {
        require(_data.length == 0);
      }
      thr.results.totalBidValue = _value;

      if (0 == nbERC721) {
        thr.currentPhase = Phase.Bidding;
      } else {
        waitingInitValue = 2;
      }

    }
  }

  function bytesToUInt256(uint _offst, bytes memory _input) internal pure returns (uint256 _output) {
        
        assembly {
            _output := mload(add(add(_input, _offst),32))
        }
  }

  function deffered_constructor(
    bool waitValue,
    uint16 nb721,
    address _token,
    uint paramsId,
    uint paramsPhaseId,
    uint32 ownerMargin,
    uint32 authorContractMargin,
    uint32 authorDappMargin,
    uint32 throwerMargin
  ) 
  public
  {
    require(waitingInitValue == 0);
    token = ERC223Interface(_token);
    if (waitValue) {
      waitingInitValue = 1;
    } else {
      waitingInitValue = 2;
    }

    internal_deffered_constructor(
      0,
      nb721,
      paramsId,
      paramsPhaseId,
      ownerMargin,
      authorContractMargin,
      authorDappMargin,
      throwerMargin
    );
  }
  function otherConditionConstruct() internal returns (bool) {
    return (waitingInitValue == 1);
  }


  function initPrize(
  )
  public
  {
    require(false);// only to generate a proto
  }


}
