import BigNumber from "bignumber.js";

export class Athrow {

  /// Throw contract address
  address : string;
  /// the web3 object associated with the contract
  throwLib : Object;

  // inner fields 
  paramsId : BigNumber;
  paramsPhaseId : BigNumber;
  currentSeed : string;
  totalBidValue : BigNumber;
  totalClaimedValue : BigNumber;
  numberOfBid : number; // uint64
  numberOfRevealParticipation : number; // uint64
  thrower : string; // address
  blockNumber : BigNumber;

  authorContractMargin : number; // uint32
  authorContractWithdrawned : boolean;
  authorDappMargin : number;
  authorDappWithdrawned : boolean;
  ownerMargin : number;
  ownerWithdrawned : boolean;
  throwerMargin : number;
  throwerWithdrawned : boolean;

  totalMargin : BigNumber;

  currentPhase : number;
  calcPhase : number;

  static fromObject(add : string, throwLib : any, objectThr: any, objectWithdr): Athrow {
    let athrow = {...objectThr,...objectWithdr};
    athrow.address = add;
    athrow.throwLib = throwLib;
    Athrow.totalMarginInit(athrow);
    athrow.calcPhase = 0;
    return athrow;
  }
 
  static totalMarginInit(t : Athrow) {
    var sum = new BigNumber(t.authorContractMargin);
    sum = sum.plus(new BigNumber(t.authorDappMargin));
    sum = sum.plus(new BigNumber(t.ownerMargin));
    sum = sum.plus(new BigNumber(t.throwerMargin));
    t.totalMargin = sum;
  }
  static calcPhase(t : Athrow) {
    t.throwLib
  }
}
