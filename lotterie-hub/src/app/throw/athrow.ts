import { EthId } from "../eth-components/eth-id";
import { EthValue } from "../eth-components/eth-value";
import { Bignumber } from "../eth-components/bignumber";
import { Winningparam } from "../params/winningparam";
import { Lotterieparam } from "../params/lotterieparam";
import { Phaseparam } from "../params/phaseparam";
import { LotterieService } from "../ethereum/lotterie.service";

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

  //totalMargin : EthValue;
  totalMargin : number;

  currentPhase : number;
  calcPhase : number;

  // placeholder for param if initiated
  private paramPhase : Phaseparam;
  private param : Lotterieparam;
  private paramWinning : Winningparam;
  public static phaseLabel(phaseid : number, lotterieService : LotterieService) : string {
    let i = 0;
    for (let k in lotterieService.phases) {
      if (i === phaseid) {
        return k;
      } 
      ++i;
    }
    return "error getting label for phase : " + phaseid;
  } 
  public static withParamPhase(thr : Athrow, cb : Function, lotterieService : LotterieService) {
    if (thr.paramPhase == null) {
      lotterieService.getPhaseParam(thr.paramsPhaseId.toString()).subscribe((ob) => {
        thr.paramPhase = Phaseparam.fromObject(thr.paramsPhaseId, ob);
        cb(thr.paramPhase);
      });
    } else {
      cb(thr.paramPhase);
    }
  } 
  public static withParam(thr : Athrow, cb : Function, lotterieService : LotterieService) {
    if (thr.param == null) {
      lotterieService.getLotterieParam(thr.paramsId.toString()).subscribe((ob) => {
        thr.param = Lotterieparam.fromObject(thr.paramsId, ob);
        cb(thr.param);
      });
    } else {
      cb(thr.param);
    }
  }

  public static withWinningParam(thr : Athrow, cb : Function, lotterieService : LotterieService) {
    if (thr.paramWinning == null) {
      Athrow.withParam(thr,(par) => {
        lotterieService.getWinningParam(par.winningParamsId.toString()).subscribe((ob) => {
          thr.paramWinning = Winningparam.fromObject(par.winningParamsId, ob);
          cb(thr.paramWinning);
        });
      }, lotterieService);
    } else {
      cb(thr.paramWinning);
    }
  }

  static fromObject(add : string, throwLib : any, objectThr: any, objectWithdr): Athrow {
    let athrow = {...objectThr,...objectWithdr};
    athrow.address = add;
    athrow.throwLib = throwLib;
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
    Athrow.totalMarginInit(athrow);
    return athrow;
  }
 
  static totalMarginInit(t : Athrow) {
    t.totalMargin = 
    t.authorContractMargin +
    t.authorDappMargin + 
    t.ownerMargin + 
    t.throwerMargin;
  }
  /*static totalMarginInit(t : Athrow) {
    var sum = new Bignumber(t.authorContractMargin);
    sum = sum.plus(new Bignumber(t.authorDappMargin));
    sum = sum.plus(new Bignumber(t.ownerMargin));
    sum = sum.plus(new Bignumber(t.throwerMargin));
    t.totalMargin = EthValue.fromBN(sum);
  }*/
}
