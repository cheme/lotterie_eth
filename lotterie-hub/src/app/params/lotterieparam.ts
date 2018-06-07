import Web3 from 'web3';
import BigNumber from 'bignumber.js';

export class Lotterieparam {

  static fromObject(id : BigNumber, object: any): Lotterieparam {
    let param =  {...object};
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
