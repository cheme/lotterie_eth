
const truffleAssert = require('truffle-assertions');

var Lotterie = artifacts.require("./Lotterie.sol");



// TODO move to its own js lif
lotterieLib = {
  arrayAccessor : function(arr,conf) {
    result = {};
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
  newThrow : function(arr) {
    return this.arrayAccessor(arr, {
    //return (thr.paramsId, thr.currentSeed, thr.totalBidValue, thr.totalClaimedValue, thr.numberOfBid, thr.numberOfRevealParticipation, thr.thrower,thr.blockNumber);
      paramsId : 0,
      currentSeed : 1,
      totalBidValue : 2,
      totalClaimedValue : 3,
      numberOfBid : 4,
      numberOfRevealParticipation : 5,
      thrower : 6,
      blockNumber : 7
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
    Bidding : 0,
    Participation : 1,
    Cashout : 2,
    End : 3,
    Off : 4
  },
  cashoutEndModes : {
    Absolute : 0,
    Relative : 1
  },
  calcCommitment : function(hexstring) {
    if (hexstring.startsWith('0x')) {
      hexstring = hexstring.substr(2);
    }
    return web3.sha3(hexstring.padStart(64,'0'),{encoding:'hex'});
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
}

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

const conf1 = {
  dosalt : true,
  nbWinners : 5,
  nbWinnerMinRatio : 50, // less than 10 participant we apply ratio 
  distribution : lotterieLib.winningDistribution.Equal,
  minBidValue : web3.toWei(0.001,"ether"),
  biddingTreshold : web3.toWei(1,"ether"), // do not allow more than a ether (100 participant at min value)
  participationStartTreshold : 0, // no time switch (absolute)
  maxParticipant : 50, // 50 participant start
  participationEndMode : lotterieLib.participationEndModes.EagerRelative, // Eager is a must have
  participationEndValue : 30, // seconds
  cashoutEndMode : lotterieLib.cashoutEndModes.Relative,
  cashoutEndValue : 30,
  throwEndMode : lotterieLib.cashoutEndModes.Relative, // best absolute most of the time
  throwEndValue : 30
}
async function configuration(lotterie,account_contract_dapp,c) {
    var res = await lotterie.addWinningParams(c.nbWinners,c.nbWinnerMinRatio,c.distribution);
    assert.equal(res.error, null);
    var res = await lotterie.addPhaseParams(
      c.participationStartTreshold,
      c.participationEndMode,
      c.participationEndValue,
      c.cashoutEndMode,
      c.cashoutEndValue,
      c.throwEndMode,
      c.throwEndValue
    );
    assert.equal(res.error, null);
    var res = await lotterie.addParams(
      0,
      0,
      c.dosalt,
      account_contract_dapp,
      c.minBidValue,
      c.biddingTreshold,
      c.maxParticipant
    );
    assert.equal(res.error, null);
  }




contract('Lotterie', function(accounts) {
/*    var lotterie;
    before(async function() {
    var account_contract_author = accounts[1];
    lotterie = await Lotterie.deployed(account_contract_author);
    var res = await lotterie.addWinningParams(5,50);
    });
*/

/*  it("should put 10000 MetaCoin in the first account", function() {
    return Lotterie.deployed().then(function(instance) {
      return instance.getBalance.call(accounts[0]);
    }).then(function(balance) {
      assert.equal(balance.valueOf(), 10000, "10000 wasn't in the first account");
    });
  });
  it("should call a function that depends on a linked library", function() {
    var meta;
    var metaCoinBalance;
    var metaCoinEthBalance;

    return Lotterie.deployed().then(function(instance) {
      meta = instance;
      return meta.getBalance.call(accounts[0]);
    }).then(function(outCoinBalance) {
      metaCoinBalance = outCoinBalance.toNumber();
      return meta.getBalanceInEth.call(accounts[0]);
    }).then(function(outCoinBalanceEth) {
      metaCoinEthBalance = outCoinBalanceEth.toNumber();
    }).then(function() {
      assert.equal(metaCoinEthBalance, 2 * metaCoinBalance, "Library function returned unexpected function, linkage may be broken");
    });
  });*/
        /* TODO makit run
  it("should add initialized new throw", function() {
          // TODO add test event emitted
    var meta;

    // Get initial balances of first and second account.
    var account_one = accounts[0];
    var account_two = accounts[1];


    var initThrowVal = 2;// wei;
    var minBid = 1;// wei;

    return Lotterie.deployed().then(function(instance) {
      manager = instance;
      return manager.initThrow(minBid);//,accounts[0],initThrowVal);
    }).then(function() {
            // TODO raw transact an write a js throw deserializer
      return manager.allthrows.call(0);
    }).then(function(thr) {
      assert.equal(thr.totalBidValue, initThrowVal + minBid, "Incorrect initial bid value");
    });
  });*/


  it("should add params", async function() {
    var account_owner = accounts[0];
    var account_contract_author = accounts[1];
    var lotterie = await Lotterie.new(account_contract_author);
    var nbWinners = 5;
    var nbWinnerMinRatio = 50; // less than 10 participant we apply ratio 
    var nbparam = await lotterie.getWiningParamsCount.call();
    assert.equal(nbparam, 0);
    var d = await lotterie.addWinningParams.estimateGas(nbWinners,nbWinnerMinRatio,lotterieLib.winningDistribution.Equal);
    // fix gas cost test
    var res = await lotterie.addWinningParams(nbWinners,nbWinnerMinRatio,lotterieLib.winningDistribution.Equal,{gas : d});
    assert.equal(res.error, null);
    var nbparam = await lotterie.getWiningParamsCount.call();
    assert.equal(nbparam, 1);
    // fix gas cost test
    var d2 = await lotterie.addWinningParams.estimateGas(nbWinners,nbWinnerMinRatio,lotterieLib.winningDistribution.Equal);
    assert(d2 < d);
    var res = await lotterie.addWinningParams(nbWinners,nbWinnerMinRatio,lotterieLib.winningDistribution.Equal,{gas : d2});
    //var res = await lotterie.addWinningParams(nbWinners,nbWinnerMinRatio,lotterieLib.winningDistribution.Equal);
    assert.equal(res.error, null);
    // value check
    res = lotterieLib.newWinningParams(await lotterie.getWinningParams(0));
    assert.equal(res.nbWinners, nbWinners);
    assert.equal(res.nbWinnerMinRatio, nbWinnerMinRatio);
  });


  it("should withdraw for some account", async function() {
    var account_owner = accounts[0];
    var account_contract_author = accounts[1];
    var lotterie = await Lotterie.new(account_contract_author, { from : account_owner });
    var account_contract_dapp = accounts[2];
    var account_thrower = accounts[3];
    var account_bidder = accounts[4];

    await configuration(lotterie,account_contract_dapp,conf1);

    var ownerMargin = 2**32 / 100; // ~1%
    var ownerExpected = conf1.biddingTreshold * 1 / 100;
    var authorContractMargin = 2**32 / 50; // ~2%
    var authorContractExpected = conf1.biddingTreshold * 2 / 100;
    var authorDappMargin = 2**32 / 25; // ~4%
    var authorDappExpected = conf1.biddingTreshold * 4 / 100;
    var throwerMargin = 2**32 / 33; // ~3%
    var throwerExpected = conf1.biddingTreshold / 33;

    var withinExpectedBound = function (val,target) {
      return val < target * 1.01 && val > target * 0.99;
    }

    var res = await lotterie.initThrow (
     0,
     ownerMargin,
     authorContractMargin,
     authorDappMargin,
     throwerMargin,
     { from : account_thrower, value : 0 }
    );


    var phase = await lotterie.getPhase.call(0);
    assert.equal(phase, lotterieLib.phases.Bidding);
    // cannot withdraw in bid phase
    assertRevert(lotterie.withdrawOwner(0, { from : account_owner }));
    // switch phase by reaching conf 1 maxValue treshold
    await lotterie.bid(0,0, { from : account_bidder, value : conf1.biddingTreshold });
    var thr = lotterieLib.newThrow(await lotterie.getThrow.call(0));
    assert.equal(thr.paramsId,0);
    assert.equal(thr.totalBidValue,conf1.biddingTreshold);
    assert.equal(thr.numberOfBid,1);

    var phase = await lotterie.getPhase.call(0);
    assert.equal(phase, lotterieLib.phases.Participation);

    var ac = await lotterie.authorContract();
    assert.equal(account_contract_author, ac);
    // revert : var d = await lotterie.withdrawContractAuthor.estimateGas(0);
    var gas = 150000;
    var balanceBefore = web3.eth.getBalance(account_contract_author);
    var result = await lotterie.withdrawContractAuthor(0, { from : account_contract_author, gas : gas });
    var balanceAfter = web3.eth.getBalance(account_contract_author);
    truffleAssert.eventEmitted(result, 'Withdraw',  function(ev) {
      return ev.to === account_contract_author && withinExpectedBound(ev.amount,authorContractExpected);
    });



    balanceBefore = web3.eth.getBalance(account_owner);
    result = await lotterie.withdrawOwner(0, { from : account_owner, gas : gas });
    truffleAssert.eventEmitted(result, 'Withdraw',  function(ev) {
      return ev.to === account_owner && withinExpectedBound(ev.amount,ownerExpected);
    });

    result = await lotterie.withdrawOwner(0, { from : account_owner, gas : gas });
    truffleAssert.eventNotEmitted(result, 'Withdraw',  function(ev) {
       return ev.to === account_owner;
    });


    balanceAfter = web3.eth.getBalance(account_owner);
//    assert.equal(balanceAfter - balanceBefore, (conf1.biddingTreshold * 1 / 100) - gas);
//withdrawThrower
    balanceBefore = web3.eth.getBalance(account_thrower);
    result = await lotterie.withdrawThrower(0, { from : account_thrower, gas : gas });
    truffleAssert.eventEmitted(result, 'Withdraw',  function(ev) {
      return ev.to === account_thrower && withinExpectedBound(ev.amount,throwerExpected);
    });


    result = await lotterie.withdrawThrower(0, { from : account_thrower, gas : gas });
    truffleAssert.eventNotEmitted(result, 'Withdraw',  function(ev) {
       return ev.to === account_thrower;
    });


    balanceAfter = web3.eth.getBalance(account_thrower);
//    assert.equal(balanceAfter - balanceBefore, (conf1.biddingTreshold * 3 / 100) - gas);
    balanceBefore = web3.eth.getBalance(account_contract_dapp);
    result = await lotterie.withdrawDappAuthor(0, { from : account_contract_dapp, gas : gas });
    result = await lotterie.withdrawDappAuthor(0, { from : account_contract_dapp, gas : gas });
    balanceAfter = web3.eth.getBalance(account_contract_dapp);
//    assert.equal(balanceAfter - balanceBefore, (conf1.biddingTreshold * 4 / 100) - gas);
    var z = await lotterie.withdrawDappAuthor.call(0, { from : account_contract_dapp });
    assert.equal(z, 0);
    balanceBefore = web3.eth.getBalance(account_contract_dapp);
    await lotterie.withdrawDappAuthor(0, { from : account_contract_dapp, gas : gas });
    balanceAfter = web3.eth.getBalance(account_contract_dapp);
    //assert.equal(balanceBefore - balanceAfter, gas);


    assert.equal(res.error, null);
  });

  it("should withdraw all", async function() {
    var account_owner = accounts[0];
    var account_contract_author = accounts[1];
    var lotterie = await Lotterie.new(account_contract_author, { from : account_owner });
    var account_contract_dapp = accounts[2];
    var account_thrower = accounts[3];
    var account_bidder = accounts[4];

    await configuration(lotterie,account_contract_dapp,conf1);

    var ownerMargin = 0;
    var authorContractMargin = 2**32 -1;
    var authorContractExpected = conf1.biddingTreshold;
    var authorDappMargin = 0;
    var throwerMargin = 0;

    var res = await lotterie.initThrow (
     0,
     ownerMargin,
     authorContractMargin,
     authorDappMargin,
     throwerMargin,
     { from : account_thrower, value : 0 }
    );

    await lotterie.bid(0,0, { from : account_bidder, value : conf1.biddingTreshold });

    var gas = 150000;
    var result = await lotterie.withdrawContractAuthor(0, { from : account_contract_author, gas : gas });
    truffleAssert.eventEmitted(result, 'Withdraw',  function(ev) {
      return ev.to === account_contract_author && ev.amount == authorContractExpected;
    });
  });

  it("should not allow margin over 100%", async function() {
    var account_one = accounts[0];
    var account_contract_author = accounts[1];
    var lotterie = await Lotterie.new(account_contract_author);
    var account_contract_dapp = accounts[2];

    await configuration(lotterie,account_contract_dapp,conf1);

    var ownerMargin = 2**32 / 4; // ~25%
    var authorContractMargin = 2**32 / 3; // ~33%
    var authorDappMargin = 2**32 / 4; // ~25%
    var throwerMargin = 2**32 / 3; // ~33%
    assertRevert(lotterie.initThrow (
     0,
     ownerMargin,
     authorContractMargin,
     authorDappMargin,
     throwerMargin
    ));
  });

  it("calculate correct commitments", async function() {
    var lotterie = await Lotterie.new(accounts[1]);
    var checkit = async function(hexval) {
      var jscalc = lotterieLib.calcCommitment(hexval);
      var chaincalc = await lotterie.checkCommitment.call(hexval);
      assert.equal(lotterieLib.padHexInt(web3.toHex(chaincalc)),jscalc);
    };
    checkit("0x0");
    checkit("0x1ab");
    checkit("0x12344");
    checkit("0x123446b1341");
    checkit("0xb123446b1347859720721");
    checkit("0x5cee5c91812f9cf35e8b05c524993810a78f25fd7e87ae61008433d43e27bb0");
  });
  it("calculate correct scores", async function() {
    var lotterie = await Lotterie.new(accounts[1]);
    var checkit = async function(hexval1,hexval2) {
      var jscalc = lotterieLib.calcScore(hexval1,hexval2);
      var chaincalc = await lotterie.checkScore.call(hexval1,hexval2);
      assert.equal(lotterieLib.padHexInt(web3.toHex(chaincalc)),jscalc);
    };
    checkit("0x0","0x0");
    checkit("0x1ab","0x0");
    checkit("0x123446b1341","0x5cee5c91812f9cf35e8b05c524993810a78f25fd7e87ae61008433d43e27bb0");
  });


  // TODO test a lot more than the name : split it using scenario1 functions
  it("switch phases on user tresholds", async function() {
    var myConf = Object.assign({}, conf1);
    myConf.maxParticipant = 5;
    //myConf.nbWinners = 4;
    myConf.nbWinnerMinRatio = 80; // 4 winner (ratio applying)
    // warn need to pass 4 cashout during those 3 secs, might be enough on most testing confs
    myConf.cashoutEndValue = 3;
    myConf.throwEndValue = 5;
    var account_owner = accounts[0];
    var account_contract_author = accounts[1];
    var lotterie = await Lotterie.new(account_contract_author, { from : account_owner });
    var account_contract_dapp = accounts[2];
    var account_bidder1 = accounts[3];
    var account_bidder2 = accounts[4];
    var account_bidder3 = accounts[5];

    var accountParts = [];
    await configuration(lotterie,account_contract_dapp,myConf);
    await lotterie.initThrow (0,0,0,0,0);
    await lotterie.bid("0x0",lotterieLib.calcCommitment('0x0'), { from : account_bidder1 , value : myConf.minBidValue });
    accountParts.push(account_bidder1);
    await lotterie.bid(0,lotterieLib.calcCommitment('0x1111111111111111111111111111111111'), { from : account_bidder2 , value : myConf.minBidValue });
    accountParts.push(account_bidder2);
    await lotterie.bid(0,lotterieLib.calcCommitment('0x2'), { from : account_bidder2 , value : myConf.minBidValue });
    accountParts.push(account_bidder2);
    await lotterie.bid(0,lotterieLib.calcCommitment('0x3'), { from : account_bidder2 , value : myConf.minBidValue });
    accountParts.push(account_bidder2);
    assert.equal(await lotterie.getPhase.call(0), lotterieLib.phases.Bidding);
    await lotterie.bid(0,lotterieLib.calcCommitment('0x4'), { from : account_bidder3 , value : myConf.minBidValue });
    accountParts.push(account_bidder3);
    assert.equal(await lotterie.getPhase.call(0), lotterieLib.phases.Participation);
    // reveal
    var thr = lotterieLib.newThrow(await lotterie.getThrow.call(0));
    var currentSeed = thr.currentSeed;
    var thrBlock = thr.blockNumber;


    assertRevert(lotterie.revealParticipation(0,1));
    thr = lotterieLib.newThrow(await lotterie.getThrow.call(0));
    assert.equal(web3.toHex(currentSeed), web3.toHex(thr.currentSeed));
    currentSeed = thr.currentSeed;
    var res = await lotterie.challengeParticipation.call(0,0);
    assert.equal(web3.toHex(res[0]),web3.toHex(res[1]));
    await lotterie.revealParticipation(0,0);
    thr = lotterieLib.newThrow(await lotterie.getThrow.call(0));
    assert.notEqual(web3.toHex(currentSeed), web3.toHex(thr.currentSeed));
    currentSeed = thr.currentSeed;

    assertRevert(lotterie.revealParticipation(0,0));
    await lotterie.revealParticipation(4,4);
    thr = lotterieLib.newThrow(await lotterie.getThrow.call(0));
    assert.notEqual(web3.toHex(currentSeed), web3.toHex(thr.currentSeed));
    currentSeed = thr.currentSeed;

    await lotterie.revealParticipation(3,3);
    thr = lotterieLib.newThrow(await lotterie.getThrow.call(0));
    assert.notEqual(web3.toHex(currentSeed), web3.toHex(thr.currentSeed));
    currentSeed = thr.currentSeed;

    await lotterie.revealParticipation(1,'0x1111111111111111111111111111111111');
    thr = lotterieLib.newThrow(await lotterie.getThrow.call(0));
    assert.notEqual(web3.toHex(currentSeed), web3.toHex(thr.currentSeed));
    currentSeed = thr.currentSeed;

    assert.equal(await lotterie.getPhase.call(0), lotterieLib.phases.Participation);
    await lotterie.revealParticipation(2,2);
    thr = lotterieLib.newThrow(await lotterie.getThrow.call(0));
    assert.notEqual(web3.toHex(currentSeed), web3.toHex(thr[1]));
    currentSeed = thr.currentSeed;
    assert.equal(thr.numberOfRevealParticipation, 5);
    assert.equal(thr.numberOfBid, 5);
    assert.equal(await lotterie.getPhase.call(0), lotterieLib.phases.Cashout);
    const finalSeed = web3.toHex(currentSeed);
    // get all score warning do not use this (iterate on all participation of all throws)
    var nbParts = await lotterie.getParticipationsCount.call();
    var posNb0_1 = nbParts;
    assert.equal(posNb0_1,5);
    var posNb0_1 = 5;
    var scoreNb0 = null;
    var scoreNb0Ref = null;
    var part0Ref = null;
    var hidden0Ref = null;
    var last = null;
    var lastScore = null;
    for (var i=0; i < 5; ++i) {
      var partelts = await lotterie.getParticipation.call(i);
      // right throwid
      if (partelts[0] == 0) {
        assert.equal(partelts[3], lotterieLib.participationStates.Revealed);
        var mySeed = web3.toHex(partelts[1]);
        var score = lotterieLib.calcScore(finalSeed,mySeed);
        if (scoreNb0 == null) {
          scoreNb0 = score;
          hidden0Ref = mySeed;
          scoreNb0Ref = score;
          part0Ref = i;
          last = i;
          lastScore = score;
        } else {
        // warning for comparison to run as expected we need to pad the hexstring at same size
        // plus we do it for first participation so it is considered better on equality
        if (scoreNb0 >= score) {
          posNb0_1 -= 1;
        }
          if (lastScore >= score) {
            last = i;
            lastScore = score;
          }
        }
      }

    }

    // get postition by heavy cost call (still less costy thant previous method
    var posNb0_2 = await lotterie.checkPositionHeavyCost.call(0);
    assert.equal(posNb0_1,posNb0_2);
    // TODO get position by reading logs : should be the only method use because it respects throwId
    // TODO with 1.0 web 3 uset getPastEvents
    lotterie.Revealed(
      {
        participationId : 0
      },
      {
      fromBlock: thrBlock,
      toBlock: 'latest'
      }
    ).get(function(error,events){
      assert.equal(events.length, 5);
      var scoreNb0 = null;
      var posNb0_3 = 5;
      for (var i=0; i < 5; ++i) {
        evt = events[i];
        var mySeed = web3.toHex(evt.args.hiddenSeed);
              assert.notEqual(events[0].args.hiddenSeed,events[1].args.hiddenSeed);
        var score = lotterieLib.calcScore(finalSeed,mySeed);
        if (scoreNb0 == null) {
          scoreNb0 = score;
          assert.equal(part0Ref, evt.args.participationId);
          assert.equal(hidden0Ref, mySeed);
          assert.equal(scoreNb0Ref, scoreNb0);
        } else {
          // warning cf previous method
          if (scoreNb0 >= score) {
            posNb0_3 -= 1;
          }
        }
      }
      assert.equal(posNb0_3,posNb0_1);
    });

    var ix = await lotterie.currentIxAmongWinners.call(last);
    assert.equal(ix,0);
    // first last insert to try to get something (start possible ix at 0)
    await lotterie.cashOut(last, ix);
    // do not cashout twice
    assertRevert(lotterie.cashOut(last, ix + 1));
    assert.equal(await lotterie.currentIxAmongWinners.call(last),1);
    // iterate on participation
    for (var i = 0; i < 5; ++i) {
      if (i != last) {
        // for test only
        var ix = await lotterie.currentIxAmongWinners.call(i);
        if (ix == 2) {
          // check ok with insertion in between calculation (multiple cashout in a block)
          ix == 0;
        }
        await lotterie.cashOut(i, ix);
//        assert.notEqual(await lotterie.currentIxAmongWinners.call(last),0);
//        assert.notEqual(await lotterie.currentIxAmongWinners.call(last),1);
      }
    }
    var nbwin = await lotterie.nbWinners(0);
    assert.equal(nbwin,4);
    assert.equal(web3.toHex(await lotterie.linkedWinnersLength.call(0)),4);
    // TODO additional user trying to insert (in a non salt conf it will be easier)
    await dirtyPause(3);
    assert.equal(await lotterie.getPhase.call(0), lotterieLib.phases.End);
    var lastScore = null;
    for (var i = 0; i < nbwin; ++i) {
      var w = lotterieLib.newWinnerArray(await lotterie.getWinner(0, i));
      assert.equal(w.withdrawned, false);
      // TODO return rate
//      assert.isLower(0,w.totalPositionWin);
      //assert.notEqual(w.participationId, last);
      var itScore = lotterieLib.padHexInt(web3.toHex(w.score));
      if (lastScore == null) {
        lastScore = itScore
      } else {
        // no testing for eq test as marginal
        var lessOrEq = itScore <= lastScore;
        if (!lessOrEq) {
                assert.equal(itScore,lastScore);
        }
        assert(lessOrEq);

        lastScore = itScore
      }
    }
    assert.equal(0,await lotterie.positionAtPhaseEnd(last));
    // register win and withdraw
    for (var i = 0; i < 5; ++i) {
      if (i == last) {
        assertRevert(lotterie.withdrawWin(0,i, { from : accountParts[i] }));
      } else {
        // not for wrong user (avoid dead account)
        assertRevert(lotterie.withdrawWin(0,i, { from : account_contract_dapp }));
        var result = await lotterie.withdrawWin(0,i, { from : accountParts[i] });
        truffleAssert.eventEmitted(result, 'Win',  function(ev) {
          var result = ev.throwId == 0 && ev.participationId == i;
          if (result) {
            assert.equal(ev.throwId, 0);
            assert.isAbove(ev.position, 0);
            assert.isAbove(ev.amount, 0);
            assert.equal(ev.participationId, i);
            assert.equal(ev.winner, accountParts[i]);
          }
          return result;
        });


        assertRevert(lotterie.withdrawWin(0,i, { from : accountParts[i] }));
      }

    }
    // cannot get winner out of range
    assertRevert(lotterie.getWinner(0,nbwin));
    await dirtyPause(5);
    assert.equal(await lotterie.getPhase.call(0), lotterieLib.phases.Off);
    var thr = lotterieLib.newThrow(await lotterie.getThrow.call(0));
    assert.equal(web3.toHex(thr.totalBidValue), web3.toHex(thr.totalClaimedValue));
    assertRevert(lotterie.emptyOffThrow(0,{ from : account_contract_dapp }));
    await lotterie.emptyOffThrow(0,{ from : account_owner });
  });

});

async function assertRevert(pr) {
  try {
    await pr;
    assert(false, "should not succeed");
  } catch(e) {
    assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/,"wrong exception");
  }
}
async function dirtyPause(nbsecs) {
  var currentTime = new Date().getTime();
  while (currentTime + nbsecs * 1000 >= new Date().getTime()) { 
    await new Promise(function (resolve) { setTimeout(resolve,100) });
  }
}
