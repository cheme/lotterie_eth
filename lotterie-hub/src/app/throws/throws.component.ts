import { Component, OnInit, OnDestroy } from '@angular/core';
import { LotterieService } from '../ethereum/lotterie.service'
import { Athrow } from '../throw/athrow.js';
import { Observable, zip, of } from 'rxjs';
import { map, flatMap } from 'rxjs/operators';
//import { ScrollDispatcher, CdkScrollable } from '@angular/cdk/scrolling';
import { PageEvent } from '@angular/material';
import { Bignumber } from '../eth-components/bignumber';
import { StorageService } from '../storage.service';

@Component({
  selector: 'app-throws',
  templateUrl: './throws.component.html',
  styleUrls: ['./throws.component.css']
})
export class ThrowsComponent implements OnInit, OnDestroy {
  totalThrows : Bignumber = new Bignumber(0);

  managedThrows$ : Observable<Athrow>[] = [];
test(b) {
  console.log("test " + b);
}
ngOnInit() {
    this.lotterieService.totalThrows.subscribe((nb) => {
      this.totalThrows = new Bignumber(nb);
      this.totalPagLength = nb;
      this.getThrows(null);
    }); 
    this.lotterieService.observeThrows().subscribe((addresses) => {
      // warning just for testing as it is not concurrency safe : need to call update nb instead
      this.totalThrows = this.totalThrows.plus(new Bignumber(1));
      this.totalPagLength += 1;
      this.managedThrows$.unshift(this.initAthrow(addresses));
    });
  }
  ngOnDestroy(): void {
    this.lotterieService.unObserveThrows();
  }


  initAthrow(addresses : string) : Observable<Athrow> {
    return Athrow.initAthrow(addresses, this.lotterieService);
  }

  constructor(
    private lotterieService : LotterieService,
    private storageService : StorageService,
//    private scroll : ScrollDispatcher,
  ) {

     this.pageSize = this.storageService.environment.nbThrowsShow;
   }

  ngAfterViewInit(){
/*    this.scroll.scrolled(100).subscribe(()=>{
      console.log("d"); // TODO check last card position... and infiniscroll (ElementRef.nativeElement.offsetTop)
    })*/
  }
  totalPagLength = 0;
  pageSize;
  pageIndex = 0;
  pageSizeOptions = [5,10,20,50];

  getThrows(pageEvent : PageEvent | null): void {
    if (pageEvent) {
      this.pageSize = pageEvent.pageSize;
      this.pageIndex = pageEvent.pageIndex;
    }
    var id = this.totalThrows.minus(new Bignumber(this.pageIndex * this.pageSize));// TODO pageIndex to bn
    this.managedThrows$ = [];
    for (var iter = this.pageSize; iter > 0; --iter) {
      if (id.isGreaterThan(Bignumber.zero)) {
          id = id.minus(Bignumber.one);
          this.managedThrows$.push(
            this.lotterieService.getThrowAddress(id.toString()).pipe(
              flatMap((add) => this.initAthrow(add)))
          );
      }
    }
  }
}
