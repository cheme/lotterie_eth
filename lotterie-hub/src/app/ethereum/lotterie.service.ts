import { Injectable, Inject, OnInit } from '@angular/core';
import BigNumber from 'bignumber.js';
import Web3 from 'web3';
import { Observable, bindNodeCallback, of, from, interval, bindCallback, zip } from 'rxjs';
import { map, flatMap, tap, catchError, filter, take } from 'rxjs/operators';
import { WEB3 } from './tokens';
import { LOTTERIELIB } from './tokens';
//import { isDevMode } from '@angular/core';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class LotterieService {

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
  private metamaskpoll : Function [] = [];
  public test(): string {
    return this.lotterieLib.calcCommitment("0x123456789");
  }  

  private observeEvent(eventname : string, cb) {
    if (this.lotterieLib.web3.currentProvider.isMetaMask) {
      return Observable.create ( observer => {

      var pollCall = (startBlock,endBlock) => {
        this.lotterieLib.lotterie.getPastEvents(eventname,{
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
      this.metamaskpoll.push(pollCall);
       
      });
    }
    return Observable.create( observer => {
      this.lotterieLib.lotterie.events[eventname](
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
  public getAccounts(): Observable<string[]> {
    return from(this.web3.eth.getAccounts());
  }
  get defaultAccount(): string { return this.web3.eth.defaultAccount; }
  set defaultAccount(account: string) { this.web3.eth.defaultAccount = account; }

  get totalThrows(): Observable<number> { 
    return from(this.lotterieLib.lotterie.methods.getTotalNbThrow().call());
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

  public getWinningParam(ix : BigNumber): Observable<Object> {
    return from(this.lotterieLib.lotterie.methods.getWinningParams(ix).call()).pipe(
      map(o => this.lotterieLib.newWinningParams(o))
    );
  }

  public getPhaseParam(ix : BigNumber): Observable<Object> {
    return from(this.lotterieLib.lotterie.methods.getPhaseParams(ix).call()).pipe(
      map(o => this.lotterieLib.newPhaseParams(o))
    );
  }

  public getLotterieParam(ix : BigNumber): Observable<Object> {
    return from(this.lotterieLib.lotterie.methods.getParams(ix).call()).pipe(
      map(o => this.lotterieLib.newLotterieParams(o))
    );
  }

  // TODO remove...?  or put a cache
  public getLotterieMinValue(ix : BigNumber): Observable<BigNumber> {
    return from(this.lotterieLib.lotterie.methods.getParams(ix).call()).pipe(
      map(o => new BigNumber(this.lotterieLib.newLotterieParams(o)['minBidValue']))
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



  public getThrowAddress(ix : BigNumber): Observable<string> {
    return from(this.lotterieLib.lotterie.methods.getThrowAddress(ix).call());
  }

  public newThrowLib(addres : string) : any {
      return new this.lotterieLib.web3.eth.Contract(this.lotterieLib.lotterieThrowAbi, addres);
  }
  public getAthrow(addres : string): Observable<[any,any,any]> {
    var lotterieThrowLib = this.newThrowLib(addres);
    return zip(
      of(lotterieThrowLib),
      from(lotterieThrowLib.methods.getThrow().call())
        .pipe(map(t => this.lotterieLib.newThrow(t))),
      from(lotterieThrowLib.methods.getThrowWithdrawInfo().call())
        .pipe(map(t => this.lotterieLib.newThrowWithdraws(t)))
    );
  }

  public getParticipation(throwLib : any,participationId : number) : Observable<Object> {
    return from(throwLib.methods.getParticipation(participationId).call())
      .pipe(map(p => this.lotterieLib.newParticipation(p)));
  }

  public getFinalWinner(throwLib : any,ix : number) : Observable<[boolean,number,string]> {
    return from(throwLib.methods.getWinner(ix).call());
  }

  public calcPhase(lotterieThrowLib : any): Observable<number> {
    return from(lotterieThrowLib.methods.getPhase().call());
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
      params : BigNumber,
      paramsPhaseId : BigNumber,
      initWinValue : BigNumber,
      ownerMargin : number,
      authorContractMargin : number,
      authorDappMargin : number,
      throwerMargin : number
    ) : Observable<Object> {
      var call = this.lotterieLib.lotterie.methods.initThrow(
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
   public newParticipation(
      throwLib : any,
      bidValue : BigNumber,
      hiddenSeed : string 
    ) : Observable<Object> {
      var call = throwLib.methods.bid(hiddenSeed);
      return from(call.estimateGas({from: this.web3.eth.defaultAccount, value: bidValue})
        .then((gas) => 
                   call.send({from: this.web3.eth.defaultAccount, gas: gas + 2000, value: bidValue})));
                   // TODO check why I need those additional 2k
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
      return from( throwLib.methods.currentIxAmongWinners(participationId).call());
    }
    
    // get position of a participation at phase end or 0 if not in cashout wins
    public positionAtPhaseEnd(
       throwLib : any,
      participationId : number 
    ) : Observable<number> {
      return from( throwLib.methods.positionAtPhaseEnd(participationId).call());
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
            p(this.lastpollblock + 1, nb);
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
