import { Component, Input } from '@angular/core';
import { ThrowComponentBase } from '../throw-component-base';
import { ActivatedRoute } from '@angular/router';
import { LotterieService } from '../../ethereum/lotterie.service';
import { MessageService } from '../../message.service';
import { Location } from '@angular/common';
import { Athrow } from '../athrow';

@Component({
  selector: 'app-throw-details-small',
  templateUrl: './throw-details-small.component.html',
  styleUrls: ['./throw-details-small.component.css']
})
export class ThrowDetailsSmallComponent extends ThrowComponentBase {

  onInitExtend() : void { }
  
  constructor(
    route: ActivatedRoute,
    lotterieService: LotterieService,
    messageService: MessageService,
    location: Location
  ) {
    super(route,lotterieService,messageService,location);
  }

}
