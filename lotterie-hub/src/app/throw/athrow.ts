import { EthId } from "../eth-components/eth-id";
import { EthValue } from "../eth-components/eth-value";
import { Bignumber } from "../eth-components/bignumber";
import { Winningparam } from "../params/winningparam";
import { Lotterieparam } from "../params/lotterieparam";
import { Phaseparam } from "../params/phaseparam";
import { LotterieService } from "../ethereum/lotterie.service";
import { Observable, zip, of } from "rxjs";
import { tap, map, flatMap } from "rxjs/operators";

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

  // other vals
  private _bidType : number = 0; // ether, 223, 20 mode
  get bidType() : number {
    return this._bidType;
  }
  private _bidTypeAddress : string; // address of token (for 1 and 2 mode)
  get bidTypeAddress() : string {return this._bidTypeAddress;}
  public tokenName : string;
  public tokenSymbol : string;
  public tokenDecimals : number;
  public tokenLib : any;
  public nbErc721 : number = 0;
  public nbErc721Construct : number = 0;
  public waitingInitvalue : number = 0;

  public static initAthrow(addresses : string, lotterieService : LotterieService,cb? :Function) : Observable<Athrow> {

    return lotterieService.getModeThrow(addresses).pipe(
      flatMap(([type,tokaddress]) => {
        var obthr;
        if (type == 0) {
          obthr = lotterieService.getAthrow(addresses);
        } else if (type == 1) {
          obthr = lotterieService.getAthrow223(addresses);
        } else if (type == 2) {
          obthr = lotterieService.getAthrow20(addresses);
        } else {
          throw "invalid throw type";
        }
        return obthr.pipe(
          flatMap(([lib,objectThr,objectWithdr]) => {
            var at =  Athrow.fromObject(addresses, lib, objectThr,objectWithdr,type != 0);
            at._bidType = type;
            at._bidTypeAddress = tokaddress;

            if (type == 0) {
              return of(at);
            }
            var ro; 
            if (type == 1) {
              ro = lotterieService.getInfo223(tokaddress);
            } else if (type == 2) {
              ro = lotterieService.getInfo20(tokaddress);
            }
            return ro.pipe(
              map(([tlib,tname,tsymbol,tdecs]) => {
                at.tokenName = tname;
                at.tokenSymbol = tsymbol;
                at.tokenDecimals = tdecs;
                at.tokenLib = tlib;
                Athrow.setTokenInfos(at,tname,tsymbol,tdecs);
                return at;
              })
            );
          }),
          map((at : Athrow) => {
            lotterieService.calcPhase(at.throwLib)
            .subscribe(p => {
              at.calcPhase = p;
              if (cb != null) {
                cb(at);
              }
            });
            // warning erc721 call are not sync with of cb
            lotterieService.nbERC721(at.throwLib).subscribe(nb => {
              at.nbErc721 = nb;
            });
            var tokenLib;
            if (type == 1) {
              tokenLib = lotterieService.newErc223Lib(tokaddress);
            }
            if (type == 2) {
              tokenLib = lotterieService.newErc20Lib(tokaddress);
            }
            if (type > 0) {
              lotterieService.getTokenInfos(tokenLib).subscribe(([tname,tsymbol,tdecs]) => {
                at.tokenName = tname;
                at.tokenSymbol = tsymbol;
                at.tokenDecimals = tdecs;
                Athrow.setTokenInfos(at,tname,tsymbol,tdecs);
              });
            }
            return at;
          }),
        );
      }),
    );
  }

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

  static fromObject(add : string, throwLib : any, objectThr: any, objectWithdr, isToken? : boolean): Athrow {
    let athrow = {...objectThr,...objectWithdr};
    let athrowTyped = new Athrow();
    athrowTyped.address = add;
    athrowTyped.throwLib = throwLib;
    athrowTyped.calcPhase = 0;
    athrowTyped.currentPhase = parseInt(athrow.currentPhase);
    athrowTyped.paramsId = new EthId(athrow.paramsId);
    athrowTyped.paramsPhaseId = new EthId(athrow.paramsPhaseId);
    athrowTyped.currentSeed = athrow.currentSeed;
    athrowTyped.totalBidValue = EthValue.fromString(athrow.totalBidValue);
    athrowTyped.totalClaimedValue = EthValue.fromString(athrow.totalClaimedValue);
    //athrowTyped.totalMargin = EthValue.fromString(athrow.totalMargin);
    athrowTyped.blockNumber = new Bignumber(athrow.blockNumber);
    athrowTyped.numberOfBid = parseInt(athrow.numberOfBid);
    athrowTyped.numberOfRevealParticipation = parseInt(athrow.numberOfRevealParticipation);
    athrowTyped.thrower = athrow.thrower;
    athrowTyped.authorContractMargin = parseInt(athrow.authorContractMargin);
    athrowTyped.authorDappMargin = parseInt(athrow.authorDappMargin);
    athrowTyped.ownerMargin = parseInt(athrow.ownerMargin);
    athrowTyped.throwerMargin = parseInt(athrow.throwerMargin);
    athrowTyped.ownerWithdrawned = athrow.ownerWithdrawned;
    athrowTyped.authorContractWithdrawned = athrow.authorContractWithdrawned;
    athrowTyped.authorDappWithdrawned = athrow.authorDappWithdrawned;
    athrowTyped.throwerWithdrawned = athrow.throwerWithdrawned;
    Athrow.totalMarginInit(athrowTyped);
    if (isToken) {
      Athrow.setUnknownToken(athrowTyped);
    }
    return athrowTyped;
  }
 
  private static setUnknownToken(at : Athrow) {
    at.totalBidValue.undefinedToken();
    at.totalClaimedValue.undefinedToken();
  }

  // use new object to refresh
  static setTokenInfos(at : Athrow, name: string, symbol: string, decs: number) {
    var ab = EthValue.fromBN(at.totalBidValue.value);
    ab.setTokenInfos(name,symbol,decs);
    var tc = EthValue.fromBN(at.totalClaimedValue.value);
    tc.setTokenInfos(name,symbol,decs);
    at.totalBidValue = ab;
    at.totalClaimedValue = tc;
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
