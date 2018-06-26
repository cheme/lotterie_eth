import { Component, OnInit } from '@angular/core';
import { StorageService } from '../../storage.service';
import { MessageService } from '../../message.service';
import { LotterieService } from '../../ethereum/lotterie.service';
import { Athrow } from '../athrow';
import { Participation } from '../participation';
import { Observable, zip } from 'rxjs';
import { map, flatMap } from 'rxjs/operators';


class Entry {
  constructor(
  public participation : Participation,
  public thr : Athrow,
  ) {}
}

@Component({
  selector: 'app-my-board',
  templateUrl: './my-board.component.html',
  styleUrls: ['./my-board.component.css']
})
export class MyBoardComponent implements OnInit {

  constructor(
   protected lotterieService: LotterieService,
   protected messageService: MessageService,
   protected storageService: StorageService
  ) { }

  public participations : [string,number,Observable<Entry>][];
  ngOnInit() {
    this.participations = this.storageService.allParticipations().map(([thrId,pId]) => {
      // TODO local map of throw +calcPhase to avoid a lot of calls
      let ob = this.lotterieService.getAthrow(thrId).pipe(
        flatMap(([lib,objThr,objWith]) => {
            let thr = Athrow.fromObject(thrId, lib,objThr,objWith);
            return zip(
              this.lotterieService.calcPhase(thr.throwLib),
              this.lotterieService.getParticipation(thr.throwLib,pId),
              (cp,ob) => {
                thr.calcPhase = cp;
                let participation = Participation.fromObject(thrId, pId, ob);
                return new Entry(participation,thr); 
              }
            );
        })
      );
      return [thrId,pId,ob] as [string,number,Observable<Entry>];
    });
  }

  public hasParticipation(thrId : string, pId : number) : boolean {
    let ix = this.participations.findIndex((el) => el[1] === pId && el[0] === thrId);
    return ix != -1;
  }

  public removeParticipation(thrId: string, pId : number) {
    this.storageService.removeParticipation(thrId, pId);
    let ix = this.participations.findIndex((el) => el[1] === pId && el[0] === thrId);
    this.participations = this.participations.splice(ix,1);
  }

  /*public addParticipation(thrId : string, pId : number) {
    return this.storageService.addParticipation(thrId, pId);
  }*/

}
