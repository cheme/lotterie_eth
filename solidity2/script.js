
import lotterieLib from './index.js';
import Web3 from 'web3';

 
var unlockaccount = "0xcc25388632cbc6fad24b42e03efed5e095e567e5";
var pk = "30fe309b023560422c537fdec2a1e3be97bd67253f84aac6a325c5c89f345f89";
var web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
lotterieLib.web3 = web3;

lotterieLib.lotterieAddress = '0x283407f104ddfd7c240d70875f52a1429e9a7f0b';

console.log(lotterieLib.calcCommitment(lotterieLib.lotterieAddress));
var myContract = new web3.eth.Contract(lotterieLib.lotterieAbi, lotterieLib.lotterieAddress);


var myAcc = web3.eth.accounts.privateKeyToAccount(pk);

//myContract.methods.getTotalNbThrow().call().then(console.log,console.log);
myContract.methods.initThrow("0x0","0x0",0,0,0,0).send({from : myAcc.address, gas: "600000"}).then(console.log,console.error);

myContract.methods.getTotalNbThrow().call().then(console.log,console.log);
