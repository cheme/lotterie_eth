import { Component, OnInit } from '@angular/core';
import { LotterieService } from '../ethereum/lotterie.service'
import BigNumber from 'bignumber.js';
import { Athrow } from '../throw/athrow.js';
import { Observable, zip, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { map, flatMap } from 'rxjs/operators';
import { ScrollDispatcher, CdkScrollable } from '@angular/cdk/scrolling';
import { PageEvent } from '@angular/material';

@Component({
  selector: 'app-throws',
  templateUrl: './throws.component.html',
  styleUrls: ['./throws.component.css']
})
export class ThrowsComponent implements OnInit {

  totalThrows : BigNumber = new BigNumber(0);

  managedThrows$ : Observable<Athrow>[] = [];
test(b) {
  console.log("test " + b);
}
  ngOnInit() {
    this.lotterieService.totalThrows.subscribe((nb) => {
      this.totalThrows = new BigNumber(nb);
      this.totalPagLength = nb;
      this.getThrows(null);
    }); 
    this.lotterieService.observeThrows().subscribe((addresses) => {
      // warning just for testing as it is not concurrency safe : need to call update nb instead
      this.totalThrows = this.totalThrows.plus(1);
      this.totalPagLength += 1;
      this.managedThrows$.push(this.initAthrow(addresses));
    });
  }

  // TODO redundant code to merge with throwbasecomponent? or put in athrow class
  initAthrow(addresses : string) : Observable<Athrow> {
    return zip(
      of(addresses),
      this.lotterieService.getAthrow(addresses),
      (ad,[lib,objectThr,objectWithdr]) => {
        var at =  Athrow.fromObject(ad, lib, objectThr,objectWithdr);
        this.lotterieService.calcPhase(at.throwLib)
        .subscribe(p => {
          at.calcPhase = p
        });
        return at;
      }
    );
  }

  constructor(
    private lotterieService : LotterieService,
    private scroll : ScrollDispatcher,
  ) { }

  ngAfterViewInit(){
    this.scroll.scrolled(100).subscribe(()=>{
      console.log("d"); // TODO check last card position... and infiniscroll (ElementRef.nativeElement.offsetTop)
    })
  }
  totalPagLength = 0;
  pageSize = environment.nbThrowsShow;
  pageIndex = 0;
  pageSizeOptions = [5,10,20,50];

  getThrows(pageEvent : PageEvent | null): void {
    if (pageEvent) {
      this.pageSize = pageEvent.pageSize;
      this.pageIndex = pageEvent.pageIndex;
    }
    var id = new BigNumber(this.totalThrows).minus(this.pageIndex * this.pageSize);
    this.managedThrows$ = [];
    for (var iter = this.pageSize; iter > 0; --iter) {
      if (id.isGreaterThan(0)) {
          id = id.minus(1);
          this.managedThrows$.push(
            this.lotterieService.getThrowAddress(id).pipe(
              flatMap((add) => this.initAthrow(add)))
          );
      }
    }
  }
}
