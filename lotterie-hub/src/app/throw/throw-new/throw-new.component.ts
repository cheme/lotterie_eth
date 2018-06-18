import { Component, OnInit, Input } from '@angular/core';
import { MessageService } from '../../message.service';
import { LotterieService } from '../../ethereum/lotterie.service';
import { environment } from '../../../environments/environment';
import { Location } from '@angular/common';
import { EthId } from '../../eth-components/eth-id';

@Component({
  selector: 'app-throw-new',
  templateUrl: './throw-new.component.html',
  styleUrls: ['./throw-new.component.css']
})
export class ThrowNewComponent implements OnInit {

  @Input() params : EthId;
  @Input() paramsPhaseId : EthId;

  initWinValue : string;
  ownerMargin : number = environment.defaultOwnerMargin;
  authorContractMargin : number = environment.defaultAuthorContractMargin;
  authorDappMargin : number = environment.defaultAuthorDappMargin;
  throwerMargin : number = environment.defaultThrowerMargin;

  newThrow() {

    this.lotterieService.initThrow(
      this.params.toString(),
      this.paramsPhaseId.toString(),
      this.initWinValue,
      this.ownerMargin,
      this.authorContractMargin,
      this.authorDappMargin,
      this.throwerMargin
    ).subscribe((recpt) => {
      console.log("InitThrow sucess" + recpt);
      this.messageService.add("InitThrow sucess + TODO link it");
    });

  }

  constructor(
    private lotterieService: LotterieService,
    private messageService: MessageService,
    private location: Location
  ) { }
 
  ngOnInit() {
  }
  goBack(): void {
    this.location.back();
  }

}
