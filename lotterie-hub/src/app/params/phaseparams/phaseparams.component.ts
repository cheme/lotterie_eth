import { Component, OnInit } from '@angular/core';
import { Phaseparam } from '../phaseparam';
import { Observable, of, zip } from 'rxjs';
import { LotterieService } from '../../ethereum/lotterie.service';
import { MessageService } from '../../message.service';
import { map } from 'rxjs/operators';
import { ParamsComponentBase } from '../params';
import { EthId } from '../../eth-components/eth-id';


@Component({
  selector: 'app-phaseparams',
  templateUrl: './phaseparams.component.html',
  styleUrls: ['./phaseparams.component.css']
})
export class PhaseparamsComponent extends ParamsComponentBase<Phaseparam> {
  constructor(
     lotterieService: LotterieService,
     messageService: MessageService,
  ) {
    super(lotterieService,messageService);
  }
  getNb(): Observable<string> {
    return this.lotterieService.getNbPhaseParams();
  }
  getParam(id: EthId): Observable<any> {
    return this.lotterieService.getPhaseParam(id.toString());
  }
  newParam(id: EthId, object: any): Phaseparam {
    return Phaseparam.fromObject(id,object);
  }
}
/*
export class PhaseparamsComponent implements OnInit {
  params$ : Observable<Phaseparam>[];

  constructor(
    private lotterieService: LotterieService,
    private messageService: MessageService,
  ) { }

  // TODO replace by generic method(TODO check generic in typescript)
  getPhaseParams(): void {
    this.lotterieService.getNbPhaseParams().subscribe(nb => {
      var id = new Bignumber(nb);
      var res = [];
      for (var iter = 10; iter > 0; --iter) {
        if (id.isGreaterThan(0)) {
          id = id.minus(1);
          res.push(
            zip(
              of(id),
              this.lotterieService.getPhaseParam(id),
              (ido,ps) => {
                console.log(ido);
                return Phaseparam.fromObject(ido,ps)
              }
            ));
        }
      }

      this.params$ = res;
    });
  }
  ngOnInit() {
    this.getPhaseParams();
  }

}*/