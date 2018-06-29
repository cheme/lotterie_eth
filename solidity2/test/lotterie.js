
// TODO template in a before all!!!

import lotterieLib from '../index.js';

const w3abi = require ('web3-eth-abi');
const truffleAssert = require('truffle-assertions');

var Lotterie = artifacts.require("./Lotterie.sol");
var LotterieThrow = artifacts.require("./LotterieThrowEther.sol");
var LotterieThrow223 = artifacts.require("./LotterieThrow223.sol");
var LotterieThrowTemplate223 = artifacts.require("./LotterieThrow223.sol");
var LotterieThrowTemplate = artifacts.require("./LotterieThrowEther.sol");

var ERC223Test = artifacts.require("./ERC223Test.sol");
var ERC223ForTruffle = artifacts.require("./ERC223ForTruffle.sol");

var LotterieConf = artifacts.require("./LotterieConf.sol");
// lotterilib calc commitment with web3 0.2
function calcCommitment(hexstring) {
    if (hexstring.startsWith('0x')) {
      hexstring = hexstring.substr(2);
    }
    return web3.sha3(hexstring.padStart(64,'0'),{encoding:'hex'});
  }

// TODO move to its own js lif
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
      c.dosalt,
      account_contract_dapp,
      c.minBidValue,
      c.biddingTreshold,
      c.maxParticipant
    );
    assert.equal(res.error, null);
  }


  var totalCostLog = 0;

contract('Lotterie', function(accounts) {
   beforeEach(function() {
     totalCostLog = 0;
   });
   afterEach(function() {
     console.log("Logged gas cost total : ", totalCostLog);
   });

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


  dis("should add params", async function() {
    var account_owner = accounts[0];
    var account_contract_author = accounts[1];
    var template = await LotterieThrowTemplate.new();
    var template223 = await LotterieThrowTemplate223.new();
    var lotterie = await Lotterie.new(account_contract_author, template.address, template223.address);
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
    nbparam = await lotterie.getWiningParamsCount.call();
    assert.equal(nbparam, 2);
    // value check
    console.error(await lotterie.getWinningParams.call(0));
    console.error(await lotterie.getWinningParams.call(1));
    res = lotterieLib.newWinningParams(await lotterie.getWinningParams.call(0));
    assert.equal(web3.toHex(res.nbWinnerMinRatio), web3.toHex(nbWinnerMinRatio));
    assert.equal(web3.toHex(res.nbWinners), web3.toHex(nbWinners));
  });


  dis("should withdraw for some account", async function() {
    var account_owner = accounts[0];
    var account_contract_author = accounts[1];
    var template = await LotterieThrowTemplate.new();
    var template223 = await LotterieThrowTemplate223.new();
    var lotterie = await Lotterie.new(account_contract_author, template.address, template223.address, { from : account_owner });
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

    var result = await lotterie.initThrow (
     0,
     0,
     ownerMargin,
     authorContractMargin,
     authorDappMargin,
     throwerMargin,
     { from : account_thrower, value : 0 }
    );

    truffleAssert.eventEmitted(result, 'NewThrow',  function(ev) {
      return true;
    });

    var ltax = await lotterie.getThrowAddress.call(0);

    assert.equal(ltax,result.logs[0].args.throwAddress)

    var lotteriethrow = LotterieThrow.at(ltax);

    var phase = await lotteriethrow.getPhase.call();
    assert.equal(phase, lotterieLib.phases.Bidding);
    // cannot withdraw in bid phase
    assertRevert(lotteriethrow.withdrawOwner({ from : account_owner }));
    // switch phase by reaching conf 1 maxValue treshold
    await lotteriethrow.bid(0, { from : account_bidder, value : conf1.biddingTreshold });
    var thr = lotterieLib.newThrow(await lotteriethrow.getThrow.call());
    assert.equal(thr.paramsId,0);
    assert.equal(thr.totalBidValue,conf1.biddingTreshold);
    assert.equal(thr.numberOfBid,1);

    var phase = await lotteriethrow.getPhase.call();
    assert.equal(phase, lotterieLib.phases.Participation);

    var ac = await lotterie.authorContract();
    assert.equal(account_contract_author, ac);
    // revert : var d = await lotterie.withdrawContractAuthor.estimateGas(0);
    var gas = 150000;
    var balanceBefore = web3.eth.getBalance(account_contract_author);
    var result = await lotteriethrow.withdrawContractAuthor({ from : account_contract_author, gas : gas });
    var balanceAfter = web3.eth.getBalance(account_contract_author);
    truffleAssert.eventEmitted(result, 'Withdraw',  function(ev) {
      return ev.to === account_contract_author && withinExpectedBound(ev.amount,authorContractExpected);
    });



    balanceBefore = web3.eth.getBalance(account_owner);
    result = await lotteriethrow.withdrawOwner({ from : account_owner });
    truffleAssert.eventEmitted(result, 'Withdraw',  function(ev) {
      return ev.to === account_owner && withinExpectedBound(ev.amount,ownerExpected);
    });

    result = await lotteriethrow.withdrawOwner({ from : account_owner, gas : gas });
    truffleAssert.eventNotEmitted(result, 'Withdraw',  function(ev) {
       return ev.to === account_owner;
    });


    balanceAfter = web3.eth.getBalance(account_owner);
//    assert.equal(balanceAfter - balanceBefore, (conf1.biddingTreshold * 1 / 100) - gas);
//withdrawThrower
    balanceBefore = web3.eth.getBalance(account_thrower);
    result = await lotteriethrow.withdrawThrower({ from : account_thrower, gas : gas });
    truffleAssert.eventEmitted(result, 'Withdraw',  function(ev) {
      return ev.to === account_thrower && withinExpectedBound(ev.amount,throwerExpected);
    });


    result = await lotteriethrow.withdrawThrower({ from : account_thrower, gas : gas });
    truffleAssert.eventNotEmitted(result, 'Withdraw',  function(ev) {
       return ev.to === account_thrower;
    });


    balanceAfter = web3.eth.getBalance(account_thrower);
//    assert.equal(balanceAfter - balanceBefore, (conf1.biddingTreshold * 3 / 100) - gas);
    balanceBefore = web3.eth.getBalance(account_contract_dapp);
    result = await lotteriethrow.withdrawDappAuthor({ from : account_contract_dapp, gas : gas });
    result = await lotteriethrow.withdrawDappAuthor({ from : account_contract_dapp, gas : gas });
    balanceAfter = web3.eth.getBalance(account_contract_dapp);
//    assert.equal(balanceAfter - balanceBefore, (conf1.biddingTreshold * 4 / 100) - gas);
    var z = await lotteriethrow.withdrawDappAuthor.call({ from : account_contract_dapp });
    assert.equal(z, 0);
    balanceBefore = web3.eth.getBalance(account_contract_dapp);
    await lotteriethrow.withdrawDappAuthor({ from : account_contract_dapp, gas : gas });
    balanceAfter = web3.eth.getBalance(account_contract_dapp);
    //assert.equal(balanceBefore - balanceAfter, gas);


  });

  dis("should withdraw all", async function() {
    var account_owner = accounts[0];
    var account_contract_author = accounts[1];
    var template = await LotterieThrowTemplate.new();
    var template223 = await LotterieThrowTemplate223.new();
    var lotterie = await Lotterie.new(account_contract_author, template.address, template223.address, { from : account_owner });
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
     0,
     ownerMargin,
     authorContractMargin,
     authorDappMargin,
     throwerMargin,
     { from : account_thrower, value : 0 }
    );

    var ltax = await lotterie.getThrowAddress.call(0);
    var lotteriethrow = LotterieThrow.at(ltax);

    await lotteriethrow.bid(0, { from : account_bidder, value : conf1.biddingTreshold });

    var gas = 150000;
    var result = await lotteriethrow.withdrawContractAuthor({ from : account_contract_author, gas : gas });
    truffleAssert.eventEmitted(result, 'Withdraw',  function(ev) {
      return ev.to === account_contract_author && ev.amount == authorContractExpected;
    });
  });

  dis("should not allow margin over 100%", async function() {
    var account_one = accounts[0];
    var account_contract_author = accounts[1];
    var template = await LotterieThrowTemplate.new();
    var template223 = await LotterieThrowTemplate223.new();
    var lotterie = await Lotterie.new(account_contract_author, template.address, template223.address);
 
    var account_contract_dapp = accounts[2];

    await configuration(lotterie,account_contract_dapp,conf1);

    var ownerMargin = 2**32 / 4; // ~25%
    var authorContractMargin = 2**32 / 3; // ~33%
    var authorDappMargin = 2**32 / 4; // ~25%
    var throwerMargin = 2**32 / 3; // ~33%
    assertRevert(lotterie.initThrow (
     0,
     0,
     ownerMargin,
     authorContractMargin,
     authorDappMargin,
     throwerMargin
    ));
  });

  dis("calculate correct commitments", async function() {
    var template = await LotterieThrowTemplate.new();
    var template223 = await LotterieThrowTemplate223.new();
    var lotterie = await Lotterie.new(accounts[1],template.address,template223.address);
    var checkit = async function(hexval) {
      var jscalc = calcCommitment(hexval);
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

  dis("calculate correct scores", async function() {
    var template = await LotterieThrowTemplate.new();
    var template223 = await LotterieThrowTemplate223.new();
    var lotterie = await Lotterie.new(accounts[1],template.address,template223.address);
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
  dis("switch phases on user tresholds", async function() {
  //dis("switch phases on user tresholds", async function() {
      
    var myConf = Object.assign({}, conf1);
    myConf.maxParticipant = 5;
    //myConf.nbWinners = 4;
    myConf.nbWinnerMinRatio = 80; // 4 winner (ratio applying)
    // warn need to pass 4 cashout during those 3 secs, might be enough on most testing confs
    myConf.cashoutEndValue = 3;
    myConf.throwEndValue = 5;
    var account_owner = accounts[0];
    var account_contract_author = accounts[1];
    var template = await LotterieThrowTemplate.new();
    var template223 = await LotterieThrowTemplate223.new();
    var lotterie = await Lotterie.new(account_contract_author, template.address, template223.address, { from : account_owner });
    console.log("lotterie add:" + lotterie.address);
    var account_contract_dapp = accounts[2];
    var account_bidder1 = accounts[3];
    var account_bidder2 = accounts[4];
    var account_bidder3 = accounts[5];

    var accountParts = [];
    await configuration(lotterie,account_contract_dapp,myConf);
    await tr_log( lotterie.initThrow (0,0,0,0,0,0, {value:10000}), true);

    var ltax = await lotterie.getThrowAddress.call(0);
    var lotteriethrow = LotterieThrow.at(ltax);

    await tr_log( lotteriethrow.bid(calcCommitment('0x0'), { from : account_bidder1 , value : myConf.minBidValue }), true );
    accountParts.push(account_bidder1);
    await tr_log( lotteriethrow.bid(calcCommitment('0x1111111111111111111111111111111111'), { from : account_bidder2 , value : myConf.minBidValue }), true);
    accountParts.push(account_bidder2);
    await tr_log( lotteriethrow.bid(calcCommitment('0x2'), { from : account_bidder2 , value : myConf.minBidValue }), true );
    accountParts.push(account_bidder2);
    await tr_log( lotteriethrow.bid(calcCommitment('0x3'), { from : account_bidder2 , value : myConf.minBidValue }), true );
    accountParts.push(account_bidder2);
    assert.equal(await lotteriethrow.getPhase.call(), lotterieLib.phases.Bidding);
    await tr_log( lotteriethrow.bid(calcCommitment('0x4'), { from : account_bidder3 , value : myConf.minBidValue }), true );
    accountParts.push(account_bidder3);
    assert.equal(await lotteriethrow.getPhase.call(), lotterieLib.phases.Participation);
    // reveal
    var thr = lotterieLib.newThrow(await lotteriethrow.getThrow.call());
    var currentSeed = thr.currentSeed;
    var thrBlock = thr.blockNumber;

    assertRevert(lotteriethrow.revealParticipation(0,1));
    thr = lotterieLib.newThrow(await lotteriethrow.getThrow.call());
    assert.equal(web3.toHex(currentSeed), web3.toHex(thr.currentSeed));
    currentSeed = thr.currentSeed;
    var res = await lotteriethrow.challengeParticipation.call(0,0);
    assert.equal(web3.toHex(res[0]),web3.toHex(res[1]));
    await tr_log(lotteriethrow.revealParticipation(0,0), true);
    thr = lotterieLib.newThrow(await lotteriethrow.getThrow.call());
    assert.notEqual(web3.toHex(currentSeed), web3.toHex(thr.currentSeed));
    currentSeed = thr.currentSeed;

    assertRevert(lotteriethrow.revealParticipation(0,0));
    await tr_log( lotteriethrow.revealParticipation(4,4), true);
    thr = lotterieLib.newThrow(await lotteriethrow.getThrow.call());
    assert.notEqual(web3.toHex(currentSeed), web3.toHex(thr.currentSeed));
    currentSeed = thr.currentSeed;

    await tr_log( lotteriethrow.revealParticipation(3,3), true);
    thr = lotterieLib.newThrow(await lotteriethrow.getThrow.call());
    assert.notEqual(web3.toHex(currentSeed), web3.toHex(thr.currentSeed));
    currentSeed = thr.currentSeed;

    await tr_log( lotteriethrow.revealParticipation(1,'0x1111111111111111111111111111111111'), true);
    thr = lotterieLib.newThrow(await lotteriethrow.getThrow.call());
    assert.notEqual(web3.toHex(currentSeed), web3.toHex(thr.currentSeed));
    currentSeed = thr.currentSeed;

    assert.equal(await lotteriethrow.getPhase.call(), lotterieLib.phases.Participation);
    await tr_log( lotteriethrow.revealParticipation(2,2), true);
    thr = lotterieLib.newThrow(await lotteriethrow.getThrow.call());
    assert.notEqual(web3.toHex(currentSeed), web3.toHex(thr[1]));
    currentSeed = thr.currentSeed;
    assert.equal(thr.numberOfRevealParticipation, 5);
    assert.equal(thr.numberOfBid, 5);
    assert.equal(await lotteriethrow.getPhase.call(), lotterieLib.phases.Cashout);
    const finalSeed = web3.toHex(currentSeed);
    // get all score warning do not use this (iterate on all participation of all throws)
    var nbParts = await lotteriethrow.getParticipationsCount.call();
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
      var partelts = await lotteriethrow.getParticipation.call(i);
      // right throwid
        assert.equal(partelts[2], lotterieLib.participationStates.Revealed);
        var mySeed = web3.toHex(partelts[0]);
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

    // get postition by heavy cost call (still less costy thant previous method
    var posNb0_2 = await lotteriethrow.checkPositionHeavyCost.call(0);
    assert.equal(posNb0_1,posNb0_2);
    // TODO get position by reading logs : should be the only method use because it respects throwId
    // TODO with 1.0 web 3 uset getPastEvents
    lotteriethrow.Revealed(
      {
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
        var evt = events[i];
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

    var ix = await lotteriethrow.currentIxAmongWinners.call(last);
    assert.equal(ix,0);
    // first last insert to try to get something (start possible ix at 0)
    await tr_log(lotteriethrow.cashOut(last, ix), true);
    var nbwin = await lotteriethrow.nbWinners.call();
    assert.equal(nbwin,1);
    // do not cashout twice
    assertRevert(lotteriethrow.cashOut(last, ix + 1));
    ix = await lotteriethrow.currentIxAmongWinners.call(last);
    assert.equal(ix,1);
    // iterate on participation
    for (var i = 0; i < 5; ++i) {
      if (i != last) {
        // for test only
        var ix = await lotteriethrow.currentIxAmongWinners.call(i);
        if (ix == 2) {
          // check ok with insertion in between calculation (multiple cashout in a block)
          ix == 0;
        }
        await tr_log( lotteriethrow.cashOut(i, ix), true);
//        assert.notEqual(await lotterie.currentIxAmongWinners.call(last),0);
//        assert.notEqual(await lotterie.currentIxAmongWinners.call(last),1);
      }
    }
    var nbwin = await lotteriethrow.nbWinners.call();
    assert.equal(nbwin,4);
    assert.equal(web3.toHex(await lotteriethrow.linkedWinnersLength.call()),4);
    // TODO additional user trying to insert (in a non salt conf it will be easier)
    await dirtyPause(3);
    assert.equal(await lotteriethrow.getPhase.call(), lotterieLib.phases.End);
    var lastScore = null;
    for (var i = 0; i < nbwin; ++i) {
      var w = lotterieLib.newWinnerArray(await lotteriethrow.getWinner.call(i));
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
    assert.equal(0,await lotteriethrow.positionAtPhaseEnd.call(last));
    // register win and withdraw
    for (var i = 0; i < 5; ++i) {
      if (i == last) {
        assertRevert(lotteriethrow.withdrawWin(i, { from : accountParts[i] }));
      } else {
        // not for wrong user (avoid dead account)
        assertRevert(lotteriethrow.withdrawWin(i, { from : account_contract_dapp }));
        var result = await lotteriethrow.withdrawWin(i, { from : accountParts[i] });
        tr_log2(result, true);
        truffleAssert.eventEmitted(result, 'Win',  function(ev) {
          var result = ev.participationId == i;
          if (result) {
            assert.isAbove(ev.position, 0);
            assert.isAbove(ev.amount, 0);
            assert.equal(ev.participationId, i);
            assert.equal(ev.winner, accountParts[i]);
          }
          return result;
        });


        assertRevert(lotteriethrow.withdrawWin(i, { from : accountParts[i] }));
      }

    }
    // cannot get winner out of range
    assertRevert(lotteriethrow.getWinner(nbwin));
    await dirtyPause(5);
    assert.equal(await lotteriethrow.getPhase.call(), lotterieLib.phases.Off);
    var thr = lotterieLib.newThrow(await lotteriethrow.getThrow.call());
    assert.equal(web3.toHex(thr.totalBidValue), web3.toHex(thr.totalClaimedValue));
    assertRevert(lotteriethrow.emptyOffThrow({ from : account_contract_dapp }));
//    await tr_log( lotterie.recalculateState(0,lotterieLib.phases.Off), true);
    await tr_log( lotteriethrow.emptyOffThrow({ from : account_owner }), true);
  });

  it("supports erc223", async function() {
  //dis("switch phases on user tresholds", async function() {
      
    var myConf = Object.assign({}, conf1);
    myConf.maxParticipant = 5;
    //myConf.nbWinners = 4;
    myConf.nbWinnerMinRatio = 80; // 4 winner (ratio applying)
    // warn need to pass 4 cashout during those 3 secs, might be enough on most testing confs
    myConf.cashoutEndValue = 3;
    myConf.throwEndValue = 5;
    var account_owner = accounts[0];
    var account_contract_author = accounts[1];
    var template = await LotterieThrowTemplate.new();
    var template223 = await LotterieThrowTemplate223.new();
    var lotterie = await Lotterie.new(account_contract_author, template.address, template223.address, { from : account_owner });
    console.log("lotterie add:" + lotterie.address);
    var account_contract_dapp = accounts[2];
    var account_bidder1 = accounts[3];
    var account_bidder2 = accounts[4];
    var account_bidder3 = accounts[5];

    var accountParts = [];

    myConf.minBidValue = web3.toWei(0,"ether");
    await configuration(lotterie,account_contract_dapp,myConf);

    var erc223 = await ERC223Test.new(1000000, { from : account_owner });
    var erc223t = ERC223ForTruffle.at(erc223.address);
    assert.equal(web3.toHex(await erc223.balanceOf(account_owner)), web3.toHex(1000 * 1000));


    await tr_log( lotterie.initThrow223 (false,erc223.address,0,0,0,0,0,0, ), true);

          // one 1000 3 digit token to account_owner
    var ltax = await lotterie.getThrowAddress.call(0);
    var lotteriethrow = LotterieThrow223.at(ltax);
    var m = await lotteriethrow.mode.call();
    assert.equal(m[0], 1);
    assert.equal(m[1], erc223.address);
    var thr = lotterieLib.newThrow(await lotteriethrow.getThrow.call());
    assert.equal(web3.toHex(thr.totalBidValue), web3.toHex(0));
    assert.equal(thr.currentPhase, "1");


    await tr_log( lotterie.initThrow223 (true,erc223.address,0,0,0,0,0,0, { from : account_bidder3 }), true);
    ltax = await lotterie.getThrowAddress.call(1);
    lotteriethrow = LotterieThrow223.at(ltax);
    thr = lotterieLib.newThrow(await lotteriethrow.getThrow.call());
    assert.equal(thr.currentPhase, "0");
    // check we cannot init twice
    assertRevert(lotteriethrow.deffered_constructor(false,erc223.address,0,0,0,0,0,0, { from : account_bidder3 }), true );
    var bidencoded = w3abi.encodeFunctionCall(
            _.find(LotterieThrow223.abi, { name: 'initPrize' }),
            []);
    await erc223.transfer(account_bidder2, 1000, { from : account_owner });
    await erc223.transfer(account_bidder3, 500, { from : account_owner });
    // only thrower to init prize
    assertRevert( erc223t.transfer(lotteriethrow.address, '500', bidencoded, { from : account_bidder2 }), true);
    await tr_log( erc223t.transfer(lotteriethrow.address, '500', bidencoded, { from : account_bidder3 }), true);
    
 

    // a standard bid at 0 value
    await tr_log( lotteriethrow.bid(calcCommitment('0x0'), { from : account_bidder1 }), true );
    accountParts.push(account_bidder1);
//          console.log(_.find(LotterieThrow223.abi, { name: 'bid' }));
    bidencoded = w3abi.encodeFunctionCall(
            _.find(LotterieThrow223.abi, { name: 'bid' }),
            [calcCommitment('0x1111111111111111111111111111111111')]);
    await tr_log( erc223t.transfer(lotteriethrow.address, '1000', bidencoded, { from : account_bidder2 }), true);
    thr = lotterieLib.newThrow(await lotteriethrow.getThrow.call());
    assert.equal(web3.toHex(thr.totalBidValue), web3.toHex(500 + 1000));
    assert.equal(web3.toHex(await erc223.balanceOf(account_bidder2)), web3.toHex(0));
    
    accountParts.push(account_bidder2);
    await tr_log( lotteriethrow.bid(calcCommitment('0x2'), { from : account_bidder2 , value : myConf.minBidValue }), true );
    accountParts.push(account_bidder2);
    await tr_log( lotteriethrow.bid(calcCommitment('0x3'), { from : account_bidder2 , value : myConf.minBidValue }), true );
    accountParts.push(account_bidder2);
    assert.equal(await lotteriethrow.getPhase.call(), lotterieLib.phases.Bidding);
    await tr_log( lotteriethrow.bid(calcCommitment('0x4'), { from : account_bidder3 , value : myConf.minBidValue }), true );
    accountParts.push(account_bidder3);
    assert.equal(await lotteriethrow.getPhase.call(), lotterieLib.phases.Participation);
    // reveal
    var thrBlock = thr.blockNumber;

    await tr_log(lotteriethrow.revealParticipation(0,0), true);
    await tr_log( lotteriethrow.revealParticipation(3,3), true);
    await tr_log( lotteriethrow.revealParticipation(4,4), true);
    await tr_log( lotteriethrow.revealParticipation(1,'0x1111111111111111111111111111111111'), true);
    await tr_log( lotteriethrow.revealParticipation(2,2), true);
    assert.equal(await lotteriethrow.getPhase.call(), lotterieLib.phases.Cashout);
    // get postition by heavy cost call (still less costy thant previous method

    // iterate on participation
    for (var i = 0; i < 5; ++i) {
      // for test only
      var ix = await lotteriethrow.currentIxAmongWinners.call(i);
      // TODO only winner?
    //var posNb0 = await lotteriethrow.checkPositionHeavyCost.call(0);
      await tr_log( lotteriethrow.cashOut(i, ix), true);
    }
    var nbwin = await lotteriethrow.nbWinners.call();
    assert.equal(nbwin,4);
    assert.equal(web3.toHex(await lotteriethrow.linkedWinnersLength.call()),4);
    // TODO additional user trying to insert (in a non salt conf it will be easier)
    await dirtyPause(3);
    assert.equal(await lotteriethrow.getPhase.call(), lotterieLib.phases.End);
    // register win and withdraw
          // let one win amount to test end phase empty
    for (var j = 0; j < (nbwin - 1); ++j) {
      var w = lotterieLib.newWinnerArray(await lotteriethrow.getWinner.call(j));
      var i = w.participationId;

      var initBalance = parseInt(await erc223.balanceOf(accountParts[i]));
            console.log("pid : " + i);
            console.log("initb : " + i);
      var result = await lotteriethrow.withdrawWin(i, { from : accountParts[i] });
      tr_log2(result, true);
      truffleAssert.eventEmitted(result, 'Win',  function(ev) {
        var result = web3.toHex(ev.participationId) === web3.toHex(i);
        if (result) {
            console.log("pid2 : " + i);
            assert.isAbove(ev.position, 0);
            assert.isAbove(ev.amount, 0);
            assert.equal(ev.winner, accountParts[i]);
        }
        return result;
      });

      assert.equal(web3.toHex(await erc223.balanceOf(accountParts[i])), web3.toHex(initBalance + ((1000+500)/4)));
    }
    await dirtyPause(5);
    assert.equal(await lotteriethrow.getPhase.call(), lotterieLib.phases.Off);
    var thr = lotterieLib.newThrow(await lotteriethrow.getThrow.call());
    assertRevert(lotteriethrow.emptyOffThrow({ from : account_contract_dapp }));
//    await tr_log( lotterie.recalculateState(0,lotterieLib.phases.Off), true);
    var initBalance = parseInt(await erc223.balanceOf(account_owner));
    await tr_log( lotteriethrow.emptyOffThrow({ from : account_owner }), true);
    assert.equal(web3.toHex(await erc223.balanceOf(account_owner)), web3.toHex(initBalance + ((1000+500)/4)));
    
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
async function tr_log(pr,debug) {
  var res = await pr;
  tr_log2(res,debug);
}
function tr_log2(res,debug) {
  var rcpt = web3.eth.getTransactionReceipt(res.tx);
  if (debug != null && debug) {
    console.log("cumulativeGasUsed: " + rcpt.cumulativeGasUsed);
  }
  totalCostLog += rcpt.cumulativeGasUsed;
  //console.log("gasPrice: " + web3.eth.gasPrice);
}


async function dirtyPause(nbsecs) {
  var currentTime = new Date().getTime();
  while (currentTime + nbsecs * 1000 >= new Date().getTime()) { 
    await new Promise(function (resolve) { setTimeout(resolve,100) });
  }
}
async function dis(a,b){}
function hexToBytes(hex) {
    if (hex.startsWith('0x')) {
      hex = hex.substr(2);
    }
    for (var bytes = [], c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}

