import { Component, OnInit, Input } from '@angular/core';
import { Athrow } from '../athrow';
import { LotterieService } from '../../ethereum/lotterie.service';
import { MessageService } from '../../message.service';
import BigNumber from 'bignumber.js';
import { StorageService } from '../../storage.service';

@Component({
  selector: 'app-participation-new',
  templateUrl: './participation-new.component.html',
  styleUrls: ['./participation-new.component.css']
})
export class ParticipationNewComponent implements OnInit {

  @Input() athrow : Athrow;

  loaded : boolean = false;

  minBidValue : BigNumber;
  bidValue : string; // TODO direct conv to bn from html
  hiddenSeed : string;
  revealedSeed : string;



  constructor(
    protected lotterieService : LotterieService,
    protected messageService : MessageService,
    protected storageService : StorageService
  ) { }

  ngOnInit() {
    this.lotterieService.getLotterieMinValue(this.athrow.paramsId).subscribe((nb) => {
      this.minBidValue = nb;
      this.bidValue = nb.toString();
      this.loaded = true;
    });
  
  }
  regenerateSeeds() {
      this.revealedSeed = this.lotterieService.genNewSeed();
      this.hiddenSeed = this.lotterieService.hideSeed(this.revealedSeed);
  }

  invalidBidValue() : boolean {
    return new BigNumber(this.bidValue).isLessThan(this.minBidValue);
  }

  newParticipation() {
    this.regenerateSeeds();
    if (this.invalidBidValue()) {
      this.messageService.add("Invalid bid for participation");// TODO message error
    }
    let hiddenS = this.hiddenSeed;
    let revealedS = this.revealedSeed;
    this.storageService.writeVal(hiddenS,revealedS).then(() => {
      this.messageService.add("writen seeds");
      this.lotterieService.newParticipation(
        this.athrow.throwLib,
        new BigNumber(this.bidValue),
        hiddenS
      ).subscribe((recpt) => {
        this.messageService.add("New bid emitted");
        // For bid index maybe just subscribe on new bid from log (get it from log) and push it to my bids
      })
    })
  }

}
