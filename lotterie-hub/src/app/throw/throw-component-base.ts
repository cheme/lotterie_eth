import { Athrow } from "./athrow";
import { OnInit, Input } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { LotterieService } from "../ethereum/lotterie.service";
import { MessageService } from "../message.service";
import { Location } from '@angular/common';
import { StorageService } from "../storage.service";
import { MatSlideToggleChange } from "@angular/material";

export abstract class ThrowComponentBase implements OnInit {

  private _favorite : Boolean = null;
  private initFavorite() {
    if (this._favorite == null) {
      this._favorite = new Boolean(this.storageService.hasFavorite(this.thr.address));
    }
  }
  get favorite() : boolean {
    this.initFavorite();
    return this._favorite.valueOf();
  }
  public changeFavorite(ev : MatSlideToggleChange) {
    if (ev.checked) {
      this.storageService.addFavorite(this.thr.address);
      this._favorite = new Boolean(true);
    } else {
      this.storageService.removeFavorite(this.thr.address);
      this._favorite = new Boolean(false);
    }
  }
    @Input() thr : Athrow;

    abstract onInitExtend() : void;

    constructor(
      protected route: ActivatedRoute,
      protected lotterieService: LotterieService,
      protected messageService: MessageService,
      protected storageService: StorageService,
      protected location: Location
    ) { }

    ngOnInit(): void {
      const addressstring = this.route.snapshot.paramMap.get('address');
      if (addressstring == null) {
      } else {
        Athrow.initAthrow(addressstring, this.lotterieService, (thr) => {
          this.thr = thr;
          this.onInitExtend()
        }).subscribe();
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
