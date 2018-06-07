import { Component, OnInit, Input } from '@angular/core';
import BigNumber from 'bignumber.js';
import { ActivatedRoute } from '@angular/router';
import { LotterieService } from '../../ethereum/lotterie.service';
import { MessageService } from '../../message.service';
import { Location } from '@angular/common';
import { Athrow } from '../athrow';
import { Participation } from '../participation';
import { StorageService } from '../../storage.service';
import { flatMap, map, filter } from 'rxjs/operators';
import { zip, of } from 'rxjs';


@Component({
  selector: 'app-participation-detail',
  templateUrl: './participation-detail.component.html',
  styleUrls: ['./participation-detail.component.css']
})
export class ParticipationDetailComponent implements OnInit {

  @Input() throwLib : any;
  @Input() throwId : string;
  @Input() throwState : number;
  @Input() participationId : number;

  @Input() participation : Participation;

  onThrow : boolean = false;

  constructor(
    protected route: ActivatedRoute,
    protected lotterieService: LotterieService,
    protected messageService: MessageService,
    protected storageService: StorageService,
    protected location: Location
  ) { }

  checkRevealedSeed(revSead : string) : boolean {
    return revSead != null && this.participation.seed === this.lotterieService.hideSeed(revSead)
  }
  ngOnInit() {
    if (this.throwLib == null) {
      this.throwLib = this.lotterieService.newThrowLib(this.throwId);
    } else {
      this.onThrow = true;
    }
    if (this.participation == null) {
    this.lotterieService.getParticipation(this.throwLib,this.participationId)
    .subscribe((p) => {
      this.participation = Participation.fromObject(this.throwId, this.participationId, p);
      if (this.participation.state == 0) {
        this.storageService.readVal(this.participation.seed).then((revSead) => {
          if (this.checkRevealedSeed(revSead)) {
            this.participation.revealedSeed = revSead;
          } else {
            console.error("invalid seed stored at " + this.participation.seed);
          }
        })
      }
      // TODO if throwState == null : init from lotterieservice and then subscribe on lotterie state change
      // -> first have it running of throw page
    });
    } else {
      this.participationId = this.participation.participationId;
    }

  }

  public revealParticipation() {
    if (this.checkRevealedSeed(this.participation.revealedSeed)) { // Redundant check (if revealedSeed is init it is ok)
      this.lotterieService.revealParticipation(this.throwLib,this.participation.participationId,this.participation.revealedSeed);
    } else {
      console.error("Wrong seed");
    }
  }

  public registerForWin() {
    this.lotterieService.getNbWinners(this.throwLib).pipe(
      flatMap(nbwin => zip(
        of(nbwin),
        this.lotterieService.currentWinPosition(this.throwLib, this.participation.participationId),
        (nbwin,startix) => {
        if (startix < nbwin) {
          this.lotterieService.registerWin(this.throwLib,this.participation.participationId,startix,nbwin);
        } else {
          this.messageService.add("No need to call register, current win position " + (startix + 1) + " is not in win range : " + nbwin);
        }

      }))

    ).subscribe()
  }
  public withdrawWin() {
      this.lotterieService.positionAtPhaseEnd(this.throwLib,this.participation.participationId).pipe(
        filter(position => {
          if (position == 0) {
            this.messageService.add("Cannot withdraw for this participation, not found in winners list");
            return false;
          }
          return true;
        }),
        flatMap(position => this.lotterieService.withDrawWin(this.throwLib,this.participation.participationId))
      ).subscribe();
  }
}
