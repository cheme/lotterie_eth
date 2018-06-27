import { Component, OnInit } from '@angular/core';
import { Lotterieparam } from '../lotterieparam';
import { Observable, of, zip } from 'rxjs';
import { LotterieService } from '../../ethereum/lotterie.service';
import { MessageService } from '../../message.service';
import { map } from 'rxjs/operators';
import { ParamsComponentBase } from '../params';
import { EthId } from '../../eth-components/eth-id';
import { StorageService } from '../../storage.service';


@Component({
  selector: 'app-lotterieparams',
  templateUrl: './lotterieparams.component.html',
  styleUrls: ['./lotterieparams.component.css']
})
export class LotterieparamsComponent extends ParamsComponentBase<Lotterieparam> {
  constructor(
     lotterieService: LotterieService,
     messageService: MessageService,
     storageService: StorageService,
  ) {
    super(lotterieService,messageService,storageService);
  }
  getNb(): Observable<string> {
    return this.lotterieService.getNbLotterieParams();
  }
  getParam(id: EthId): Observable<any> {
    return this.lotterieService.getLotterieParam(id.toString());
  }
  newParam(id: EthId, object: any): Lotterieparam {
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
      var id = new Bignumber(nb);
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