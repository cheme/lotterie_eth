import { Component, OnInit, Input } from '@angular/core';
import { Erc721 } from '../erc721';
import { LotterieService } from '../../ethereum/lotterie.service';

@Component({
  selector: 'app-erc721-details',
  templateUrl: './erc721-details.component.html',
  styleUrls: ['./erc721-details.component.css']
})
export class Erc721DetailsComponent implements OnInit {

  @Input() erc : Erc721;
  @Input() disIx : number;

  name : string;
  symbol : string;
  uri : string;
  constructor(
    protected lotterieService : LotterieService,
  ) { }

  ngOnInit() {
    this.lotterieService.getUri(this.erc.tokenAddress,this.erc.tokenId)
    .subscribe(([n,s,u]) => {
      this.uri = u;
      this.name = n;
      this.symbol = s;
    });
  }

}
