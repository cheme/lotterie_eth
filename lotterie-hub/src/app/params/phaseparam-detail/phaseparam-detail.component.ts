//import { ChangeDetectionStrategy } from '@angular/core';
import { Component, OnInit, Input } from '@angular/core';
import BigNumber from 'bignumber.js';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { MessageService } from '../../message.service';
import { LotterieService } from '../../ethereum/lotterie.service';
import { Phaseparam } from '../phaseparam';
import { ParamDetailsComponentBase } from '../param-details';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-phaseparam-detail',
  templateUrl: './phaseparam-detail.component.html',
  styleUrls: ['./phaseparam-detail.component.css']
})
export class PhaseparamDetailComponent extends ParamDetailsComponentBase<Phaseparam> {

  newParam(id: BigNumber, object: any): Phaseparam {
    return Phaseparam.fromObject(id,object);
  }
  getParamAt(id: BigNumber): Observable<any> {
    return this.lotterieService.getPhaseParam(id);
  }

  constructor(
    route: ActivatedRoute,
    lotterieService: LotterieService,
    messageService: MessageService,
    location: Location
  ) {
     super(route,lotterieService,messageService,location);
   }

}
