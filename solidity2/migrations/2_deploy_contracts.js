var LotterieLib = artifacts.require("./LotterieLib.sol");
var LotterieConf = artifacts.require("./LotterieConf.sol");
var Lotterie = artifacts.require("./Lotterie.sol");
var LotterieThrow = artifacts.require("./LotterieThrow.sol");
const LotterieAuthor = '0x0000000000000000000000000000000000000000';

module.exports = function(deployer) {
  deployer.deploy(LotterieConf);
  deployer.link(LotterieConf, LotterieThrow);
  deployer.deploy(LotterieThrow);
  deployer.link(LotterieConf, Lotterie);
  deployer.deploy(Lotterie,LotterieAuthor,LotterieAuthor); // TODO way to get the throw template address!!!
//          LotterieThrow.address);
};
