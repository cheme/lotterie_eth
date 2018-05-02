
const truffleAssert = require('truffle-assertions');

var Lotterie = artifacts.require("./Lotterie.sol");

// TODO move to its own js lif
lotterieLib = {
  participationEndModes : {
    EagerAbsolute : 0,
    EagerRelative : 1,
    Absolute : 2,
    Relative : 3
  },
  phases : {
    Bidding : 0,
    Participation : 1,
    Cashout : 2,
    End : 3
  },
  cashoutEndModes : {
    Absolute : 0,
    Relative : 1
  }
}
var conf1 = {
  dosalt : true,
  nbWinners : 5,
  nbWinnerMinRatio : 50, // less than 10 participant we apply ratio 
  minBidValue : web3.toWei(0.001,"ether"),
  biddingTreshold : web3.toWei(1,"ether"), // do not allow more than a ether (100 participant at min value)
  participationStartTreshold : 0, // no time switch (absolute)
  maxParticipant : 50, // 50 participant start
  participationEndMode : lotterieLib.participationEndModes.EagerRelative, // Eager is a must have
  participationEndValue : 30, // seconds
  cashoutEndMode : lotterieLib.cashoutEndModes.Relative,
  cashoutEndValue : 30
}
async function configuration(lotterie,account_contract_dapp,c) {
    var res = await lotterie.addWinningParams(c.nbWinners,c.nbWinnerMinRatio);
    assert.equal(res.error, null);
    var res = await lotterie.addParams(
      0,
      c.dosalt,
      account_contract_dapp,
      c.minBidValue,
      c.biddingTreshold,
      c.participationStartTreshold,
      c.maxParticipant,
      c.participationEndMode,
      c.participationEndValue,
      c.cashoutEndMode,
      c.cashoutEndValue
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
    var lotterie = await Lotterie.deployed(account_contract_author);
    var nbWinners = 5;
    var nbWinnerMinRatio = 50; // less than 10 participant we apply ratio 
    var nbparam = await lotterie.getWiningParamsCount.call();
    assert.equal(nbparam, 0);
    var d = await lotterie.addWinningParams.estimateGas(nbWinners,nbWinnerMinRatio);
    // fix gas cost test
    var res = await lotterie.addWinningParams(nbWinners,nbWinnerMinRatio,{gas : d});
    assert.equal(res.error, null);
    var nbparam = await lotterie.getWiningParamsCount.call();
    assert.equal(nbparam, 1);
    // fix gas cost test
    var res = await lotterie.addWinningParams(nbWinners,nbWinnerMinRatio,{gas : d});
    assert.equal(res.error, null);
    // value check
    res = await lotterie.getWinningParams(0);
    assert.equal(res[0], nbWinners);
    assert.equal(res[1], nbWinnerMinRatio);
  });

});

// running multiple contract (issue with update and read from multiple test
contract('Lotterie2', function(accounts) {
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
    var thr = await lotterie.getThrow.call(0);
    assert.equal(thr[0],0);
    assert.equal(thr[2],conf1.biddingTreshold);
    assert.equal(thr[4],1);

    var phase = await lotterie.getPhase.call(0);
    assert.equal(phase, lotterieLib.phases.Participation);

    var ac = await lotterie.authorContract();
    assert.equal(account_contract_author, ac);
    // revert : var d = await lotterie.withdrawContractAuthor.estimateGas(0);
    var gas = 100000;
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

});

contract('Lotterie2bis', function(accounts) {
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

    var gas = 100000;
    var result = await lotterie.withdrawContractAuthor(0, { from : account_contract_author, gas : gas });
    truffleAssert.eventEmitted(result, 'Withdraw',  function(ev) {
      return ev.to === account_contract_author && ev.amount == authorContractExpected;
    });
  });
});

contract('Lotterie3', function(accounts) {
  it("should not allow margin over 100%", async function() {
    var account_one = accounts[0];
    var account_contract_author = accounts[1];
    var lotterie = await Lotterie.deployed(account_contract_author);
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
});

async function assertRevert(pr) {
  try {
    await pr;
    assert(false, "should not succeed");
  } catch(e) {
    assert.match(e, /VM Exception[a-zA-Z0-9 ]+: revert/,"wrong exception");
  }
}


