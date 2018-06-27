import { Component, OnInit, OnDestroy } from '@angular/core';
import { ThrowComponentBase } from '../throw-component-base';
import { ActivatedRoute } from '@angular/router';
import { LotterieService, ThrowEventPhase, ThrowEventRevealed, ThrowEventNewParticipation, ThrowEventWin } from '../../ethereum/lotterie.service';
import { MessageService } from '../../message.service';
import { Location } from '@angular/common';
import { Participation } from '../participation';
import { of, zip, forkJoin, Subject, Observable, timer } from 'rxjs';
import { map, flatMap } from 'rxjs/operators';
import { Bignumber } from '../../eth-components/bignumber';
import { Athrow } from '../athrow';
import { StorageService } from '../../storage.service';

@Component({
  selector: 'app-throw-details',
  templateUrl: './throw-details.component.html',
  styleUrls: ['./throw-details.component.css']
})
export class ThrowDetailsComponent extends ThrowComponentBase implements OnDestroy {

 constructor(
    route: ActivatedRoute,
    lotterieService: LotterieService,
    messageService: MessageService,
    storageService: StorageService,
    location: Location
  ) {
    super(route,lotterieService,messageService,storageService,location);
  }

  sortedWinners : Array<Participation> = null;

  subParticipations : Subject<boolean> = new Subject();

  subThrowEvent : Subject<ThrowEventNewParticipation | ThrowEventRevealed> = new Subject();

  reloadParticipations() : void {
    this.subParticipations.next(true);
  }
  changedPhase : boolean = false;
  calcPhaseBadge : boolean = false;
  winnersBadge : number = 0;
  participationNbBadge : number = 0;
  participationRevealBadge : number = 0;
  participationValueBadge : number = 0;
  // for simple race condition mgmt init to true
  // : useless possible call to calcPhase on start
  eager : boolean = true;
  maxParticipant : number = null;

  nextPhase : Date = null;

  onInitExtend() : void {
    this.updateSortedWinners();
    if (this.thr.currentPhase === this.lotterieService.phases.Bidding) {
    Athrow.withParam(this.thr,(p) => {
      this.maxParticipant = p.maxParticipant;
    },this.lotterieService);
    Athrow.withParamPhase(this.thr,(pp) => {
      if (pp.participationEndMode === this.lotterieService.participationEndModes.EagerAbsolute
        || pp.participationEndMode === this.lotterieService.participationEndModes.EagerRelative) {
        this.eager = true;
      } else {
        this.eager = false;
      }
    },this.lotterieService);
    }

    this.nextTimeTresholdSub();

    this.lotterieService.observeThrow(this.thr.throwLib).subscribe(thrEvent => {
      if (thrEvent instanceof ThrowEventPhase) {
        this.thr.currentPhase = thrEvent.newPhase;
        this.changedPhase = true;
        this.lotterieService.getNextTimeTreshold(this.thr.throwLib).subscribe(t => {
          this.nextPhase = t;
        });
      } else if (thrEvent instanceof ThrowEventNewParticipation) {
        this.thr.numberOfBid += 1;
        this.participationNbBadge += 1;
        this.thr.totalBidValue.value = this.thr.totalBidValue.value.plus(new Bignumber(thrEvent.bid));
        this.thr.totalBidValue = Object.create(this.thr.totalBidValue); // To trigger refresh
        this.participationValueBadge += 1;
        Athrow.withParam(this.thr,p => {
          if (this.eager && this.thr.numberOfBid >= p.maxParticipant) {
            // do not switch directly : call meth
            this.recalcPhase();
          }
        },this.lotterieService);

        // send to app-participations
        this.subThrowEvent.next(thrEvent)
      } else if (thrEvent instanceof ThrowEventRevealed) {
        this.thr.numberOfRevealParticipation += 1;
        this.participationRevealBadge += 1;
        if (this.thr.numberOfRevealParticipation >= this.thr.numberOfBid) {
          this.recalcPhase();
        }
        // send to app-participations
        this.subThrowEvent.next(thrEvent)

      } else if (thrEvent instanceof ThrowEventWin) {
        // impact total claimed value and status of win so <participation-details>

        // almost useless : kiss -> badge the sorted win panel and recalc it
        this.winnersBadge += 1;
        this.updateSortedWinners();
      }
      this.recalcPhase();
    });
  }
  ngOnDestroy() : void {
    this.lotterieService.unObserveThrow(this.thr.address);
  }
  updateSortedWinners() {
    if (this.thr.calcPhase == 3) {
      // when calcPhase is 3 we do not have additional reveal (this might change with other phase switching)
      // so we calc it only once (could not change afterwards)
      if (this.sortedWinners == null) {
//        this.calcWinnersFromParticipations();
        this.calcWinnersFromParticipationsLog();
      }
    } else if (this.thr.calcPhase > 3) {
        this.getWinnersFromParticipations();
    }
  }

  private calcWinnersFromParticipationsLog() {
    let finalSeed = this.thr.currentSeed;
    let nbParticipation = this.thr.numberOfBid;
    this.lotterieService.getAllRevealedLog(this.thr.throwLib,this.thr.blockNumber.toString()).subscribe(
      logs => {

        for (let l of logs) {
          l.score = this.lotterieService.calcScore(finalSeed,l.hiddenSeed);
        }
        logs = logs.sort((p1,p2) => ThrowDetailsComponent.compareArr(p1.score, p2.score,p1.participationId,p2.participationId));
        Athrow.withWinningParam(this.thr,(p) => {
          let nbWinners = Math.min(this.thr.numberOfBid * p.nbWinnerMinRatio / 100,p.nbWinners);

          if (logs.length > nbWinners) {
            logs = logs.slice(0,nbWinners);
          }
          let obsArray = [];
          for (let l of logs) {
            obsArray.push(this.lotterieService.getParticipation(this.thr.throwLib,l.participationId).pipe(
              map(p => {
                let participation = Participation.fromObject(this.thr.address, l.participationId, p);
                participation.score = l.score; 
                return participation;
              })
            ));
          }
    forkJoin(obsArray).subscribe(participations => {
      this.sortedWinners = participations;
      // TODO switch sortedWinners to array of observable and add pagination
    })

        },this.lotterieService);
      }
    );
  }
  // xtra costy get all participation then sort them : use only for debugging
  private calcWinnersFromParticipations() {
    let finalSeed = this.thr.currentSeed;
    let nbParticipation = this.thr.numberOfBid;
    let obsArray = [];
    for (let i = 0; i < nbParticipation; ++i) {
      obsArray.push(
        this.lotterieService.getParticipation(this.thr.throwLib,i)
          .pipe(map((p) => {
            let participation = Participation.fromObject(this.thr.address, i, p);
            if (participation.state > 0) {
              participation.score = this.lotterieService.calcScore(finalSeed,participation.revealedSeed);
            }
            return participation;
      }))
    );
    }

    forkJoin(obsArray).subscribe(participations => {
      participations = participations.filter(p => p.state > 0);
      participations = participations.sort((p1,p2) => ThrowDetailsComponent.compareArr(p1.score, p2.score,p1.participationId,p2.participationId));
      this.sortedWinners = participations;
    })

  }
  private static compareArr(p1 : number[], p2 : number[], add1 : number, add2 : number) : number {
    for (var i = 0; i < p1.length; ++i) {
      if (p1[i] < p2[i]) {
        return 1;
      } else if (p1[i] > p2[i]) {
        return -1;
      }
    }
    // first participation prevails in case of equality
    if (add1 < add2) {
      return -1;
    } else if (add1 > add2) {
      return 1;
    }
    return 0;
  }

  // TODO move algo (loop) to lotterieService
  private getWinnersFromParticipations() {
    this.lotterieService.getNbFinalWinners(this.thr.throwLib).subscribe((nbWinners) => {
      let obsArray = [];
      for (let i = 0; i < nbWinners; ++i) {
        obsArray.push(
        this.lotterieService.getFinalWinner(this.thr.throwLib,i)
          .pipe(
            flatMap((p) => {
              return zip(
              of(p),
              this.lotterieService.getParticipation(this.thr.throwLib,p[1]),
              ([withdrawned, pid, score], part) => {
              let participation = Participation.fromObject(this.thr.address, pid, part);
              participation.score = this.lotterieService.stringToBytes(score);
              participation.wintowithdraw = !withdrawned;
              return participation;
              }
            )})
          )
        );
      }


      forkJoin(obsArray).subscribe(participations => {
        this.sortedWinners = participations;
      })

    });

  }
  private recalcPhase() {
    let thisS = this;
    this.lotterieService.calcPhase(this.thr.throwLib).subscribe(newPhase => {
      if (thisS.thr.calcPhase !== newPhase) {
        thisS.thr.calcPhase = newPhase;
        if (newPhase == 3) {
          this.lotterieService.fetchCurrentSeed(this.thr.throwLib).pipe(
            map((currentSeed : string) => {
              this.thr.currentSeed = currentSeed;
              this.updateSortedWinners();
            })
          );
        }
        if (newPhase == 4) {
          this.updateSortedWinners();
        }
        thisS.calcPhaseBadge = true;
        thisS.nextTimeTresholdSub();
      }
    });
  }
  private nextTimeTresholdSub() {
    let thisS = this;
    this.lotterieService.getNextTimeTreshold(this.thr.throwLib).subscribe(function(t) {
      if (t != null)  {
      thisS.nextPhase = t;
      let nextCheck = new Date (t.getTime() + this.storageService.environment.delayBlockDate * 1000);
      timer(nextCheck).subscribe(() => {
        thisS.messageService.add("Switch phase timer event happen on " + thisS.thr.address);
        thisS.recalcPhase();
      });
      }
    });
  }


}
