import { Component, OnInit } from '@angular/core';
import { Observable, of, zip, forkJoin, ObservableInput, Subject } from 'rxjs';
import { LotterieService } from '../ethereum/lotterie.service';
import { MessageService } from '../message.service';
import { map, flatMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { DataSource } from '@angular/cdk/table';
import { CollectionViewer } from '@angular/cdk/collections';
import { PageEvent } from '@angular/material';
import { FnParam } from '@angular/compiler/src/output/output_ast';
import { EthId } from '../eth-components/eth-id';
import { Bignumber } from '../eth-components/bignumber';


export abstract class ParamsComponentBase<PARAM> extends DataSource<PARAM> implements OnInit {
  params$ : Observable<PARAM>[];

  paginatorChange$ = new Subject<void>();

  totalPagLength = 0;
  pageSize = environment.nbParamsShow;
  pageIndex = 0;
  pageSizeOptions = [5,10,20,50];

  connect(collectionViewer: CollectionViewer): Observable<PARAM[]> {
    //if (this.params$ == null) {
      return this.paginatorChange$.pipe(
//        flatMap(()=>
 //      this.getParams().pipe(
        flatMap(() => forkJoin(this.params$))
  //    )     
   //     )

      );

    //} 
    //return forkJoin(this.params$);
  }

  disconnect(collectionViewer: CollectionViewer): void {
  }

  constructor(
    protected lotterieService: LotterieService,
    protected messageService: MessageService,
  ) {
    super();
  }
   
  abstract newParam(id: EthId, object: any): PARAM;
  // method name for getnb param // TODO replace by the actual method
  abstract getNb() : Observable<string>;
  // method name for get param at ix
  abstract getParam(id : EthId) : Observable<any>;
  setPagin(pageEvent : PageEvent) {
    if (pageEvent) {
      this.pageSize = pageEvent.pageSize;
      this.pageIndex = pageEvent.pageIndex;
    }
    this.getParams().subscribe(()=> this.paginatorChange$.next());
  }
  // TODO replace by generic method(TODO check generic in typescript)
  getParams(): Observable<void> {
      return this.getNb().pipe(
      map(nb => {
        this.totalPagLength = parseInt(nb);
      var id = new Bignumber(nb).minus(new Bignumber(this.pageIndex * this.pageSize)); // TODO switch  page index to bn
      var res = [];
      for (var iter = this.pageSize; iter > 0; --iter) {
        if (id.isGreaterThan(Bignumber.zero)) {
          id = id.minus(Bignumber.one);
          res.push(
            zip(
              of(id),
              this.getParam(EthId.fromBN(id)),
              (ido,ps) => {
                console.log(ido);
                return this.newParam(EthId.fromBN(ido),ps)
              }
            ));
        }
      }

      this.params$ = res;
    }));
  }
  ngOnInit() {
    if (this.params$ == null) {
      this.getParams().subscribe(()=> this.paginatorChange$.next());
    }
  }

}