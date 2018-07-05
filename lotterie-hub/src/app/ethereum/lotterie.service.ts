import { Injectable, Inject, OnInit } from '@angular/core';
import Web3 from 'web3';
import { Observable, bindNodeCallback, of, from, interval, bindCallback, zip, merge } from 'rxjs';
import { map, flatMap, tap, catchError, filter, take } from 'rxjs/operators';
import { WEB3 } from './tokens';
import { LOTTERIELIB } from './tokens';
//import { isDevMode } from '@angular/core';
import { environment } from '../../environments/environment';

class ObservePoll {
  constructor(public eventname : string, public cb : Function, public contract? : any) { }
  public enabled = true;
}

export class ThrowEventPhase {
  constructor(public newPhase : number) { }
}
export class ThrowEventNewParticipation {
  constructor(public participationId : number,public bid : string) {}
}
export class ThrowEventRevealed {
  constructor(public participationId : number, public hiddenSeed : string, public concealedSeed : string) {}
  score? : number[];
}
export class ThrowEventWin {
  constructor(
    public participationId : number,
    public address : string,
    public position : number,
    public amount : string
  ) { }
}

@Injectable({
  providedIn: 'root'
})
export class LotterieService {
  
  public newErc223Lib(addres: string): any {
    return new this.lotterieLib.web3.eth.Contract(this.lotterieLib.Erc223Abi, addres);
  }
  public newErc721Lib(addres: string): any {
    return new this.lotterieLib.web3.eth.Contract(this.lotterieLib.Erc721Abi, addres);
  }
  public newErc20Lib(addres: string): any {
    return new this.lotterieLib.web3.eth.Contract(this.lotterieLib.Erc20Abi, addres);
  }

  public getErcBalance(ercLib: any): Observable<string> {
    return from(ercLib.methods.balanceOf(this.defaultAccount).call());
  }
  public getTokenInfos(ercLib: any): Observable<[string,string,number]> {
    return zip(
      from(ercLib.methods.name().call()),
      from(ercLib.methods.symbol().call()),
      from(ercLib.methods.decimals().call()),
      (n,s,d) => {
        return [n,s,parseInt(d)] as [string,string,number];
      }
    );
  }
  public getToken721Infos(ercLib: any): Observable<[string,string]> {
    return zip(
      from(ercLib.methods.name().call()),
      from(ercLib.methods.symbol().call()),
      (n,s) => {
        return [n,s] as [string,string];
      }
    );
  }
 
  private map223 = {};
  private map20 = {};
  private map721 = {};
  public getInfo223(tokaddress: string): Observable<[any,string,string,number]> {
    if (this.map223[tokaddress] != null) {
      let i = this.map223[tokaddress]
      return of([i.lib,i.name,i.symbol,i.decimals] as [any,string,string,number]);
    }
    let lib = this.newErc223Lib(tokaddress);
    return this.getTokenInfos(lib).pipe(
      map(([name,symbol,decimals]) => {
        this.map223[tokaddress] = {
          lib,
          name,
          symbol,
          decimals
        };
        return [lib,name,symbol,decimals] as [any,string,string,number];
      }),
    );
  }
  public getInfo20(tokaddress: string): Observable<[any,string,string,number]> {
    if (this.map20[tokaddress] != null) {
      let i = this.map20[tokaddress]
      return of([i.lib,i.name,i.symbol,i.decimals] as [any,string,string,number]);
    }
    let lib = this.newErc20Lib(tokaddress);
    return this.getTokenInfos(lib).pipe(
      map(([name,symbol,decimals]) => {
        this.map20[tokaddress] = {
          lib,
          name,
          symbol,
          decimals
        };
        return [lib,name,symbol,decimals] as [any,string,string,number];
      }),
    );
 
  }
 public getInfo721(tokaddress: string): Observable<[any,string,string]> {
    if (this.map721[tokaddress] != null) {
      let i = this.map721[tokaddress]
      return of([i.lib,i.name,i.symbol] as [any,string,string]);
    }
    let lib = this.newErc721Lib(tokaddress);
    return this.getToken721Infos(lib).pipe(
      map(([name,symbol]) => {
        this.map721[tokaddress] = {
          lib,
          name,
          symbol
        };
        return [lib,name,symbol] as [any,string,string];
      }),
    );
 
  }
  isYour721(tokAddress: string, tokId: string): Observable<[boolean,string]> {
    return this.getInfo721(tokAddress).pipe(
      flatMap(([lib,name,symbol]) => {
        return from(lib.methods.ownerOf(tokId).call()).pipe(
          map((o : string) => {
            let a = this.web3.eth.defaultAccount;
            return [o===a,name] as [boolean, string];
          })
        );
      }),
    );
  }
  getUri(tokAddress: string, tokId: string): Observable<[string,string,string]> {
    return this.getInfo721(tokAddress).pipe(
      flatMap(([lib,name,symbol]) => {
        return from(lib.methods.tokenURI(tokId).call()).pipe(
          map((u : string) => {
            return [name,symbol,u] as [string,string,string];
          }),

        );
      }),
    );
  }
  get721fromThrow(thrLib: any, tokIx: number): Observable<[string,string]> {
    return from(thrLib.methods.prizeErc721(tokIx).call());
  }

  addErc721(thrLib: any, tokAddress: string, tokId: string): Observable<any> {
    return this.getInfo721(tokAddress).pipe(
      flatMap(([lib,name,symbol]) => {
        let a = this.web3.eth.defaultAccount;
        let call = lib.methods.safeTransferFrom(a, thrLib._address, tokId);
        return from(call.estimateGas({from: this.web3.eth.defaultAccount})
          .then((gas) => 
            call.send({from: this.web3.eth.defaultAccount, gas: Math.floor(gas * 1.5) })));
      }),
    );
  }
  forceStart(thrLib: any): Observable<any> {
    var call = thrLib.methods.forceStartNoPrize();
    return from(call.estimateGas({from: this.web3.eth.defaultAccount})
       .then((gas) => 
         call.send({from: this.web3.eth.defaultAccount, gas: gas + 2000 })));
 
  }

  public newThrowLib(addres : string) : any {
    return new this.lotterieLib.web3.eth.Contract(this.lotterieLib.lotterieThrowAbi, addres);
  }
  public newThrowLib20(addres : string) : any {
    return new this.lotterieLib.web3.eth.Contract(this.lotterieLib.lotterieThrow20Abi, addres);
  }
  public newThrowLib223(addres : string) : any {
    return new this.lotterieLib.web3.eth.Contract(this.lotterieLib.lotterieThrow223Abi, addres);
  }

  get participationEndModes(): any {
    return this.lotterieLib.participationEndModes;
  };
  get cashoutEndModes(): any {
    return this.lotterieLib.cashoutEndModes;
  };
 
  get participationStates(): any {
    return this.lotterieLib.participationStates;
  };
  get phases(): any {
    return this.lotterieLib.phases;
  };




  stringToBytes(arg0: string): number[] {
    return this.web3.utils.hexToBytes(this.web3.utils.numberToHex(arg0));
  }

  // TODO move to lotterieLib
  calcScore(arg0: string, arg1: string): number[] {
    let arr0 = this.web3.utils.hexToBytes(this.web3.utils.padLeft(this.web3.utils.numberToHex(arg0),64,'0'));
    let arr1 = this.web3.utils.hexToBytes(this.web3.utils.padLeft(this.web3.utils.numberToHex(arg1),64,'0'));
    for (let i = 0; i < arr0.length; ++i) {
      arr0[i] = arr0[i] ^ arr1[i];
    }
    return arr0;
  }
  private lastpollblock : number; // TODO switch to BN
  // store poll observers if using metamask (until support web3 1.0 event watch)
  private metamaskpoll : ObservePoll [] = [];

  private observeEvent(eventname : string, cb : Function,contractobj?) {
    var contract, contractaddress;
    if (contractobj) {
      contract = contractobj;
      contractaddress = contractobj.address;
    } else {
      contract = this.lotterieLib.lotterie;
    }
    if (this.lotterieLib.web3.currentProvider.isMetaMask) {
      return Observable.create ( observer => {

       // TODO pollcall in actual poll function (redundant instantiation of function here)
       // need to add observer in metamaskpoll(already got contract)
       var pollCall = (startBlock,endBlock) => {

        contract.getPastEvents(eventname,{
          fromBlock : startBlock,
          toBlock : endBlock
        }, (error, result) => {
          if (error) {
            observer.error(error);
          } else {
            for (var ev of result) {
              observer.next(cb(ev));
            }
          }
        });
      };
      this.metamaskpoll.push(new ObservePoll(eventname,pollCall,contractaddress));
       
      });
    }
    return Observable.create( observer => {
      contract.events[eventname](
        // TODO weak ref on observer : gc when out of context??
        (error, result) => {
          if (error) {
            observer.error(error);
          } else {
            observer.next(cb(result));
          }
        }
      )
    });
  }
  private unObserveEvent(eventname : string, contractaddress?) {
    if (this.lotterieLib.web3.currentProvider.isMetaMask) {
      for (var p of this.metamaskpoll) {
        if (p.enabled && (eventname && eventname === p.eventname)) {
          if(!contractaddress || (contractaddress && contractaddress === contractaddress['address'])) {
            p.enabled = false;
          }
        }
        // TODO free mem at some point!!!(gc it)
      }
    } else {
      // for now consider our subscription do not leak
    }
  }

  // to subscribe on all new throw addresses
  public observeThrows(): Observable<string> {
    return this.observeEvent('NewThrow', (ev) => ev.returnValues.throwAddress);
    /*    this.lotterieLib.lotterie.events.NewThrow().on('data',console.log);
    var fncb = (cb) => 
    this.lotterieLib.lotterie.events.NewThrow().on('data',(event) => {
      console.log("ev1");
      cb(event.returnValues.throwAddress)
    });
    return bindCallback(fncb)();*/
  }
  public unObserveThrows()  {
    return this.unObserveEvent('NewThrow');
  }
  public observeThrow(lib): Observable<ThrowEventPhase | ThrowEventNewParticipation | ThrowEventRevealed | ThrowEventWin > {
    return merge<ThrowEventPhase, ThrowEventNewParticipation, ThrowEventRevealed, ThrowEventWin> (
      this.observeEvent('ChangePhase', (ev) => new ThrowEventPhase(parseInt(ev.returnValues.newPhase)),lib),
      this.observeEvent('NewParticipation', (ev) => new ThrowEventNewParticipation(
        parseInt(ev.returnValues.participationId),
        ev.returnValues.bid
      ),lib),
      this.observeEvent('Revealed', (ev) => new ThrowEventRevealed(
        parseInt(ev.returnValues.participationId),
        ev.returnValues.hiddenSeed,
        ev.returnValues.concealedSeed
      ),lib),
      this.observeEvent('Win', (ev) => new ThrowEventWin(
        parseInt(ev.returnValues.participationId),
        ev.returnValues.address,
        parseInt(ev.returnValues.position),
        ev.returnValues.amount,
      ),lib)
    );
  }


 
  public unObserveThrow(lib)  {
    return this.unObserveEvent(null,lib); // all event linked on this lib
  }
 
  public getAccounts(): Observable<string[]> {
    return from(this.web3.eth.getAccounts());
  }
  get defaultAccount(): string { return this.web3.eth.defaultAccount; }
  set defaultAccount(account: string) { this.web3.eth.defaultAccount = account; }

  get totalThrows(): Observable<number> { 
    return from(this.lotterieLib.lotterie.methods.getTotalNbThrow().call()).pipe(
      map((i : string) => parseInt(i))
    );
  }
  public getNbWinningParams(): Observable<string> { // TODO BN instead of string 
    return from(this.lotterieLib.lotterie.methods.getWiningParamsCount().call());
  }
  public getNbPhaseParams(): Observable<string> { // TODO BN instead of string 
    return from(this.lotterieLib.lotterie.methods.getPhaseParamsCount().call());
  }
  public getNbLotterieParams(): Observable<string> { // TODO BN instead of string 
    return from(this.lotterieLib.lotterie.methods.getLotterieParamsCount().call());
  }

  public getWinningParam(ix : string): Observable<Object> {
    return from(this.lotterieLib.lotterie.methods.getWinningParams(ix).call()).pipe(
      map(o => this.lotterieLib.newWinningParams(o))
    );
  }

  public getPhaseParam(ix : string): Observable<Object> {
    return zip(
      from(this.lotterieLib.lotterie.methods.getPhaseParams1(ix).call()),
      from(this.lotterieLib.lotterie.methods.getPhaseParams2(ix).call()),
      (p1,p2) => {
        let p1o = this.lotterieLib.newPhaseParams1(p1);
        let p2o = this.lotterieLib.newPhaseParams2(p2);
        return {...p1o, ...p2o};
      }
    );
  }

  public getLotterieParam(ix : string): Observable<Object> {
    return from(this.lotterieLib.lotterie.methods.getParams(ix).call()).pipe(
      map(o => this.lotterieLib.newLotterieParams(o))
    );
  }

  // TODO remove...?  or put a cache
  public getLotterieMinValue(ix : string): Observable<string> {
    return from(this.lotterieLib.lotterie.methods.getParams(ix).call()).pipe(
      map(o => this.lotterieLib.newLotterieParams(o)['minBidValue'])
    );
  }
  // TODO remove...? or put a cache!!
  public getNbWinners(throwLib : any): Observable<number> {
    return from(throwLib.methods.totalCashout().call()).pipe(
      map(o => o[0])
    );
  }
  public getNbFinalWinners(throwLib : any): Observable<number> {
    return from(throwLib.methods.nbWinners().call()).pipe(
      map(o => o[0])
    );
  }



  public getThrowAddress(ix : string): Observable<string> {
    return from(this.lotterieLib.lotterie.methods.getThrowAddress(ix).call());
  }

 private getAthrowInner(lotterieThrowLib : any, addres : string): Observable<[any,any,any]> {
    return zip(
      of(lotterieThrowLib),
      from(lotterieThrowLib.methods.getThrow().call())
        .pipe(map(t => this.lotterieLib.newThrow(t))),
      from(lotterieThrowLib.methods.getThrowWithdrawInfo().call())
        .pipe(map(t => this.lotterieLib.newThrowWithdraws(t)))
    );
  }

 public getAthrow(addres : string): Observable<[any,any,any]> {
    var lotterieThrowLib = this.newThrowLib(addres);
    return this.getAthrowInner(lotterieThrowLib,addres);
 }

  public getAthrow223(addres : string): Observable<[any,any,any]> {
    var lotterieThrowLib = this.newThrowLib223(addres);
    return this.getAthrowInner(lotterieThrowLib,addres);

  }
  public getAthrow20(addres : string): Observable<[any,any,any]> {
    var lotterieThrowLib = this.newThrowLib20(addres);
    return this.getAthrowInner(lotterieThrowLib,addres);
  }



  public fetchCurrentSeed(throwLib : any): Observable<string> {
      return from(throwLib.methods.getThrow().call()).pipe(map(t =>
        this.lotterieLib.newThrow(t).currentSeed
      ));
  }

  public getParticipation(throwLib : any,participationId : number) : Observable<Object> {
    return from(throwLib.methods.getParticipation(participationId).call())
      .pipe(map(p => this.lotterieLib.newParticipation(p)));
  }

  public getAllRevealedLog(throwLib : any, stBlock : any) : Observable<Array<ThrowEventRevealed>> {
    return from(throwLib.getPastEvents('Revealed',{
          fromBlock : stBlock
        })).pipe(map((evs : any) =>
         evs.map(ev => 
         new ThrowEventRevealed(
           parseInt(ev.returnValues.participationId),
           ev.returnValues.hiddenSeed,
           ev.returnValues.concealedSeed
         ))
        ));
  }
  public getFinalWinner(throwLib : any,ix : number) : Observable<[boolean,string,string]> {
    return from(throwLib.methods.getWinner(ix).call());
  }

  public calcPhase(lotterieThrowLib : any): Observable<number> {
    return from(lotterieThrowLib.methods.getPhase().call()).pipe(
      map((i : string) => parseInt(i))
    );
  }

  public launchWinningParamCreation(
    nbWinners : number,
    nbWinnerMinRatio : number, 
    distribution : number,
    ) : Observable<boolean> {
    return this.currentAccount().pipe(
         flatMap(account => 
          from(this.lotterieLib.lotterie.methods.addWinningParams(nbWinners,nbWinnerMinRatio,distribution)
             .send({from : account}))),
          map(r => {
            console.log("Transaction pass for : " + r['transactionHash']);
            return true;
          }),
          catchError((err : Error) => {
            console.error(err);
            return of(false);
          })
        );
    }

    public initThrow(
      nbErc721 : number,
      params : string,
      paramsPhaseId : string,
      initWinValue : string,
      ownerMargin : number,
      authorContractMargin : number,
      authorDappMargin : number,
      throwerMargin : number
    ) : Observable<Object> {
      var call = this.lotterieLib.lotterie.methods.initThrow(
        nbErc721,
        params,
        paramsPhaseId,
        ownerMargin,
        authorContractMargin,
        authorDappMargin,
        throwerMargin);
      return from(call.estimateGas({from: this.web3.eth.defaultAccount, value: initWinValue})
        .then((gas) => 
                   call.send({from: this.web3.eth.defaultAccount, gas: gas, value: initWinValue})));
    }
    public initThrow223(
      waiting : boolean,
      tokaddress : string,
      nbErc721 : number,
      params : string,
      paramsPhaseId : string,
      ownerMargin : number,
      authorContractMargin : number,
      authorDappMargin : number,
      throwerMargin : number
    ) : Observable<Object> {
      var call = this.lotterieLib.lotterie.methods.initThrow223(
        waiting,
        nbErc721,
        tokaddress,
        params,
        paramsPhaseId,
        ownerMargin,
        authorContractMargin,
        authorDappMargin,
        throwerMargin);
      return from(call.estimateGas({from: this.web3.eth.defaultAccount})
        .then((gas) => 
                   call.send({from: this.web3.eth.defaultAccount, gas: gas})));
    }
    public initThrow20(
      waiting : boolean,
      tokaddress : string,
      nbErc721 : number,
      params : string,
      paramsPhaseId : string,
      ownerMargin : number,
      authorContractMargin : number,
      authorDappMargin : number,
      throwerMargin : number
    ) : Observable<Object> {
      var call = this.lotterieLib.lotterie.methods.initThrow20(
        waiting,
        nbErc721,
        tokaddress,
        params,
        paramsPhaseId,
        ownerMargin,
        authorContractMargin,
        authorDappMargin,
        throwerMargin);
      return from(call.estimateGas({from: this.web3.eth.defaultAccount})
        .then((gas) => 
                   call.send({from: this.web3.eth.defaultAccount, gas: gas})));
    }

   public newParticipation(
      throwLib : any,
      bidValue : string,
      hiddenSeed : string 
    ) : Observable<Object> {
      var call = throwLib.methods.bid(hiddenSeed);
      return from(call.estimateGas({from: this.web3.eth.defaultAccount, value: bidValue})
        .then((gas) => 
                   call.send({from: this.web3.eth.defaultAccount, gas: gas + 2000, value: bidValue})));
                   // TODO check why I need those additional 2k
    }

   public newParticipation223(
      throwLib : any,
      tokenLib : any,
      bidValue : string,
      hiddenSeed : string 
    ) : Observable<Object> {
      var data = throwLib.methods.bid(hiddenSeed).encodeABI();
      var call = tokenLib.methods.transfer(throwLib._address, bidValue, data);
      return from(call.estimateGas({from: this.web3.eth.defaultAccount})
        .then((gas) => {
          return call.send({from: this.web3.eth.defaultAccount, gas: gas + 2000, value : 0});
        }));
    }
   public initPrize223(
      throwLib : any,
      tokenLib : any,
      bidValue : string
    ) : Observable<Object> {
      var data = throwLib.methods.initPrize().encodeABI();
      var call = tokenLib.methods.transfer(throwLib._address, bidValue, data);
      return from(call.estimateGas({from: this.web3.eth.defaultAccount})
        .then((gas) => {
          return call.send({from: this.web3.eth.defaultAccount, gas: gas + 2000, value : 0});
        }));
    }
 
    public allowBid20(
      throwLib : any,
      tokenLib : any,
      bidValue : string,
    ) : Observable<Object> {

      var call1 = tokenLib.methods.approve(throwLib._address, bidValue);
      return from(
        call1.estimateGas({from: this.web3.eth.defaultAccount})
        .then((gas) => {
          return call1.send({from: this.web3.eth.defaultAccount, gas: gas + 2000, value : 0});
        })
      );
    }
 
    public newParticipation20(
      throwLib : any,
      tokenLib : any,
      hiddenSeed : string 
    ) : Observable<Object> {

      var call2 = throwLib.methods.bid(hiddenSeed);
      return from(
        call2.estimateGas({from: this.web3.eth.defaultAccount})
        .then((gas) => {
          // there is especially big errors in evaluate so start with big gas value
          return call2.send({from: this.web3.eth.defaultAccount, gas: Math.floor(gas * 1.2), value : 0});
        })
      );
    }
    public initPrize20(
      throwLib : any,
      tokenLib : any
    ) : Observable<Object> {

      var call2 = throwLib.methods.initPrize();
      return from(
        call2.estimateGas({from: this.web3.eth.defaultAccount})
        .then((gas) => {
          return call2.send({from: this.web3.eth.defaultAccount, gas: Math.floor(gas * 1.2), value : 0});
        })
      );
    }
 
    public revealParticipation(
      throwLib : any,
      participationId : number,
      revealedSeed : string 
    ) : Observable<Object> {
      var call = throwLib.methods.revealParticipation(participationId,this.lotterieLib.web3.utils.toHex(revealedSeed));
      return from(call.estimateGas({from: this.web3.eth.defaultAccount})
        .then((gas) => 
                   call.send({from: this.web3.eth.defaultAccount, gas: gas + 2000 })));
    }
 

  // win position in revealed winners (does not mean we win but we can win if nobody cashout)
  public currentWinPosition(
    throwLib : any,
    participationId : number 
  ) : Observable<number> {
    return from(throwLib.methods.currentIxAmongWinners(participationId).call());
  }
    
  // get position of a participation at phase end or 0 if not in cashout wins
  public positionAtPhaseEnd(
    throwLib : any,
    participationId : number 
  ) : Observable<number> {
    return from( throwLib.methods.positionAtPhaseEnd(participationId).call());
  }

  getNextTimeTreshold(throwLib : any): Observable<Date> {
    return from( throwLib.methods.getNextTimeTreshold().call() ).pipe(
      map((t : string) => {
        if (t === "0") {
          return null;
        }
        return new Date(parseInt(t) * 1000);
      })
    );

  }

public registerWin(
  throwLib : any,
  participationId : number,
  startix : number,
  nbWinner : number
) : Observable<Object> {
  var call = throwLib.methods.cashOut(participationId,startix);
  // TODO put absolute position in participation when calculated and use this action only from absolute otherwhise add action to calculate absolute from logs!!! (manual trigger)
  // then replace nbWinner here in gas cost calculation (TODO method from log in lotterieService to get position??)
  // TODO log without additional cost and with additional costs
  var possibleAdditionalIteration = nbWinner - (startix + 1);
  var additionalIterCost = 0;
  return from(call.estimateGas({from: this.web3.eth.defaultAccount})
    .then((gas) => 
              call.send({from: this.web3.eth.defaultAccount, gas: gas + 5000 + (additionalIterCost * possibleAdditionalIteration) })));
 }

 public withDrawWin(
     throwLib : any,
    participationId : number 
  ) : Observable<Object> {
    var call = throwLib.methods.withdrawWin(participationId);
    return from(call.estimateGas({from: this.web3.eth.defaultAccount})
      .then((gas) => 
                 call.send({from: this.web3.eth.defaultAccount, gas: gas + 2000 })));
  }
public withDrawAllWin(
     throwLib : any,
    participationId : number 
  ) : Observable<Object> {
    var call = throwLib.methods.withdrawAllWin(participationId);
    return from(call.estimateGas({from: this.web3.eth.defaultAccount})
      .then((gas) => 
                 call.send({from: this.web3.eth.defaultAccount, gas: Math.floor(gas * 1.5) })));
  }
public withDraw721(
     throwLib : any,
    participationId : number 
  ) : Observable<Object> {
    var call = throwLib.methods.withdraw721(participationId);
    return from(call.estimateGas({from: this.web3.eth.defaultAccount})
      .then((gas) => 
                 call.send({from: this.web3.eth.defaultAccount, gas: Math.floor(gas * 1.5) })));
  }




  nbERC721Construct(throwLib: any): Observable<number> {
    return from( throwLib.methods.nbERC721().call() ).pipe(
      map((n: string) => parseInt(n)),
    );
  }
  nbERC721(throwLib: any): Observable<number> {
    return from( throwLib.methods.nbErc721Prizes().call() ).pipe(
      map((n: string) => parseInt(n)),
    );
  }
  waitInitValue(throwLib : any) : Observable<number> {
    return from(throwLib.methods.waitingInitValue().call());
  }
 
  
  getModeThrow(address: string): Observable<[number, string]> {
    return from( this.lotterieLib.web3.eth.call({to : address, data : '0x295a5212'}) ).pipe(
      map((nc: any) => {
        let n = this.lotterieLib.web3.eth.abi.decodeParameters
         ([{"name": "","type": "uint8"},{"name": "","type": "address"}], nc);
        return [parseInt(n[0]),n[1]] as [number, string];}),
    );
  }

  extractPartId(data : string) : string {
        let n = this.lotterieLib.web3.eth.abi.decodeParameters
         (
          [
            {
              "name": "participationId",
              "type": "uint64"
            },
            {
              "name": "bid",
              "type": "uint256"
            }
          ]
           , data);
         return n[0];
  };
  public currentAccount(): Observable<string | Error> {
    if (this.web3.eth.defaultAccount) {
        return of(this.web3.eth.defaultAccount);
    } else {
        return this.getAccounts().pipe(
            tap((accounts: string[]) => {
                if (accounts.length === 0) { throw new Error('No accounts available'); }
            }),
            map((accounts: string[]) => accounts[0]),
            tap((account: string) => this.defaultAccount = account),
            catchError((err: Error) => of(err))
        );
    }
  }

  public pollCurrentAccount(delayms : number): Observable<string | Error> {
    return interval(delayms)
    .pipe(
      flatMap(() => this.getAccounts()),
      tap((accounts: string[]) => {
        if (accounts.length === 0) { throw new Error('No accounts available'); }
      }),
      map((accounts: string[]) => accounts[0]),
      filter(account => this.defaultAccount !== account),
      tap((account: string) => {
        this.defaultAccount = account
      }),
      catchError((err: Error) => of(err))
    );

  }

  private web3 : Web3;

  constructor(
    @Inject(LOTTERIELIB) private lotterieLib
  ) { 
    this.web3 = lotterieLib.web3;
    if (this.lotterieLib.web3.currentProvider.isMetaMask) {
      this.lotterieLib.web3.eth.getBlockNumber().then(nb => this.lastpollblock = nb);
      if (!environment.production) {
        // 1 second poll block
        this.pollBlockMetamask(1000).subscribe(console.log);
      } else {
        // 10 second block poll
        this.pollBlockMetamask(10000).subscribe(console.log);
      }
    }
  }

  private pollBlockMetamask(delayms : number): Observable<number | Error> {
    return interval(delayms)
    .pipe(
      flatMap(() => this.lotterieLib.web3.eth.getBlockNumber()),
      tap((nb: number) => {
        if (this.lastpollblock != null && this.lastpollblock !== nb) {
          for (var p of this.metamaskpoll) {
            if (p.enabled) {
              p.cb(this.lastpollblock + 1, nb);
            }
          }
        }
        this.lastpollblock = nb;
      }),
      filter(a => false),
      catchError((err: Error) => of(err))
    );
  }

  public genNewSeed(): string {
    var buf = new Uint8Array(256/8);
    // warn non portable!!
    window.crypto.getRandomValues(buf);
    console.log(buf);
    var hex = this.lotterieLib.web3.utils.bytesToHex(buf);
    console.log(hex);
    return this.lotterieLib.web3.utils.hexToNumberString(hex);
  }

  // particularily inefficient
  public hideSeed(s : string): string {
    return this.lotterieLib.web3.utils.hexToNumberString(
      this.lotterieLib.calcCommitment(this.lotterieLib.web3.utils.toHex(s)));
  }


}
