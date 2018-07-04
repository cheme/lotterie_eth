
import lotterieLib from '../index.js';

const truffleAssert = require('truffle-assertions');

var ERC721Test = artifacts.require("./ERC721Test.sol");
var ERC223Test = artifacts.require("./ERC223Test.sol");
var ERC20Test = artifacts.require("./ERC20Test.sol");


contract('Lotterie sc2', function(accounts) {
   beforeEach(function() {
   });
   afterEach(function() {
   });


  it("sc2", async function() {
      
    var account_owner = accounts[0];
    console.log("account:" + account_owner);
    //var erc223 = await ERC223Test.new("100000000000", { from : account_owner });
    var erc223 = await ERC223Test.new(10, { from : account_owner });
    console.log("erc223:" + erc223.address);
    //var erc20 = await ERC20Test.new("10000000000000", { from : account_owner });
    var erc20 = await ERC20Test.new(100, { from : account_owner });
    console.log("erc20:" + erc20.address);
    var erc721 = await ERC721Test.new({ from : account_owner });
    console.log("erc721:" + erc721.address);

  });

});

