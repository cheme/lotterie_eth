import { Component, OnInit, Input } from '@angular/core';
import { Athrow } from '../athrow';
import { environment } from '../../../environments/environment';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-participations',
  templateUrl: './participations.component.html',
  styleUrls: ['./participations.component.css']
})
export class ParticipationsComponent implements OnInit {

  @Input() athrow : Athrow;
  @Input() subscribeP : Subject<boolean>;

  range : Array<number>;
  constructor() { }

  ngOnInit() {
    this.initRange();
    if (this.subscribeP) {
      this.subscribeP.subscribe((b) => {
        if (b) {
          this.initRange();
        }
      });
      this.subscribeP = null;
    }
  }

  initRange() {
    let last = this.athrow.numberOfBid;
    if (last == 0) {
      return Array(0)
    }
    let nb = Math.min(environment.nbParticipationsShow, last);
    var res = Array(nb);
    for (var i = 0; i < nb; ++i) {
      res[i] = last - 1 - i;
    }
    this.range = res;
  }

}
