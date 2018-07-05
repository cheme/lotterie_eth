import { Component, OnInit, Input } from '@angular/core';
import { Athrow } from '../athrow';
import { LotterieService } from '../../ethereum/lotterie.service';
import { MessageService } from '../../message.service';

@Component({
  selector: 'app-add-erc721',
  templateUrl: './add-erc721.component.html',
  styleUrls: ['./add-erc721.component.css']
})
export class AddErc721Component implements OnInit {

  @Input() athrow : Athrow;

  _tokenAddress : string = null;
  get tokenAddress() : string {
    return this._tokenAddress;
  }
  set tokenAddress(tkadd : string) {
    if (tkadd !== this._tokenAddress) {
      this._tokenAddress = tkadd;
      this.isYourToken = false;
      this.tokenName = null;
      if (this._tokenAddress.length == 42) {
        this.lotterieService.isYour721(this._tokenAddress,this._tokenId)
      .subscribe(([v,name]) => {
        this.isYourToken = v;
        this.tokenName = name;
      });
 
      }
    }
  }


  _tokenId : string;
  get tokenId() : string {
    return this._tokenId;
  }
  set tokenId(tkadd : string) {
    if (tkadd !== this._tokenId) {
      this._tokenId = tkadd;
      this.isYourToken = false;
      if (this._tokenAddress && this._tokenAddress.length == 42) {
      this.lotterieService.isYour721(this._tokenAddress,this._tokenId)
      .subscribe(([v,name]) => {
        console.log("d");
        this.isYourToken = v;
        this.tokenName = name;
      });
      }
    }
  }


  isYourToken : boolean = false;
  tokenName : string;
  constructor(
    protected lotterieService : LotterieService,
    protected messageService : MessageService,
  ) { }

  ngOnInit() {
  }

  public addToken() {
    let ta = this._tokenAddress;
    let ti = this._tokenId;
    this.lotterieService.addErc721(this.athrow.throwLib,ta,ti).subscribe(r => {
      console.log("tt");
      this.messageService.add(ta +  "erc 721 nb " + ti + " added");
      this.isYourToken = false;
      this.athrow.nbErc721 += 1;
      if (this.athrow.nbErc721 == this.athrow.nbErc721Construct) {
        this.athrow.nbErc721Construct = 0;
        if (this.athrow.waitingInitvalue != 1) {
          this.athrow.calcPhase = 1;
          this.athrow.currentPhase = 1;
        }
      }
    });
  }
}
