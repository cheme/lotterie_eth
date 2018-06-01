
import lotterieLib from './index.js';
import Web3 from 'web3';

 
var unlockaccount = "0x41e72c464d27084a5fb9ac08731c23e8cd318eb4";
var pk = "0x30fbcb4194ba5cca35db4c045c938ae76b4c520c66d313b55fad6136c6825dfd";
var web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
lotterieLib.web3 = web3;

lotterieLib.lotterieAddress = '0x13150a14d5a50e1138aadfef9e03d0fa3335322e';

console.log(lotterieLib.calcCommitment(lotterieLib.lotterieAddress));
var myContract = new web3.eth.Contract(lotterieLib.lotterieAbi, lotterieLib.lotterieAddress);


var myAcc = web3.eth.accounts.privateKeyToAccount(pk);

//myContract.methods.getTotalNbThrow().call().then(console.log,console.log);
myContract.methods.initThrow("0x0","0x0",0,0,0,0).send({from : myAcc.address, gas: "600000"}).then(console.log,console.error);

myContract.methods.getTotalNbThrow().call().then(console.log,console.log);
