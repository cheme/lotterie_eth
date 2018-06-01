import { Injectable, Inject, OnInit } from '@angular/core';
import BigNumber from 'bignumber.js';
import Web3 from 'web3';
import { Observable, bindNodeCallback, of, from, interval, bindCallback } from 'rxjs';
import { map, flatMap, tap, catchError, filter, take } from 'rxjs/operators';
import { WEB3 } from './tokens';
import { LOTTERIELIB } from './tokens';
//import { isDevMode } from '@angular/core';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class LotterieService {

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

  constructor(@Inject(LOTTERIELIB) private lotterieLib) { 
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



}
