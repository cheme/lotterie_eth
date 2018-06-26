import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LotterieService, ThrowEventRevealed } from '../../ethereum/lotterie.service';
import { MessageService } from '../../message.service';
import { Location } from '@angular/common';
import { Athrow } from '../athrow';
import { Participation } from '../participation';
import { StorageService } from '../../storage.service';
import { flatMap, map, filter } from 'rxjs/operators';
import { zip, of, Subject } from 'rxjs';


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
  @Input() newPart : boolean = false;

  @Input() subPart : Subject<ThrowEventRevealed>;
  @Input() participation : Participation;
  @Input() onThrow : boolean = true;

  changeState = false;
  
  constructor(
    protected route: ActivatedRoute,
    protected lotterieService: LotterieService,
    protected messageService: MessageService,
    protected storageService: StorageService,
    protected location: Location
  ) { }

  private inStorage : Boolean = null;
  addToStorage() {
    this.storageService.addParticipation(this.throwId,this.participation.participationId);
    this.inStorage = new Boolean(true);
  }
  removeFromStorage() {
    this.storageService.removeParticipation(this.throwId,this.participation.participationId);
    this.inStorage = new Boolean(false);
  }
  isInStorage() : boolean {
    if (this.inStorage == null) {
      this.inStorage = new Boolean(this.storageService.hasParticipation(this.throwId,this.participation.participationId));
    }
    return this.inStorage.valueOf();
  }
  checkRevealedSeed(revSead : string) : boolean {
    return revSead != null && this.participation.seed === this.lotterieService.hideSeed(revSead)
  }
  ngOnInit() {
    if (this.throwLib == null) {
      this.throwLib = this.lotterieService.newThrowLib(this.throwId);
    }
    if (this.subPart) {
      this.subPart.subscribe((b) => {
        if (b) {
          this.gotAnEvent(b);
        }
      });
      this.subPart = null;
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


  gotAnEvent(ev : ThrowEventRevealed) {
    console.log("get ev");
    if (this.participation.state == 0) {
      this.participation.state = 1;
      this.changeState = true;
      this.participation.revealedSeed = ev.hiddenSeed;
      this.participation.hiddenSeed = ev.concealedSeed;
    }
  }
  phaseLabel(i : number) : string {
    return Athrow.phaseLabel(i, this.lotterieService);
  }
  stateLabel(i : number) : string {
    return Participation.stateLabel(i, this.lotterieService);
  }
}
