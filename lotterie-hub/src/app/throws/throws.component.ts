import { Component, OnInit } from '@angular/core';
import { LotterieService } from '../ethereum/lotterie.service'

@Component({
  selector: 'app-throws',
  templateUrl: './throws.component.html',
  styleUrls: ['./throws.component.css']
})
export class ThrowsComponent implements OnInit {

  // TODO switch to BN
  totalThrows : number = 0;

  ngOnInit() {
    this.lotterieService.totalThrows.subscribe((nb) => this.totalThrows = nb); 
    this.lotterieService.observeThrows().subscribe((addresses) => {
      // warning just for testing as it is not concurrency safe : need to call update nb instead
      this.totalThrows += 1
    }); 
  }
  constructor(
    private lotterieService : LotterieService
  ) { }
}
