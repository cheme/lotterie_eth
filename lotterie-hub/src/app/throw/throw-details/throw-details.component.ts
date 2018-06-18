import { Component, OnInit, OnDestroy } from '@angular/core';
import { ThrowComponentBase } from '../throw-component-base';
import { ActivatedRoute } from '@angular/router';
import { LotterieService, ThrowEventPhase, ThrowEventRevealed, ThrowEventNewParticipation, ThrowEventWin } from '../../ethereum/lotterie.service';
import { MessageService } from '../../message.service';
import { Location } from '@angular/common';
import { Participation } from '../participation';
import { of, zip, forkJoin, Subject } from 'rxjs';
import { map, flatMap } from 'rxjs/operators';
import { Bignumber } from '../../eth-components/bignumber';

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
    location: Location
  ) {
    super(route,lotterieService,messageService,location);
  }

  sortedWinners : Array<Participation> = null;

  subParticipations : Subject<boolean> = new Subject();
  reloadParticipations() : void {
    this.subParticipations.next(true);
  }
  changedPhase : boolean = false;
  participationNbBadge : number = 0;
  participationValueBadge : number = 0;

  onInitExtend() : void {
    this.updateSortedWinners();
    this.lotterieService.observeThrow(this.thr.throwLib).subscribe(thrEvent => {
      if (thrEvent instanceof ThrowEventPhase) {
        this.thr.currentPhase = thrEvent.newPhase;
        this.changedPhase = true;
      } else if (thrEvent instanceof ThrowEventNewParticipation) {
        this.thr.numberOfBid += 1;
        this.participationNbBadge += 1;
        this.thr.totalBidValue.value = this.thr.totalBidValue.value.plus(new Bignumber(thrEvent.bid));
        this.thr.totalBidValue = Object.create(this.thr.totalBidValue); // To trigger refresh
        this.participationValueBadge += 1;
        // TODO refresh <app-participations>
      } else if (thrEvent instanceof ThrowEventRevealed) {
        this.thr.numberOfRevealParticipation += 1;
        // TODO refresh <app-participations> targetted with ThrowEventRevealed (should give observable to child)
      } else if (thrEvent instanceof ThrowEventWin) {
        // impact total claimed value and status of win so <participation-details>

        // almost useless : kiss -> badge the sorted win panel and recalc it 
        // TODO badge sortedwiners
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
        this.calcWinnersFromParticipations();
      }
    } else if (this.thr.calcPhase == 4) {
        this.getWinnersFromParticipations();
    }
  }

  private calcWinnersFromParticipations() {
    // xtra costy get all participation TODO switch to log usage to get sorted then query
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
  recalcPhase() {
      // TODO update calcPhase!!

  }


}
