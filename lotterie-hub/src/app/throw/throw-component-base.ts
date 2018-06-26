import { Athrow } from "./athrow";
import { OnInit, Input } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { LotterieService } from "../ethereum/lotterie.service";
import { MessageService } from "../message.service";
import { Location } from '@angular/common';

export abstract class ThrowComponentBase implements OnInit {

    @Input() thr : Athrow;

    abstract onInitExtend() : void;

    constructor(
      protected route: ActivatedRoute,
      protected lotterieService: LotterieService,
      protected messageService: MessageService,
      protected location: Location
    ) { }

    ngOnInit(): void {
      const addressstring = this.route.snapshot.paramMap.get('address');
      if (addressstring == null) {
      } else {
          this.lotterieService.getAthrow(addressstring)
          .subscribe(([lib,objThr,objWith]) => {
            this.thr = Athrow.fromObject(addressstring, lib,objThr,objWith);
            this.lotterieService.calcPhase(this.thr.throwLib)
            .subscribe(p => {
              this.thr.calcPhase = p;
              this.onInitExtend();
            });
          });
      }
    }

  goBack(): void {
    this.location.back();
  }

  phaseLabel(i : number) : string {
    return Athrow.phaseLabel(i, this.lotterieService);
  }
  i32ToPercent(i : number) : number {
    //return (i / (2 ** 32)) * 100;
    let v = (i / 4294967296) * 100;
    return parseFloat(v.toFixed(2));

  }
}
