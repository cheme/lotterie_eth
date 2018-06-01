import { Component, OnInit } from '@angular/core';
import { LotterieService } from '../ethereum/lotterie.service'

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {
  private account : string = 'undefined';

  private test : string = 'nope';
  constructor(
    private lotterieService : LotterieService
  ) { }
  ngOnInit() {
    this.test = this.lotterieService.test();
    // TODO manage hs error case
    this.lotterieService.currentAccount().subscribe((hs) => this.account = hs.toString());
    this.lotterieService.pollCurrentAccount(1500).subscribe((hs) => this.account = hs.toString());
  }
 
/*  ngOnInit() {
    this.lotterieService.currentAccount().subscribe(function(hs) { 
      this.account = hs 
    });
  }*/

}
