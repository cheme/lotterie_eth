//import Web3 from 'web3';

var lotterieContract = require('./build/contracts/Lotterie.json');
var lotterieThrowContract = require('./build/contracts/LotterieThrowEther.json');

var lotterieLib = {
  lotterieAbi : lotterieContract.abi,
  lotterieThrowAbi : lotterieThrowContract.abi,
 // no web3 function until web3 1.0 in truffle  web3 : 1,//new Web3(), // empty provider
  arrayAccessor : function(arr,conf) {
    var result = {};
    for (var field in conf) {
      if (conf.hasOwnProperty(field)) {
        result[field] = arr[conf[field]];
      }
    }
    return result;
  },
  newWinnerArray : function(arr) {
    return this.arrayAccessor(arr, {
     //return (w.withdrawned, w.participationId, w.score);
     withdrawned : 0,
     participationId : 1,
     score : 2
    });
  },
  newWinningParams : function(arr) {
    return this.arrayAccessor(arr, {
    //return (p.nbWinners,p.nbWinnerMinRatio);
    nbWinners : 0,
    nbWinnerMinRatio : 1,
    distribution : 2
    });
  },
  newLotterieParams : function(arr) {
    return this.arrayAccessor(arr, {
      authorDapp : 0,
      winningParamsId : 1,
      minBidValue : 2,
      biddingTreshold : 3,
      maxParticipant : 4,
      doSalt : 5
    });
  },
  newPhaseParams : function(arr) {
    return this.arrayAccessor(arr, {
      participationStartTreshold : 0,
      participationEndValue : 1,
      cashoutEndValue : 2,
      throwEndValue : 3,
      participationEndMode : 4,
      cashoutEndMode : 5,
      throwEndMode : 6
    });
  },
  newThrow : function(arr) {
    return this.arrayAccessor(arr, {
      paramsId : 0,
      paramsPhaseId : 1,
      currentSeed : 2,
      totalBidValue : 3,
      totalClaimedValue : 4,
      numberOfBid : 5,
      numberOfRevealParticipation : 6,
      thrower : 7,
      blockNumber : 8,
      currentPhase : 9
    });
  },
  newThrowWithdraws : function(arr) {
    return this.arrayAccessor(arr, {
//    return (thr.withdraws.ownerMargin,thr.withdraws.authorContractMargin, thr.withdraws.authorDappMargin, thr.withdraws.throwerMargin,
 //   thr.withdraws.ownerWithdrawned, thr.withdraws.authorContractWithdrawned, thr.withdraws.authorDappWithdrawned, thr.withdraws.throwerWithdrawned);

      ownerMargin : 0,
      authorContractMargin : 1,
      authorDappMargin : 2,
      throwerMargin : 3,
      ownerWithdrawned : 4,
      authorContractWithdrawned : 5,
      authorDappWithdrawned : 6,
      throwerWithdrawned : 7
    });
  },
  newParticipation : function(arr) {
    return this.arrayAccessor(arr, {
      seed : 0,
      from : 1,
      state : 2
    });
  },
  winningDistribution : {
    Equal : 0
  },
  participationEndModes : {
    EagerAbsolute : 0,
    EagerRelative : 1,
    Absolute : 2,
    Relative : 3
  },
  participationStates : {
    BidSent : 0,
    Revealed : 1,
    Cashout : 2
  },
  phases : {
    Construct : 0,
    Bidding : 1,
    Participation : 2,
    Cashout : 3,
    End : 4,
    Off : 5
  },
  cashoutEndModes : {
    Absolute : 0,
    Relative : 1
  },
  calcCommitment : function(hexstring) {
    if (hexstring.startsWith('0x')) {
      hexstring = hexstring.substr(2);
    }
    return this.web3.utils.sha3('0x' + hexstring.padStart(64,'0'),{encoding:'hex'});
    //return web3.sha3(hexstring.padStart(64,'0'),{encoding:'hex'});
  },
  padHexInt : function(hexstring) {
    if (hexstring.startsWith('0x')) {
      hexstring = hexstring.substr(2);
      hexstring = '0x' + hexstring.padStart(64,'0');
    } else {
      hexstring = hexstring.padStart(64,'0');
    }
    return hexstring;
  },
  calcScore : function(hexpseed,hexcseed) {
    var b1 = hexToBytes(this.padHexInt(hexpseed));
    var b2 = hexToBytes(this.padHexInt(hexcseed));
    for (var i = 0; i < b1.length; ++i) {
      b1[i] = b1[i] ^ b2[i];
    }
    return '0x' + this.padHexInt(bytesToHex(b1));
  }
};

lotterieLib.defaultConf = {
    dosalt : true,
    nbWinners : 5,
    nbWinnerMinRatio : 50, // less than 10 participant we apply ratio 
    distribution : lotterieLib.winningDistribution.Equal,
    minBidValue : 0, //lotterieLib.web3.utils.toWei("0.001","ether"),
    biddingTreshold : 0, //  lotterieLib.web3.utils.toWei("1","ether"), // do not allow more than a ether (100 participant at min value)
    participationStartTreshold : 50, // 50 participant start
    maxParticipant : 50, // 50 participant start
    participationEndMode : lotterieLib.participationEndModes.EagerRelative, // Eager is a must have
    participationEndValue : 3600, // one hour
    cashoutEndMode : lotterieLib.cashoutEndModes.Relative,
    cashoutEndValue : 3600, // one hour
    throwEndMode : lotterieLib.cashoutEndModes.Relative, // best absolute most of the time
    throwEndValue : 3600

};

function hexToBytes(hex) {
    if (hex.startsWith('0x')) {
      hex = hex.substr(2);
    }
    for (var bytes = [], c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}
function bytesToHex(bytes) {
    for (var hex = [], i = 0; i < bytes.length; i++) {
        hex.push((bytes[i] >>> 4).toString(16));
        hex.push((bytes[i] & 0xF).toString(16));
    }
    return hex.join("");
}

export default lotterieLib;
