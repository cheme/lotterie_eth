import { Component, OnInit } from '@angular/core';
import { FormControl, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { LotterieService } from '../../ethereum/lotterie.service';
import { MessageService } from '../../message.service';
import { StorageService } from '../../storage.service';
import { EthValue, EthUnits } from '../../eth-components/eth-value';


@Component({
  selector: 'app-lotterieparam-new',
  templateUrl: './lotterieparam-new.component.html',
  styleUrls: ['./lotterieparam-new.component.css']
})
export class LotterieparamNewComponent implements OnInit {

  public form: FormGroup;
  unsafe = false;
  public units : any = EthUnits;
  constructor(
    protected lotterieService: LotterieService,
    protected messageService: MessageService,
    protected storageService: StorageService,
    protected fb : FormBuilder,
  ) { }

  ngOnInit() {
    this.unsafe = this.storageService.environment.unsafe;
    this.createForm();
  }

  createForm() {
    this.form = this.fb.group({
    // 'password' : ['', [Validators.required, Validators.minLength(6)]],
      'winningParamsId' : ['', [Validators.required]],
      'doSalt' : [true, [Validators.required]],
      'minBidValue' : [EthValue.empty(), [Validators.required]],
      'biddingTreshold' : [EthValue.empty(), [Validators.required]],
      'maxParticipant' : [0, []],
    });
  }

  get minbidvalue() {
    return this.form.get('minBidValue').value.fullrepr;
  }
  get biddingtreshold() {
    return this.form.get('biddingTreshold').value.fullrepr;
  }

  public createParamConf() {
    this.lotterieService.launchLotterieParamCreation(
     this.form.get('winningParamsId').value,
     this.form.get('doSalt').value,
     this.storageService.environment.authorDapp,
     this.minbidvalue,
     this.biddingtreshold,
     this.form.get('maxParticipant').value
    ).subscribe(ok => {
      if (ok) {
        this.messageService.add("A Lotterie param creation succeed");
      } else {
        this.messageService.add("A Lotterie param creation failed");
      }
    });
  }

}
