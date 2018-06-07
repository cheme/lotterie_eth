import { Component, OnInit } from '@angular/core';
import BigNumber from 'bignumber.js';
import { Observable, of, zip } from 'rxjs';
import { LotterieService } from '../ethereum/lotterie.service';
import { MessageService } from '../message.service';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';


export abstract class ParamsComponentBase<PARAM> implements OnInit {
  params$ : Observable<PARAM>[];

  constructor(
    protected lotterieService: LotterieService,
    protected messageService: MessageService,
  ) { }
   
  abstract newParam(id: BigNumber, object: any): PARAM;
  // method name for getnb param // TODO replace by the actual method
  abstract getNb() : Observable<string>;
  // method name for get param at ix
  abstract getParam(id : BigNumber) : Observable<any>;
  // TODO replace by generic method(TODO check generic in typescript)
  getParams(): void {
    this.getNb().subscribe(nb => {
      var id = new BigNumber(nb);
      var res = [];
      for (var iter = environment.nbParamsShow; iter > 0; --iter) {
        if (id.isGreaterThan(0)) {
          id = id.minus(1);
          res.push(
            zip(
              of(id),
              this.getParam(id),
              (ido,ps) => {
                console.log(ido);
                return this.newParam(ido,ps)
              }
            ));
        }
      }

      this.params$ = res;
    });
  }
  ngOnInit() {
    this.getParams();
  }

}