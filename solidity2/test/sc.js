
import lotterieLib from '../index.js';

const truffleAssert = require('truffle-assertions');

var Lotterie = artifacts.require("./Lotterie.sol");
var LotterieThrowTemplate = artifacts.require("./LotterieThrowEther.sol");
var LotterieThrowTemplate223 = artifacts.require("./LotterieThrow223.sol");
var LotterieThrowTemplate20 = artifacts.require("./LotterieThrow20.sol");
//var LotterieConf = artifacts.require("./LotterieConf.sol");
//var ThrowLib = artifacts.require("./ThrowLib.sol");
const conf1 = {
  dosalt : true,
  nbWinners : 5,
  nbWinnerMinRatio : 50, // less than 10 participant we apply ratio 
  distribution : lotterieLib.winningDistribution.Equal,
  minBidValue : web3.toWei(0.001,"ether"),
  biddingTreshold : web3.toWei(1,"ether"), // do not allow more than a ether (100 participant at min value)
  participationStartMode : lotterieLib.cashoutEndModes.Relative, // best absolute most of the time
  participationStartTreshold : 0, // no time switch (absolute)
  maxParticipant : 50, // 50 participant start
  participationEndMode : lotterieLib.participationEndModes.EagerRelative, // Eager is a must have
  participationEndValue : 300, // seconds
  cashoutEndMode : lotterieLib.cashoutEndModes.Relative,
  cashoutEndValue : 300,
  throwEndMode : lotterieLib.cashoutEndModes.Relative, // best absolute most of the time
  throwEndValue : 300
}
async function configuration(lotterie,account_contract_dapp,c) {
    var res = await lotterie.addWinningParams(c.nbWinners,c.nbWinnerMinRatio,c.distribution);
    assert.equal(res.error, null);
    var res = await lotterie.addPhaseParams(
      c.participationStartMode,
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

contract('Lotterie sc', function(accounts) {
   beforeEach(function() {
     totalCostLog = 0;
   });
   afterEach(function() {
     console.log("Logged gas cost total : ", totalCostLog);
   });


it("sc", async function() {
      
    var myConf = Object.assign({}, conf1);
    myConf.maxParticipant = 5;
    //myConf.nbWinners = 4;
    myConf.nbWinnerMinRatio = 80; // 4 winner (ratio applying)
    var account_owner = accounts[0];
    var account_contract_author = accounts[1];
    var template = await LotterieThrowTemplate.new();
    var template223 = await LotterieThrowTemplate223.new();
    var template20 = await LotterieThrowTemplate20.new();
    var lotterie = await Lotterie.new(account_contract_author, template.address, template223.address, template20.address, { from : account_owner });
//    var lotterie = new Lotterie('0xc82621b796c427f673b64d0e1a8f888c214ba44e');
    console.log("lotterie add:" + lotterie.address);
    var account_contract_dapp = accounts[2];
    var account_bidder1 = accounts[3];
    var account_bidder2 = accounts[4];
    var account_bidder3 = accounts[5];

    var accountParts = [];
    await configuration(lotterie,account_contract_dapp,myConf);
    await lotterie.initThrow(0,0,0,0,0,0,0);

  });

});

