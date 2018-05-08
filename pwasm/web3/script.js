var Web3 = require("web3");
var fs = require("fs");
// Connect to our local node
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
// Setup default account

web3.eth.defaultAccount = "0x80030437a77159ada88a1e26f75c122382a94ee7";
// Unlock account
//web3.eth.personal.unlockAccount(web3.eth.defaultAccount, "user");
web3.eth.personal.unlockAccount(web3.eth.defaultAccount, "user");
// read JSON ABI
var abi = JSON.parse(fs.readFileSync("../target/json/ParamsInterface.json"));
// convert Wasm binary to hex format
var codeHex = '0x' + fs.readFileSync("../target/wasm32-unknown-unknown/release/lotterie_eth.wasm").toString('hex');

var LotterieContract = new web3.eth.Contract(abi, { data: codeHex, from: web3.eth.defaultAccount });
LotterieContract.deploy({data: codeHex, arguments: []}).send({from: web3.eth.defaultAccount, gas : 10000000 }).then((a) => console.log(a));
