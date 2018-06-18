import { Component, OnInit } from '@angular/core';
import { Winningparam } from '../winningparam';
import { Observable, of, zip } from 'rxjs';
import { LotterieService } from '../../ethereum/lotterie.service';
import { MessageService } from '../../message.service';
import { map } from 'rxjs/operators';
import { ParamsComponentBase } from '../params';
import { DataSource } from '@angular/cdk/table';
import { EthId } from '../../eth-components/eth-id';

@Component({
  selector: 'app-winningparams',
  templateUrl: './winningparams.component.html',
  styleUrls: ['./winningparams.component.css']
})
export class WinningparamsComponent extends ParamsComponentBase<Winningparam> {
  displayedColumns = ['id', 'nbWinners', 'nbWinnerMinRatio', 'distribution'];

  constructor(
     lotterieService: LotterieService,
     messageService: MessageService,
  ) {
    super(lotterieService,messageService);
  }
  getNb(): Observable<string> {
    return this.lotterieService.getNbWinningParams();
  }
  getParam(id: EthId): Observable<any> {
    return this.lotterieService.getWinningParam(id.toString());
  }
  newParam(id: EthId, object: any): Winningparam {
    return Winningparam.fromObject(id,object);
  }
}
/*export class WinningparamsComponent implements OnInit {
  params$ : Observable<Winningparam>[];

  constructor(
    private lotterieService: LotterieService,
    private messageService: MessageService,
  ) { }

  getWinningParams(): void {
    this.lotterieService.getNbWinningParams().subscribe(nb => {
      var id = new Bignumber(nb);
      var res = [];
      for (var iter = 10; iter > 0; --iter) {
        if (id.isGreaterThan(0)) {
          id = id.minus(1);
          res.push(
            zip(
              of(id),
              this.lotterieService.getWinningParam(id),
              (ido,ps) => {
                console.log(ido);
                return Winningparam.fromObject(ido,ps)
              }
            ));
        }
      }

      this.params$ = res;
    });
  }
  ngOnInit() {
    this.getWinningParams();
  }

}*/
