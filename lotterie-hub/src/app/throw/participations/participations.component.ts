import { Component, OnInit, Input } from '@angular/core';
import { Athrow } from '../athrow';
import { Subject } from 'rxjs';
import { ThrowEventNewParticipation, ThrowEventRevealed } from '../../ethereum/lotterie.service';
import { PageEvent } from '@angular/material';
import { StorageService } from '../../storage.service';

@Component({
  selector: 'app-participations',
  templateUrl: './participations.component.html',
  styleUrls: ['./participations.component.css']
})
export class ParticipationsComponent implements OnInit {

  @Input() athrow : Athrow;
  @Input() subscribeP : Subject<boolean>;
  @Input() subscribeThrowEvent : Subject<ThrowEventNewParticipation | ThrowEventRevealed>;

  range : Array<[number,boolean, Subject<ThrowEventRevealed>]>;
  constructor(protected storageService : StorageService) { }

  ngOnInit() {
    this.initRange();
    if (this.subscribeP) {
      this.subscribeP.subscribe((b) => {
        if (b) {
          this.initRange();
        }
      });
      this.subscribeP = null;
    }
    if (this.subscribeThrowEvent) {
      this.subscribeThrowEvent.subscribe((b) => {
        if (b) {
          this.gotAnEvent(b);
        }
      });
      this.subscribeThrowEvent = null;
    }
  }

  gotAnEvent(ev : ThrowEventNewParticipation | ThrowEventRevealed) {
      if (ev instanceof ThrowEventNewParticipation) {
        this.totalPagLength += 1;
        // display it at start of range
        this.range.push([ev.participationId,true, new Subject()]);
      } else if (ev instanceof ThrowEventRevealed) {
        for ( let [ix,_a, sub] of this.range) {
          if (ix == ev.participationId) {
            sub.next(ev);
          }
        }
      }
  }
  initRange(pageEvent? : PageEvent ): void {
    if (pageEvent) {
      this.pageSize = pageEvent.pageSize;
      this.pageIndex = pageEvent.pageIndex;
    }
 
    this.totalPagLength = this.athrow.numberOfBid;
    let last = this.totalPagLength - (this.pageIndex * this.pageSize);
    if (last == 0) {
      this.range = Array(0);
      return;
    }
    let nb = Math.min(this.pageSize, last);
    var res = Array(nb);
    for (var i = 0; i < nb; ++i) {
      res[i] = [last - 1 - i,false, new Subject()];
    }
    this.range = res;
  }

  // pagination
  totalPagLength = 0;
  pageSize = this.storageService.environment.nbParticipationsShow;
  pageIndex = 0;
  pageSizeOptions = [3,5,10,15];


}
