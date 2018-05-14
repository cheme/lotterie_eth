
async function dep_test() {

var Web3 = require("web3");
var fs = require("fs");
// Connect to our local node
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
// NOTE: if you run Kovan node there should be an address you've got in the "Option 2: Run Kovan node" step
web3.eth.defaultAccount = "0x004ec07d2329997267ec62b4166639513386f32e";
// read JSON ABI
var abi = JSON.parse(fs.readFileSync("../target/json/ParamsInterface.json"));
// convert Wasm binary to hex format
var codeHex = '0x' + fs.readFileSync("../target/lotterie_eth.wasm").toString('hex');

var LotterieContract = new web3.eth.Contract(abi, { data: codeHex, from: web3.eth.defaultAccount });

var LotterieDeployTransaction = LotterieContract.deploy({data: codeHex, arguments: []});

// Will create LotterieContract with `totalSupply` = 10000000 and print a result
await web3.eth.personal.unlockAccount(web3.eth.defaultAccount, "user");
var gas = await LotterieDeployTransaction.estimateGas();
var contract = await LotterieDeployTransaction.send({gasLimit: gas, from: web3.eth.defaultAccount});
console.log("c: " + contract); 
console.log("Address of new contract: " + contract.options.address); 
LotterieContract = contract;



var res = await LotterieContract.methods.getWiningParamsCount().call();
console.log(res);
await web3.eth.personal.unlockAccount(web3.eth.defaultAccount, "user");
try {
  await LotterieContract.methods.addWinningParams(5, 50, 0).send({from : web3.eth.defaultAccount});
} catch (outofgas_false_issue) {
  console.log(outofgas_false_issue);
}
res = await LotterieContract.methods.getWiningParamsCount().call();
console.log(res);
var param = await LotterieContract.methods.getWinningParams(0).call();
console.log(param);

}

dep_test();

