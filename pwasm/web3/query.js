var Web3 = require("web3");
var fs = require("fs");
// Connect to our local node
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
// Setup default account
var contract_address = "0xcF4e066AE93e86b079d4897B8595745515e0CD61";
web3.eth.defaultAccount = "0x004ec07d2329997267ec62b4166639513386f32e";
// Unlock account
//web3.eth.personal.unlockAccount(web3.eth.defaultAccount, "user");
//web3.eth.personal.unlockAccount(web3.eth.defaultAccount, "user");
// read JSON ABI
var abi = JSON.parse(fs.readFileSync("../target/json/ParamsInterface.json"));

var LotterieContract = new web3.eth.Contract(abi, contract_address, { from: web3.eth.defaultAccount });
/*for ( var a in LotterieContract.methods) {
  console.log(a);
}*/
LotterieContract.methods.getWiningParamsCount().call().then((res) => console.log(res));
//LotterieContract.methods.getWinningParams(0).call().then((res) => console.log(res));
//  fn addWinningParams(&mut self, nbWinners: u16, nbWinnerMinRatio: u16, distribution: u8) {
LotterieContract.methods.addWinningParams(5, 2 ** 32 / 2, 0).estimateGas().then((gas) => 
        console.log("est gas : " + gas)
).catch(console.log);
web3.eth.personal.unlockAccount(web3.eth.defaultAccount, "user").then(() => 
  LotterieContract.methods.addWinningParams(5, 2 ** 32 / 2, 0).send())
  .then(console.log).catch(console.log);
 
LotterieContract.methods.getWiningParamsCount().call().then((res) => console.log(res));
