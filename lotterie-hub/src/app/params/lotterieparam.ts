import Web3 from 'web3';
import BigNumber from 'bignumber.js';

export class Lotterieparam {

  static fromObject(id : BigNumber, object: any): Lotterieparam {
    let param =  new Lotterieparam ();
    param.authorDapp = object.authorDapp;
    param.winningParamsId = object.winningParamsId;
    param.minBidValue = object.minBidValue;
    param.biddingTreshold = object.biddingTreshold;
    param.maxParticipant = object.maxParticipant;
    param.doSalt = object.doSalt;
    param.id = id;
    return param;
  }
 


    id : BigNumber;

    authorDapp : string; // TODO find a address type!!
    winningParamsId : BigNumber;
    minBidValue : BigNumber;
    biddingTreshold : BigNumber;
    maxParticipant : number; //uint64;
    doSalt : boolean;

}
