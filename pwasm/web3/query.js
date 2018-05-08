var Web3 = require("web3");
var fs = require("fs");
// Connect to our local node
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
// Setup default account
var contract_address = "0xa73d7d940efeb483356c55b80e395caaa4721be0";
web3.eth.defaultAccount = "0x80030437a77159ada88a1e26f75c122382a94ee7";
// Unlock account
//web3.eth.personal.unlockAccount(web3.eth.defaultAccount, "user");
web3.eth.personal.unlockAccount(web3.eth.defaultAccount, "user");
// read JSON ABI
var abi = JSON.parse(fs.readFileSync("../target/json/ParamsInterface.json"));

var LotterieContract = new web3.eth.Contract(abi, contract_address, { from: web3.eth.defaultAccount });
/*for ( var a in LotterieContract.methods) {
  console.log(a);
}*/
LotterieContract.methods.getWiningParamsCount().call().then((res) => console.log(res));
//LotterieContract.methods.getWinningParams(0).call().then((res) => console.log(res));
