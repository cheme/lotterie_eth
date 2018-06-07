// injection token definition
import { InjectionToken } from '@angular/core';
import Web3 from 'web3';
import lotterieLib from 'lotterie-solidity';
import { LotterieService } from './lotterie.service';
import { environment } from '../../environments/environment';
//import { EthereumModule } from './ethereum.module';

export const WEB3 = new InjectionToken<Web3>('web3',{
  providedIn: 'root',
  //providedIn: LotterieService,
  factory: () => new Web3(Web3.givenProvider || "ws://localhost:8546"),
});

export const LOTTERIELIB = new InjectionToken<lotterieLib>('lotterielib',{
  providedIn: 'root',
  //providedIn: LotterieService,
  factory: () => {
    lotterieLib.web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
    // default value
    lotterieLib.lotterieAddress = environment.contractAddress;
    lotterieLib.lotterie = 
      new lotterieLib.web3.eth.Contract(lotterieLib.lotterieAbi, lotterieLib.lotterieAddress);
    return lotterieLib;
  },
});
