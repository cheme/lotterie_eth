var LotterieLib = artifacts.require("./LotterieLib.sol");
var LotterieConf = artifacts.require("./LotterieConf.sol");
var Lotterie = artifacts.require("./Lotterie.sol");
var LotterieThrowEther = artifacts.require("./LotterieThrowEther.sol");
var LotterieThrow223 = artifacts.require("./LotterieThrow223.sol");
var LotterieThrow20 = artifacts.require("./LotterieThrow20.sol");
const LotterieAuthor = '0x8d52c034ac92c8ea552a68044ce73c7a8058c8ad';

module.exports = function(deployer) {
  deployer.deploy(LotterieConf).then(lc => {
  deployer.link(LotterieConf, LotterieThrow20);
  return deployer.deploy(LotterieThrow20).then(l20 => {
  deployer.link(LotterieConf, LotterieThrow223);
  return deployer.deploy(LotterieThrow223).then(() => {
  deployer.link(LotterieConf, LotterieThrowEther);
  return deployer.deploy(LotterieThrowEther).then(() => {
  deployer.link(LotterieConf, Lotterie);
console.log(LotterieThrowEther.address);
console.log(LotterieThrow20.address);
console.log(LotterieThrow223.address);
  return deployer.deploy(Lotterie,LotterieAuthor,LotterieThrowEther.address,LotterieThrow223.address,LotterieThrow20.address);
  });});});});
};

