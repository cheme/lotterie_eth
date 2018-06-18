//import { ChangeDetectionStrategy } from '@angular/core';
import { Component, OnInit, Input } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { MessageService } from '../../message.service';
import { LotterieService } from '../../ethereum/lotterie.service';
import { Winningparam } from '../winningparam';
import { ParamDetailsComponentBase } from '../param-details';
import { Observable } from 'rxjs';
import { EthId } from '../../eth-components/eth-id';

@Component({
//  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-winningparam-detail',
  templateUrl: './winningparam-detail.component.html',
  styleUrls: ['./winningparam-detail.component.css']
})
export class WinningparamDetailComponent extends ParamDetailsComponentBase<Winningparam> {
  
  newParam(id: EthId, object: any): Winningparam {
    return Winningparam.fromObject(id,object);
  }
  getParamAt(id: EthId): Observable<any> {
    return this.lotterieService.getWinningParam(id.toString());
  }

  constructor(
    route: ActivatedRoute,
    lotterieService: LotterieService,
    messageService: MessageService,
    location: Location
  ) { 
     super(route,lotterieService,messageService,location);
  }
  createNew() : void {
    this.mode = "create";
  }
  create() : boolean {
    return this.mode === "create";
  }

  launchCreate() : void {
    // assert nb winners < 255
    // assert ration is 0 to 100
    // assert distribution in distrib
    // -> all assert in lotterie serrvice
    this.lotterieService.launchWinningParamCreation(
      this.param.nbWinners,
      this.param.nbWinnerMinRatio,
      this.param.distribution,
    ).subscribe(ok => {
      if (ok) {
        this.messageService.add("A Winning param creation succeed");
      } else {
        this.messageService.add("A Winning param creation failed");
      }
    }); // TODO proper error/create mgmt 

    // TODO route to params list + message success
  }
}
