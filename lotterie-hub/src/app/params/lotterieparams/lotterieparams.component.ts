import { Component, OnInit } from '@angular/core';
import { Lotterieparam } from '../lotterieparam';
import BigNumber from 'bignumber.js';
import { Observable, of, zip } from 'rxjs';
import { LotterieService } from '../../ethereum/lotterie.service';
import { MessageService } from '../../message.service';
import { map } from 'rxjs/operators';
import { ParamsComponentBase } from '../params';


@Component({
  selector: 'app-lotterieparams',
  templateUrl: './lotterieparams.component.html',
  styleUrls: ['./lotterieparams.component.css']
})
export class LotterieparamsComponent extends ParamsComponentBase<Lotterieparam> {
  constructor(
     lotterieService: LotterieService,
     messageService: MessageService,
  ) {
    super(lotterieService,messageService);
  }
  getNb(): Observable<string> {
    return this.lotterieService.getNbLotterieParams();
  }
  getParam(id: BigNumber): Observable<any> {
    return this.lotterieService.getLotterieParam(id);
  }
  newParam(id: BigNumber, object: any): Lotterieparam {
    return Lotterieparam.fromObject(id,object);
  }
}
/*
export class LotterieparamsComponent implements OnInit {
  params$ : Observable<Lotterieparam>[];

  constructor(
    private lotterieService: LotterieService,
    private messageService: MessageService,
  ) { }

  getLotterieParams(): void {
    this.lotterieService.getNbLotterieParams().subscribe(nb => {
      var id = new BigNumber(nb);
      var res = [];
      for (var iter = 10; iter > 0; --iter) {
        if (id.isGreaterThan(0)) {
          id = id.minus(1);
          res.push(
            zip(
              of(id),
              this.lotterieService.getLotterieParam(id),
              (ido,ps) => {
                console.log(ido);
                return Lotterieparam.fromObject(ido,ps)
              }
            ));
        }
      }

      this.params$ = res;
    });
  }
  ngOnInit() {
    this.getLotterieParams();
  }

}*/