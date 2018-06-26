import { Component, OnInit, Input } from '@angular/core';
import { Athrow } from '../athrow';
import { LotterieService } from '../../ethereum/lotterie.service';
import { MessageService } from '../../message.service';
import { StorageService } from '../../storage.service';
import { EthValue } from '../../eth-components/eth-value';

@Component({
  selector: 'app-participation-new',
  templateUrl: './participation-new.component.html',
  styleUrls: ['./participation-new.component.css']
})
export class ParticipationNewComponent implements OnInit {

  @Input() athrow : Athrow;

  loaded : boolean = false;

  minBidValue : EthValue;
  hiddenSeed : string;
  revealedSeed : string;

  static emptyTel = EthValue.empty();
  
  set val(t : EthValue) {
    // avoid infinite loop by set only for change value
    if (t != null && (t.count !== this._val.count || t.unit !== this._val.unit)) {
      console.log("set " + t.toString());
      this._val = t;
    }
  }
  get val() : EthValue {
    return this._val;
  }
  _val : EthValue = EthValue.empty();

  constructor(
    protected lotterieService : LotterieService,
    protected messageService : MessageService,
    protected storageService : StorageService
  ) { }

  ngOnInit() {
    this.lotterieService.getLotterieMinValue(this.athrow.paramsId.toString()).subscribe((nb) => {
      this.minBidValue = EthValue.fromString(nb.toString());
      this._val = this.minBidValue;
      this.loaded = true;
    });
  
  }
  regenerateSeeds() {
      this.revealedSeed = this.lotterieService.genNewSeed();
      this.hiddenSeed = this.lotterieService.hideSeed(this.revealedSeed);
  }

  invalidBidValue() : boolean {
    return (!this.minBidValue || this._val.value.isLessThan(this.minBidValue.value));
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
        this._val.fullrepr,
        hiddenS
      ).subscribe((ev : any) => {

        let partId = ev.events.NewParticipation.returnValues.participationId;
        this.messageService.add("New bid emitted : " + partId);
        this.storageService.addParticipation(this.athrow.address, partId); 

      })
    })
  }

}
