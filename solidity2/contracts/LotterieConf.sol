
pragma solidity ^0.4.23;

// TODO check times are > a minute
// TODO check absolute times are consecutive
// TODO check if transformed to contract (use call instead of delegatecall) in term of cost
// TODO this split does not seems relevant contract whise
library LotterieConf {
  

  struct LotterieWithdraw {
    uint winningBase;
    uint32 ownerMargin;
    uint32 authorContractMargin;
    uint32 authorDappMargin;
    uint32 throwerMargin;


    bool ownerWithdrawned;
    bool authorContractWithdrawned;
    bool authorDappWithdrawned;
    bool throwerWithdrawned;
  }

  enum ParticipationEndModes {
    EagerAbsolute,
    EagerRelative,
    Absolute,
    Relative
  }

  enum CashoutEndMode {
    Absolute,
    Relative
  }

  enum WinningDistribution {
    Equal
  }


  // rules for winning
  struct WinningParams {
    // Hard limit to 256 winners due to cost of accessing 256 position in linked storage
    uint8 nbWinners;
    // Percentage, If not enough participant to reach this ratio of , round down but one if result 0
    uint8 nbWinnerMinRatio;
    WinningDistribution distribution;
  }

  struct LotterieParams {
    address authorDapp;
    uint winningParamsId;
    uint minBidValue;
    uint biddingTreshold;
    uint64 maxParticipant;
    // salt might be consider to costfull (additional gas cost on every user)
    bool doSalt;
  }

  struct LotteriePhaseParams {
    uint participationStartTreshold;
    uint participationEndValue;
    uint cashoutEndValue;
    uint throwEndValue;
    CashoutEndMode participationStartMode;
    // u8
    ParticipationEndModes participationEndMode;
    // bool
    CashoutEndMode cashoutEndMode;
    CashoutEndMode throwEndMode;
  }
  function validParticipationSwitch(uint64 maxParticipant, uint biddingTreshold, CashoutEndMode participationStartMode, uint participationStartTreshold) public view returns(bool) {
     return (
     maxParticipant != 0 || 
     biddingTreshold != 0 || 
     (participationStartMode == CashoutEndMode.Relative && participationStartTreshold > 0) || 
     (participationStartMode == CashoutEndMode.Absolute && participationStartTreshold > now));
  }

  function validCashoutSwitch(ParticipationEndModes participationEndMode, uint participationEndValue) public pure returns(bool) {
    // avoid relative time overflow
    if (participationEndMode == ParticipationEndModes.EagerRelative 
        || participationEndMode == ParticipationEndModes.Relative) {
      // max participation additional time at 128 bit (more than enough for a date)
      if (participationEndValue > 2**128) {
        return false;
      }
    }
    // avoid unlimited time with non eager mode
    return (!(participationEndValue == 0 && 
      (participationEndMode == ParticipationEndModes.Absolute
      || participationEndMode == ParticipationEndModes.Relative)));
  }

  // note that relative allows way longer lotterie because duration hard limit is relative to start of cashout phase
  // when absolute hard limit is only relative to the start of the lotterie
  function validEndSwitch(CashoutEndMode cashoutEndMode, uint cashoutDuration) public view returns(bool) {
    uint limit = 4 weeks;
    return validDateOnlySwitch(cashoutEndMode,cashoutDuration,limit);
  }
  function validOffSwitch(CashoutEndMode cashoutEndMode, uint cashoutDuration) public view returns(bool) {
    uint limit = 20 weeks;
    return validDateOnlySwitch(cashoutEndMode,cashoutDuration,limit);
  }

  function validDateOnlySwitch(CashoutEndMode endMode, uint duration, uint hardLimit) public view returns(bool) {
    if (endMode == CashoutEndMode.Absolute) {
      // absolute
      if (duration > now + hardLimit) {
        return false;
      }
    } else {
      // relative
      if (duration > hardLimit) {
        return false;
      }
    }
    return true;
  }


  function validWinningParams(uint8 nbWinners, uint8 nbWinnerMinRatio) public pure returns(bool) {
    if (nbWinnerMinRatio > 100) {
      return false;
    }
    // max u8 value is use as uninitialized linked list pointer
    if (nbWinners == 0 || nbWinners == 255) {
      return false;
    }
    return true;
  }
  function salt() public view returns(uint) {
    //uint no = block.timestamp;
    //uint no = now;
    uint nb = block.number;
    uint lastblockhashused = uint(blockhash(nb - 1));
    return uint(keccak256(abi.encodePacked(lastblockhashused ^ nb ^ now)));
  }

  function calcMargin(uint totalBidValue, uint32 margin) public pure returns(uint) {
    if (margin == 0) {
      return 0;
    }
    if (totalBidValue >= (2**(256-32) -1)) {
       return (totalBidValue / ((2**32) - 1)) * margin;  
    } else {
       return (totalBidValue * margin / ((2**32) - 1));  
    }
  }
  function validWithdrawMargins (
      uint32 ownerMargin,
      uint32 authorContractMargin,
      uint32 authorDappMargin,
      uint32 throwerMargin)
      public pure returns(bool) {

      // check for sum overflow (allows no gain from winner : 100% margin)
      adduint32req(ownerMargin,
        adduint32req(authorContractMargin,
          adduint32req(authorDappMargin,
          throwerMargin)));
      return true;
  }
  function adduint32req(uint32 a, uint32 b) internal pure returns (uint32 c) {
    c = a + b;
    require(c >= a);
    return c;
  }


}
