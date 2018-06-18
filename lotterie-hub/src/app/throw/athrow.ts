import { EthId } from "../eth-components/eth-id";
import { EthValue } from "../eth-components/eth-value";
import { Bignumber } from "../eth-components/bignumber";

export class Athrow {

  /// Throw contract address
  address : string;
  /// the web3 object associated with the contract
  throwLib : Object;

  // inner fields 
  paramsId : EthId;
  paramsPhaseId : EthId;
  currentSeed : string;
  totalBidValue : EthValue;
  totalClaimedValue : EthValue;
  numberOfBid : number; // uint64
  numberOfRevealParticipation : number; // uint64
  thrower : string; // address
  blockNumber : Bignumber;

  authorContractMargin : number; // uint32
  authorContractWithdrawned : boolean;
  authorDappMargin : number;
  authorDappWithdrawned : boolean;
  ownerMargin : number;
  ownerWithdrawned : boolean;
  throwerMargin : number;
  throwerWithdrawned : boolean;

  totalMargin : EthValue;

  currentPhase : number;
  calcPhase : number;

  static fromObject(add : string, throwLib : any, objectThr: any, objectWithdr): Athrow {
    let athrow = {...objectThr,...objectWithdr};
    athrow.address = add;
    athrow.throwLib = throwLib;
    Athrow.totalMarginInit(athrow);
    athrow.calcPhase = 0;
    athrow.currentPhase = parseInt(athrow.currentPhase);
    athrow.paramsId = new EthId(athrow.paramsId);
    athrow.paramsPhaseId = new EthId(athrow.paramsPhaseId);
    athrow.totalBidValue = EthValue.fromString(athrow.totalBidValue);
    athrow.totalClaimedValue = EthValue.fromString(athrow.totalClaimedValue);
    //athrow.totalMargin = EthValue.fromString(athrow.totalMargin);
    athrow.blockNumber = new Bignumber(athrow.blockNumber);
    athrow.numberOfBid = parseInt(athrow.numberOfBid);
    athrow.numberOfRevealParticipation = parseInt(athrow.numberOfRevealParticipation);
    athrow.authorContractMargin = parseInt(athrow.authorContractMargin);
    athrow.authorDappMargin = parseInt(athrow.authorDappMargin);
    athrow.ownerMargin = parseInt(athrow.ownerMargin);
    athrow.throwerMargin = parseInt(athrow.throwerMargin);
    return athrow;
  }
 
  static totalMarginInit(t : Athrow) {
    var sum = new Bignumber(t.authorContractMargin);
    sum = sum.plus(new Bignumber(t.authorDappMargin));
    sum = sum.plus(new Bignumber(t.ownerMargin));
    sum = sum.plus(new Bignumber(t.throwerMargin));
    t.totalMargin = EthValue.fromBN(sum);
  }
}
