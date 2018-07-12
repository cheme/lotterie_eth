//import { ChangeDetectionStrategy } from '@angular/core';
import { Component, OnInit, Input } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { MessageService } from '../../message.service';
import { LotterieService } from '../../ethereum/lotterie.service';
import { Phaseparam } from '../phaseparam';
import { ParamDetailsComponentBase } from '../param-details';
import { Observable } from 'rxjs';
import { EthId } from '../../eth-components/eth-id';

@Component({
  selector: 'app-phaseparam-detail',
  templateUrl: './phaseparam-detail.component.html',
  styleUrls: ['./phaseparam-detail.component.css']
})
export class PhaseparamDetailComponent extends ParamDetailsComponentBase<Phaseparam> {

  newParam(id: EthId, object: any): Phaseparam {
    return Phaseparam.fromObject(id,object);
  }
  getParamAt(id: EthId): Observable<any> {
    return this.lotterieService.getPhaseParam(id.toString());
  }

  constructor(
    route: ActivatedRoute,
    lotterieService: LotterieService,
    messageService: MessageService,
    location: Location
  ) {
     super(route,lotterieService,messageService,location);
   }

   coutMode(ix : number) : string {
     let m = this.lotterieService.cashoutEndModes;
     for(let k in m) {
       if (m[k] == ix) {
         return k;
       }
     }
     return "Invalid mode";
   }
   partMode(ix : number) : string {
     let m = this.lotterieService.participationEndModes;
     for(let k in m) {
       if (m[k] == ix) {
         return k;
       }
     }
     return "Invalid mode";
   }

   public dispDateDuration(ixMode : number, value : number) : string {
     if (value == 0) {
       return "Max";
     }
     if (ixMode == this.lotterieService.cashoutEndModes.Absolute) {
       return this.dispDate(value);
     }
     return this.dispDur(value);
   }
   public dispDateDurationPart(ixMode : number, value : number) : string {
     if (value == 0) {
       return "Max";
     }
     if (ixMode == this.lotterieService.participationEndModes.Absolute || ixMode == this.lotterieService.participationEndModes.EagerAbsolute) {
       return this.dispDate(value);
     }
     return this.dispDur(value);
   }
   dispDur(value : number) : string {
    var rem = value;
    var days = Math.floor(rem / 86400);
    rem = rem % 86400;
    var hours = Math.floor(rem / 3600);
    rem = rem % 3600;
    var min = Math.floor(rem / 60);
    var sec = rem % 60;
    var disp = "" + days + " days " + hours + ":" + min + ":" + sec;
    return disp;
   }
   dispDate(value : number) : string {
    var date = new Date(value * 1000);
    return date.toISOString();
   }
 
}
