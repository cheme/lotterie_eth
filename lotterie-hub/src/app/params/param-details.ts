import { Component, OnInit, Input } from '@angular/core';
import BigNumber from 'bignumber.js';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { MessageService } from '../message.service';
import { LotterieService } from '../ethereum/lotterie.service';
import { Lotterieparam } from './lotterieparam';
import { Observable } from 'rxjs';

export abstract class ParamDetailsComponentBase<PARAM> implements OnInit {
    ngOnInit(): void {
      this.getParam();
    }

    @Input() mode : string
    @Input() param : PARAM
    constructor(
      protected route: ActivatedRoute,
      protected lotterieService: LotterieService,
      protected messageService: MessageService,
      protected location: Location
    ) { }
  abstract newParam(id: BigNumber, object: any): PARAM;
  abstract getParamAt(id : BigNumber) : Observable<any>;
//  abstract getRoute() : ActivatedRoute;
  getParam() : void {
    const idstring = this.route.snapshot.paramMap.get('id');
    if (idstring == null) {
    } else {
      const id = new BigNumber(idstring);
      this.mode = "view";
      this.getParamAt(id)
        .subscribe(wp => this.param = this.newParam(id,wp));
    }
  }
  inline() : boolean {
    return this.mode === "inline";
  }
  view() : boolean {
    return this.mode === "view";
  }
 
  goBack(): void {
    this.location.back();
  }
}
