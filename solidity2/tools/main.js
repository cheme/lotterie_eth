var fs = require('fs');

var lotterieConf_abi = fs.readFileSync( 'inp/LotterieConf.abi', 'utf8');
var lotterieConf_bin = fs.readFileSync( 'inp/LotterieConf.bin', 'utf8');
var throwLib_abi = fs.readFileSync( 'inp/ThrowLib.abi', 'utf8');
var throwLib_bin = fs.readFileSync( 'inp/ThrowLib.bin', 'utf8');


var lotterie_abi = fs.readFileSync( 'inp/Lotterie.abi', 'utf8');
var lotterie_bin = fs.readFileSync( 'inp/Lotterie.bin', 'utf8');
var lotterieThrow20_abi = fs.readFileSync( 'inp/LotterieThrow20.abi', 'utf8');
var lotterieThrow20_bin = fs.readFileSync( 'inp/LotterieThrow20.bin', 'utf8');
var lotterieThrow223_abi = fs.readFileSync( 'inp/LotterieThrow223.abi', 'utf8');
var lotterieThrow223_bin = fs.readFileSync( 'inp/LotterieThrow223.bin', 'utf8');
var lotterieThrowEther_abi = fs.readFileSync( 'inp/LotterieThrowEther.abi', 'utf8');
var lotterieThrowEther_bin = fs.readFileSync( 'inp/LotterieThrowEther.bin', 'utf8');

const libNameLink = "./contracts/LotterieConf.sol:LotteriConf";
const tLNameLink = "./contracts/throw/lib/ThrowLib.sol:ThrowLib";


const Web3 = require('web3');
const LightWallet = require('eth-lightwallet');

function initWeb3(d) {
  window.web3 = new Web3(d);
}



// Dirty fun to init account (initweb3 must be called before)
async function createAndSaveAccount(sp) {
    const password = prompt('Mot de passe encrypter le compte');
//    var salt = LightWallet.keystore.generateSalt();
    if (!sp) {
      sp =  LightWallet.keystore.generateRandomSeed();
      console.log(sp);
    }
    window.vault = 
       //   new LightWallet.keystore(sp, pwDerivedKey);
       await promiseCB(LightWallet.keystore.createVault,{
         password: password,
         seedPhrase: sp,
  // salt: fixture.salt,
         hdPathString: "m/44/60/0/0"
     });
      
    vault.keyFromPassword(password,(err,pwDerivedKey)=>{
            window.derivedKey = pwDerivedKey;
    //var pwDerivedKey = await promiseCB(vault.keyFromPassword,password);
        console.log(pwDerivedKey);
        console.log(vault.isDerivedKeyCorrect(pwDerivedKey));
        console.log(vault.getSeed(pwDerivedKey));
    // generate five new address/private key pairs
    // the corresponding private keys are also encrypted
    vault.generateNewAddress(pwDerivedKey, 5);
    window.addr = vault.getAddresses();
    console.log(addr);

    vault.passwordProvider = function (callback) {
      var pw = prompt("Please enter password", "Password");
      callback(null, pw);
    };

    window.privk = '0x' + vault.exportPrivateKey(addr[0], pwDerivedKey); // !! f*** unsafe without 0x very bad
    window.account = web3.eth.accounts.privateKeyToAccount(privk);
    });

}


// Get the account and sign a message
function signMessage(message) {
    const password = prompt('Sign a message');
    return account.sign(message);
}

async function deployConf(send) {
  await deploy(send, lotterieConf_abi, lotterieConf_bin, []);
}
async function deployTL(send,confAdd) {
  if (confAdd.startsWith('0x')) {
    confAdd = confAdd.substring(2,confAdd.length);
  }
  let lbin = link(throwLib_bin, libNameLink, confAdd);
  await deploy(send, throwLib_abi, lbin, []);
}

async function deploy20(send,confAdd,tLAdd) {
  deployThrow(send,confAdd,tLAdd,lotterieThrow20_abi,lotterieThrow20_bin);
}
async function deploy223(send,confAdd,tLAdd) {
  deployThrow(send,confAdd,tLAdd,lotterieThrow223_abi,lotterieThrow223_bin);
}
async function deployEther(send,confAdd,tLAdd) {
  deployThrow(send,confAdd,tLAdd,lotterieThrowEther_abi,lotterieThrowEther_bin);
}

async function deployThrow(send,confAdd,tLAdd,abi,bin) {
  if (confAdd.startsWith('0x')) {
    confAdd = confAdd.substring(2,confAdd.length);
  }
  if (tLAdd.startsWith('0x')) {
    tLAdd = tLAdd.substring(2,tLAdd.length);
  }
 
  let lbin = link(bin, libNameLink, confAdd);
  lbin = link(lbin, tLNameLink, tLAdd);
  if (lbin.length == bin.length) {

    await deploy(send, abi, lbin, []);
  } else {
    console.error ("error linking see bef and aft");
    window.bef = bin;
    window.aft = lbin;
  }
}

async function deployHub(send,confAdd,ethAdd,e223Add,e20Add) {
  if (confAdd.startsWith('0x')) {
    confAdd = confAdd.substring(2,confAdd.length);
  }
  let lbin = link(lotterie_bin, libNameLink, confAdd);
  console.log("linkedbin : "+ lbin);
//  address _authorContract,
//    address _throwTemplate,
//    address _throwTemplate223,
//    address _throwTemplate20
  await deploy(send, lotterie_abi, lbin, [
    '0x8d52c034ac92c8ea552a68044ce73c7a8058c8ad',
    ethAdd,
    e223Add,
    e20Add
  ]);
}


function hubContract(caddress) {
  return new web3.eth.Contract(JSON.parse(lotterie_abi),caddress,{from: account.address});
}

async function deploy(send, abi, bin, args) {

        if (!bin.startsWith('0x')) {
          bin = '0x' + bin;
        }
  var contract = new web3.eth.Contract(JSON.parse(abi));
  var payload = contract.deploy({
    data : bin,
    arguments : args
  }).encodeABI();
  var gas = await web3.eth.estimateGas({data:payload,gas:1000000000 });
  var gasPrice = await web3.eth.getGasPrice();
  console.log("estgas " + gas + " gp " + gasPrice);
  const tx = {
	  from : account.address,
//	  to : contractAddress,
	  data : payload,
	  gas : Math.floor(gas * 1.2),
	  gasPrice : gasPrice
  };
  var rt = (await web3.eth.accounts.signTransaction(tx,privk)).rawTransaction;
  console.log("Signed conf payload:");
  console.log(rt);
  if (send) {
    await sendTx(rt);
  }
}

async function sendTx(rt) {
  var res = await web3.eth.sendSignedTransaction(rt);
  console.log(res);
}

async function sendMessage(abi, contractAddress, from, privk, dest, msg) {
  var n = await web3.eth.getBlockNumber();
  console.log(n);
  var contract = new web3.eth.Contract(abi,contractAddress);
  var payload = contract.methods.sendMessage(dest, msg).encodeABI();
 
//  var gas = await contract.methods.sendMessage(dest,"my messages").estimateGas();
  var gas = await web3.eth.estimateGas({to: contractAddress,data:payload });
  var gasPrice = await web3.eth.getGasPrice();


  console.log("---");
  console.log(gas);
  console.log(gasPrice);
  const tx = {
	  from : from,
	  to : contractAddress,
	  data : payload,
	  gas : gas,
	  gasPrice : gasPrice
  };
  var rt = (await web3.eth.accounts.signTransaction(tx,privk)).rawTransaction;
  console.log(rt);
  var res = await web3.eth.sendSignedTransaction(rt);
  console.log(res);
}

window.testlib = {
  sendMessage,
  createAndSaveAccount,
  Web3,
  LightWallet,
  initWeb3,
  deployConf,
  deployTL,
  deploy20,
  deploy223,
  deployEther,
  deployHub,
  sendTx,
  hubContract
}


function link(bytecode, libName, libAddress) {
  if (libAddress.startsWith('0x')) {
    libAddress = libAddress.substring(2,confAdd.length);
  }
  if (libName.length > 35) {
    libName = libName.substring(0,36);
  }
  let symbol = "__" + libName + "_".repeat(40 - libName.length - 2);
  return bytecode.split(symbol).join(libAddress.toLowerCase())
}

function promiseCB(func, ...args) {
        return new Promise(function(resolve, reject) {
          func(...args, function(err, i) {
                  if (i) {
                          return resolve(i);
                  } else {
                          return reject(err);
                  }
          });
        });
}
