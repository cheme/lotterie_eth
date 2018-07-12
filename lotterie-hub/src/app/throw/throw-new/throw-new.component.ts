import { Component, OnInit, Input } from '@angular/core';
import { MessageService } from '../../message.service';
import { LotterieService } from '../../ethereum/lotterie.service';
import { Location } from '@angular/common';
import { EthId } from '../../eth-components/eth-id';
import { MatSliderChange } from '@angular/material';
import { EthValue, EthUnits } from '../../eth-components/eth-value';
import { StorageService } from '../../storage.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-throw-new',
  templateUrl: './throw-new.component.html',
  styleUrls: ['./throw-new.component.css']
})
export class ThrowNewComponent implements OnInit {

  @Input() params : EthId;
  @Input() paramsPhaseId : EthId;

  public units = EthUnits;
  initWinValue : EthValue;
  ownerMargin : number;
  authorContractMargin : number;
  authorDappMargin : number;
  throwerMargin : number;

  throwMode : number = 0;
  _tokenAddress : string = null;
  nb721 : number = 0;

  validtoken : boolean = false;

  tokenLib : any = null;
  yourTokenBalance : EthValue;

  withInitialValue : boolean = false;

  get tokenAddress() : string {
    return this._tokenAddress;
  }
  set tokenAddress(tkadd : string) {
    this.validtoken = false;
    this.yourTokenBalance = null;
    if (tkadd !== this._tokenAddress && tkadd.length == 42) {
      this._tokenAddress = tkadd;
      var q;
      if (this.throwMode == 1) {

        q = this.lotterieService.getInfo223(tkadd);

//        this.tokenLib = this.lotterieService.newErc223Lib(tkadd);
      } else if (this.throwMode == 2) {
        q = this.lotterieService.getInfo20(tkadd);
 //       this.tokenLib = this.lotterieService.newErc20Lib(tkadd);
      }
      q.subscribe(([tlib,tname,tsymbol,tdecs])=> {
        this.tokenLib = tlib;
        this.lotterieService.getErcBalance(this.tokenLib).subscribe(bal => {
          // having bal is enough validation
          this.validtoken = true;
          let tok = EthValue.fromString(bal);
          if (tname) {
            tok.setTokenInfos(tname,tsymbol,tdecs);
          } else {
            tok.undefinedToken();
          }
          this.yourTokenBalance = tok;
 
        });

      });

    }

  }
  newThrow() {
    var query;
  if (this.throwMode == 0) {
    query = this.lotterieService.initThrow(
      this.nb721,
      this.params.toString(),
      this.paramsPhaseId.toString(),
      this.initWinValue.fullrepr,
      this.ownerMargin,
      this.authorContractMargin,
      this.authorDappMargin,
      this.throwerMargin
    );
  } else if (this.validtoken && this.throwMode == 1) {
    // TODO replace by right form validation
    query = this.lotterieService.initThrow223(
      this.withInitialValue,
      this._tokenAddress,
      this.nb721,
      this.params.toString(),
      this.paramsPhaseId.toString(),
      this.ownerMargin,
      this.authorContractMargin,
      this.authorDappMargin,
      this.throwerMargin
    );
  } else if (this.validtoken && this.throwMode == 2) {
    query = this.lotterieService.initThrow20(
      this.withInitialValue,
      this._tokenAddress,
      this.nb721,
      this.params.toString(),
      this.paramsPhaseId.toString(),
      this.ownerMargin,
      this.authorContractMargin,
      this.authorDappMargin,
      this.throwerMargin
    );
  }
    
  query.subscribe((recpt : any) => {
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
