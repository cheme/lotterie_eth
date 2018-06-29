var LotterieLib = artifacts.require("./LotterieLib.sol");
var LotterieConf = artifacts.require("./LotterieConf.sol");
var Lotterie = artifacts.require("./Lotterie.sol");
var LotterieThrowEther = artifacts.require("./LotterieThrowEther.sol");
var LotterieThrow223 = artifacts.require("./LotterieThrow223.sol");
var LotterieThrow20 = artifacts.require("./LotterieThrow20.sol");
const LotterieAuthor = '0x0000000000000000000000000000000000000000';

module.exports = function(deployer) {
  deployer.deploy(LotterieConf);
  deployer.link(LotterieConf, LotterieThrowEther);
  deployer.link(LotterieConf, LotterieThrow223);
  deployer.link(LotterieConf, LotterieThrow20);
  deployer.deploy(LotterieThrowEther);
  deployer.deploy(LotterieThrow223);
  deployer.deploy(LotterieThrow20);
  deployer.link(LotterieConf, Lotterie);
  deployer.deploy(Lotterie,LotterieAuthor,LotterieAuthor,LotterieAuthor,LotterieAuthor); // TODO way to get the throw template addresses!!!
};
