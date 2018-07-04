import { Component, OnInit, Input } from '@angular/core';
import { Athrow } from '../athrow';
import { LotterieService } from '../../ethereum/lotterie.service';
import { MessageService } from '../../message.service';
import { StorageService } from '../../storage.service';
import { EthValue, EthUnits, UTokenUnits } from '../../eth-components/eth-value';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-participation-new',
  templateUrl: './participation-new.component.html',
  styleUrls: ['./participation-new.component.css']
})
export class ParticipationNewComponent implements OnInit {

  @Input() athrow : Athrow;
  public units : any = null;


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
  _val : EthValue;

  constructor(
    protected lotterieService : LotterieService,
    protected messageService : MessageService,
    protected storageService : StorageService
  ) { 
 }
  private updateValUnit (val) {
    if (this.athrow.bidType > 0) {
      if (this.athrow.tokenName) {
        val.setTokenInfos(this.athrow.tokenName,this.athrow.tokenSymbol,this.athrow.tokenDecimals);

      } else {
        val.undefinedToken();
      }
    }
  }
  protected withMinValue = true;
  ngOnInit() {
    if (!this.athrow.bidType || this.athrow.bidType == 0) {
      this.units = EthUnits;
    } else if (this.athrow.tokenName) {
      this.units = EthValue.buildUnit(this.athrow.tokenName,this.athrow.tokenDecimals);
    } else {
      this.units = UTokenUnits;
    }
    var v = EthValue.empty();
    this.updateValUnit(v);
    this._val = v;
 
    if (this.withMinValue) {
    this.lotterieService.getLotterieMinValue(this.athrow.paramsId.toString()).subscribe((nb) => {
      var v = EthValue.fromString(nb.toString());
      this.updateValUnit(v);
      this.minBidValue = v;
      this._val = this.minBidValue;
    });
    }
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
    var q;
    if (this.athrow.bidType == 0) {
      q = this.lotterieService.newParticipation(
        this.athrow.throwLib,
        this._val.fullrepr,
        hiddenS
      );
      this.newParticipationInternal(q,hiddenS,revealedS);
    } else if (this.athrow.bidType == 1) {
      // 223
      q = this.lotterieService.newParticipation223(
        this.athrow.throwLib,
        this.athrow.tokenLib,
        this._val.fullrepr,
        hiddenS
      );
      this.newParticipationInternal(q,hiddenS,revealedS);

    } else if (this.athrow.bidType == 2) {

      this.lotterieService.allowBid20(
        this.athrow.throwLib,
        this.athrow.tokenLib,
        this._val.fullrepr
      ).subscribe((ev : any) => {
        this.messageService.add("bidd allowed from erc20, starting effective bid");
        q = this.lotterieService.newParticipation20(
          this.athrow.throwLib,
          this.athrow.tokenLib,
          hiddenS
        );
        this.newParticipationInternal(q,hiddenS,revealedS);
      });

    };
  }
  
  newParticipationInternal(q,hiddenS,revealedS) {
    this.storageService.writeVal(hiddenS,revealedS).then(() => {
      this.messageService.add("writen seeds");
      q.subscribe((ev : any) => {
        let partId = ev.events.NewParticipation.returnValues.participationId;
        this.messageService.add("New bid emitted : " + partId);
        this.storageService.addParticipation(this.athrow.address, partId); 
      })
    })
  }


}
