import { Component, OnInit, Input } from '@angular/core';
import { MessageService } from '../../message.service';
import { LotterieService } from '../../ethereum/lotterie.service';
import { environment } from '../../../environments/environment';
import { Location } from '@angular/common';
import { EthId } from '../../eth-components/eth-id';
import { MatSliderChange } from '@angular/material';
import { EthValue } from '../../eth-components/eth-value';

@Component({
  selector: 'app-throw-new',
  templateUrl: './throw-new.component.html',
  styleUrls: ['./throw-new.component.css']
})
export class ThrowNewComponent implements OnInit {

  @Input() params : EthId;
  @Input() paramsPhaseId : EthId;

  initWinValue : EthValue;
  ownerMargin : number = environment.defaultOwnerMargin;
  authorContractMargin : number = environment.defaultAuthorContractMargin;
  authorDappMargin : number = environment.defaultAuthorDappMargin;
  throwerMargin : number = environment.defaultThrowerMargin;

  newThrow() {

    this.lotterieService.initThrow(
      this.params.toString(),
      this.paramsPhaseId.toString(),
      this.initWinValue.fullrepr,
      this.ownerMargin,
      this.authorContractMargin,
      this.authorDappMargin,
      this.throwerMargin
    ).subscribe((recpt : any) => {
      let thAdd = recpt.events.NewThrow.returnValues.throwAddress;
      console.log("InitThrow sucess" + thAdd);
      this.messageService.add("InitThrow sucess : " + thAdd);
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
  static i32ToPercent(i : number) : number {
    //return (i / (2 ** 32)) * 100;
    let p = (i / 4294967296) * 100;
    return parseInt(p.toFixed(0));


  }
  percentOM(value: number | null) : string {
    if (!value) {
      return "0";
    }
    return (ThrowNewComponent.i32ToPercent(value) + '%');
  }
  changeOM(ev: MatSliderChange) {
    this.ownerMargin = ev.value;
  }
  changeACM(ev: MatSliderChange) {
    this.authorContractMargin = ev.value;
  }
  changeADM(ev: MatSliderChange) {
    this.authorDappMargin = ev.value;
  }
  changeTM(ev: MatSliderChange) {
    this.throwerMargin = ev.value;
  }
}
