import { Component, OnInit } from '@angular/core';
import { ParticipationNewComponent } from '../participation-new/participation-new.component';
import { LotterieService } from '../../ethereum/lotterie.service';
import { MessageService } from '../../message.service';
import { StorageService } from '../../storage.service';

@Component({
  selector: 'app-erc-value',
  templateUrl: './erc-value.component.html',
  styleUrls: ['./erc-value.component.css']
})
export class ErcValueComponent extends ParticipationNewComponent {

  constructor(
    protected lotterieService : LotterieService,
    protected messageService : MessageService,
    protected storageService : StorageService
  ) { 
    super(lotterieService,messageService,storageService);
    this.withMinValue = false; // TODO make correct inheritance to avoid this switch
 }
 
  initErcValue() {
    if (this.athrow.bidType == 0) {
      throw "invalid bid type";
    } else if (this.athrow.bidType == 1) {
      // 223
      this.lotterieService.initPrize223(
        this.athrow.throwLib,
        this.athrow.tokenLib,
        this._val.fullrepr
      ).subscribe(recpt => {
        this.messageService.add("init Erc223 value success");
        this.athrow.waitingInitvalue = 2;
        if (this.athrow.nbErc721Construct == 0) {
          this.athrow.currentPhase = 1;
          this.athrow.calcPhase = 1;
        } 
 
      });
    } else if (this.athrow.bidType == 2) {

      this.lotterieService.allowBid20(
        this.athrow.throwLib,
        this.athrow.tokenLib,
        this._val.fullrepr
      ).subscribe((ev : any) => {
        this.messageService.add("bidd allowed from erc20, starting effective bid");
        this.lotterieService.initPrize20(
          this.athrow.throwLib,
          this.athrow.tokenLib
        ).subscribe(recpt => {
          this.messageService.add("init Erc20 value success");
          this.athrow.waitingInitvalue = 2;
          if (this.athrow.nbErc721Construct == 0) {
            this.athrow.currentPhase = 1;
            this.athrow.calcPhase = 1;
          } 
        });
        
      });

    };
  }
  
}
