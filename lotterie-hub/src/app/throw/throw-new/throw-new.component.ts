import { Component, OnInit, Input } from '@angular/core';
import { MessageService } from '../../message.service';
import { LotterieService } from '../../ethereum/lotterie.service';
import { Location } from '@angular/common';
import { EthId } from '../../eth-components/eth-id';
import { MatSliderChange } from '@angular/material';
import { EthValue } from '../../eth-components/eth-value';
import { StorageService } from '../../storage.service';

@Component({
  selector: 'app-throw-new',
  templateUrl: './throw-new.component.html',
  styleUrls: ['./throw-new.component.css']
})
export class ThrowNewComponent implements OnInit {

  @Input() params : EthId;
  @Input() paramsPhaseId : EthId;

  initWinValue : EthValue;
  ownerMargin : number;
  authorContractMargin : number;
  authorDappMargin : number;
  throwerMargin : number;

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
      this.storageService.addFavorite(thAdd);
    });

  }

  constructor(
    private lotterieService: LotterieService,
    private messageService: MessageService,
    private storageService: StorageService,
    private location: Location
  ) {
  this.ownerMargin = this.storageService.environment.defaultOwnerMargin;
  this.authorContractMargin = this.storageService.environment.defaultAuthorContractMargin;
  this.authorDappMargin = this.storageService.environment.defaultAuthorDappMargin;
  this.throwerMargin = this.storageService.environment.defaultThrowerMargin;


   }
 
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
