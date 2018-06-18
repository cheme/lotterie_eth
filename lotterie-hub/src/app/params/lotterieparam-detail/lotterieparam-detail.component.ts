//import { ChangeDetectionStrategy } from '@angular/core';
import { Component, OnInit, Input } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { MessageService } from '../../message.service';
import { LotterieService } from '../../ethereum/lotterie.service';
import { Lotterieparam } from '../lotterieparam';
import { ParamDetailsComponentBase } from '../param-details';
import { Observable } from 'rxjs';
import { EthId } from '../../eth-components/eth-id';

@Component({
  selector: 'app-lotterieparam-detail',
  templateUrl: './lotterieparam-detail.component.html',
  styleUrls: ['./lotterieparam-detail.component.css']
})
export class LotterieparamDetailComponent extends ParamDetailsComponentBase<Lotterieparam> {

  newParam(id: EthId, object: any): Lotterieparam {
    return Lotterieparam.fromObject(id,object);
  }
  getParamAt(id: EthId): Observable<any> {
    return this.lotterieService.getLotterieParam(id.toString());
  }
//  @Input() mode : string
//  @Input() lotterieparam : Lotterieparam
  constructor(
    route: ActivatedRoute,
    lotterieService: LotterieService,
    messageService: MessageService,
    location: Location
  ) {
    super(route,lotterieService,messageService,location);
  }

}
