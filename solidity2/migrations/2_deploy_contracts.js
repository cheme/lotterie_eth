var LotterieLib = artifacts.require("./LotterieLib.sol");
var LotterieConf = artifacts.require("./LotterieConf.sol");
var Lotterie = artifacts.require("./Lotterie.sol");
const LotterieAuthor = '0x0000000000000000000000000000000000000000';

module.exports = function(deployer) {
  deployer.deploy(LotterieConf);
  deployer.link(LotterieConf, Lotterie);
  deployer.deploy(Lotterie,LotterieAuthor);
};
