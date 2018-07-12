import { Component, OnInit } from '@angular/core';
import { FormControl, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { LotterieService } from '../../ethereum/lotterie.service';
import { MessageService } from '../../message.service';
import { StorageService } from '../../storage.service';
import { MatDatepickerInputEvent } from '@angular/material';

@Component({
  selector: 'app-phaseparam-new',
  templateUrl: './phaseparam-new.component.html',
  styleUrls: ['./phaseparam-new.component.css']
})
export class PhaseparamNewComponent implements OnInit {

  public form: FormGroup;
  public startmodes: any;
  public startmodesentries: any;

  public participationenmodes: any;
  public pendentries: any;

  unsafe = false;

  constructor(
    protected lotterieService: LotterieService,
    protected messageService: MessageService,
    protected storageService: StorageService,
    protected fb : FormBuilder,
  ) { 
  }

  ngOnInit() {
    this.unsafe = this.storageService.environment.unsafe;
    this.startmodes = this.lotterieService.participationStartModes;
    this.startmodesentries =  Object.entries(this.startmodes);
    this.participationenmodes = this.lotterieService.participationEndModes;
    this.pendentries = Object.entries(this.participationenmodes);
    this.createForm();
  }

  createForm() {
    this.form = this.fb.group({
      'startmode' : [this.startmodes.Relative, [Validators.required]],
      'infinitestart' : [false, [Validators.required]],
      'starttreshold' : ['0', [Validators.required]],
      'pendmode' : [this.participationenmodes.EagerRelative, [Validators.required]],
      'pendtreshold' : ['0', [Validators.required]],
      'coutmode' : [this.startmodes.Relative, [Validators.required]],
      'couttreshold' : ['0', [Validators.required]],
      'throwmode' : [this.startmodes.Relative, [Validators.required]],
      'throwtreshold' : ['0', [Validators.required]],
    // 'password' : ['', [Validators.required, Validators.minLength(6)]],
    });
  }
  get startmode() {
    return this.form.get('startmode');
  }
  get infinitestart() {
    return this.form.get('infinitestart');
  }
  get pendmode() {
    return this.form.get('pendmode');
  }
  get coutmode() {
    return this.form.get('coutmode');
  }
  get throwmode() {
    return this.form.get('throwmode');
  }
 
  public createParamConf() {
    let ptresh;
    if (this.infinitestart) {
      ptresh = "0";
    } else {
      if (this.pendmode.value == this.startmodes.Absolute) {
        ptresh = Date.parse(this.form.get('starttreshold').value)/1000;
      } else {
        ptresh = this.form.get('starttreshold').value;
      }
    }
    this.lotterieService.launchPhaseParamCreation(
    this.startmode.value,
    ptresh,
    this.pendmode.value,
    this.form.get('pendtreshold').value,
    this.coutmode.value,
    this.form.get('couttreshold').value,
    this.throwmode.value,
    this.form.get('throwtreshold').value
    ).subscribe(ok => {
      if (ok) {
        this.messageService.add("A Phase param creation succeed");
      } else {
        this.messageService.add("A Phase param creation failed");
      }
    });
 
  };

  public setDate(ev: MatDatepickerInputEvent<any>, k: string) {
    let nv = {};
    nv[k] = ev.value;
    this.form.patchValue(nv);
  }

}
