// injection token definition
import { InjectionToken } from '@angular/core';
import Web3 from 'web3';
import lotterieLib from 'lotterie-solidity';
import { StorageService } from '../storage.service';
//import { EthereumModule } from './ethereum.module';

export const WEB3 = new InjectionToken<Web3>('web3',{
  providedIn: 'root',
  factory: () => new Web3(Web3.givenProvider || "ws://localhost:8546"),
});

export const LOTTERIELIB = new InjectionToken<lotterieLib>('lotterielib',{
  providedIn: 'root',
  factory: () => {
    lotterieLib.web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");

    let ev = StorageService.staticGetEnvt();

    // default value
    lotterieLib.lotterieAddress = ev.contractAddress;
    try {
    lotterieLib.lotterie = 
      new lotterieLib.web3.eth.Contract(lotterieLib.lotterieAbi, lotterieLib.lotterieAddress);
    } catch(e) {
      console.error("Pb starting probably wrong lotterie address : " + e);
    }
    return lotterieLib;
  },
});
