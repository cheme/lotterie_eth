import Web3 from 'web3';
import { EthId } from '../eth-components/eth-id';
import { EthValue } from '../eth-components/eth-value';

export class Lotterieparam {

  static fromObject(id : EthId, object: any): Lotterieparam {
    //let param =  {...object};
    let param =  {
      id,
      authorDapp : object.authorDapp,
      winningParamsId : new EthId(object.winningParamsId),
      minBidValue : EthValue.fromString(object.minBidValue),
      biddingTreshold : EthValue.fromString(object.biddingTreshold),
      maxParticipant : parseInt(object.maxParticipant),
      doSalt : object.doSalt,
    };
    return param;
  }
 


    id : EthId;

    authorDapp : string; // TODO find a address type!!
    winningParamsId : EthId;
    minBidValue : EthValue;
    biddingTreshold : EthValue;
    maxParticipant : number; //uint64;
    doSalt : boolean;

}
