
import {FocusMonitor} from '@angular/cdk/a11y';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {Component, ElementRef, Input, OnInit, OnDestroy, forwardRef, Optional, Self} from '@angular/core';
import {FormBuilder, FormGroup, ControlValueAccessor, NgControl} from '@angular/forms';
import {MatFormFieldControl} from '@angular/material';
import {Subject} from 'rxjs';
import { EthValue } from '../eth-value';



/** Custom `MatFormFieldControl` for telephone number input. */
@Component({
  selector: 'amount-eth',
  templateUrl: './amount-eth.component.html',
  styleUrls: ['./amount-eth.component.css'],
  providers: [{provide: MatFormFieldControl, useExisting: forwardRef(() => AmountEthComponent)}],
  host: {
    '[class.floating]': 'shouldLabelFloat',
    '[id]': 'id',
    '[attr.aria-describedby]': 'describedBy',
  }
})
export class AmountEthComponent implements MatFormFieldControl<EthValue>, OnDestroy, ControlValueAccessor {
  static nextId = 0;
  // cva
  writeValue(obj: any): void {
    console.log("in write value : " + obj);
    this.value = obj;
  }
  registerOnChange(fn: any): void {
    this._onChangeCb = fn;
  }
  _onChangeCb : any;
  registerOnTouched(fn: any): void {
    this._onTouchedCb = fn;
  }
  _onTouchedCb : any;
  // cva


  parts: FormGroup;

  stateChanges = new Subject<void>();

  focused = false;


  @Input() get errorState() {
    return this.ngControl !== null && this.ngControl.errors !== null && this.ngControl.touched;
  }
  controlType = 'my-tel-input';

  get empty() {
    let n = this.parts.value;
    return n.count == '0';
  }

  get shouldLabelFloat() { return this.focused || !this.empty; }

  id = `amount-eth-input-${AmountEthComponent.nextId++}`;

  describedBy = '';

  @Input()
  get placeholder() { return this._placeholder; }
  set placeholder(plh) {
    this._placeholder = plh;
    this.stateChanges.next();
  }
  private _placeholder: string;

  @Input()
  get required() { return this._required; }
  set required(req) {
    this._required = coerceBooleanProperty(req);
    this.stateChanges.next();
  }
  private _required = false;

  @Input()
  get disabled() { return this._disabled; }
  set disabled(dis) {
    this._disabled = coerceBooleanProperty(dis);
    this.stateChanges.next();
  }
  private _disabled = false;

  private _units : any;
  public unitsiter;
  @Input()
  get units() {
    return this._units;
  }
  set units(uns : any) {
    if (uns) {
      this._units = uns;
      this.unitsiter = Object.entries(uns);
    }
  }

  @Input()
  get value(): EthValue | null {
    if (!this.units) {
      return null;
    }
    let n = this.parts.value;
    if (n.count.length > 0 && n.unit.length > 0) {
      return new EthValue(this._units,parseInt(n.count), n.unit);
    }
    return null;
  }
  set value(tel: EthValue | null) {
    tel = tel || EthValue.empty();
    console.log("value set : " + tel.toString())
    this.parts.setValue({count: tel.count.toString(), unit: tel.unit,doesLink: this._doesLink});
    if (this._onChangeCb) {
      this._onChangeCb(tel);
    }
 
    this.stateChanges.next();
  }

  constructor(fb: FormBuilder, private fm: FocusMonitor, private elRef: ElementRef,
    @Optional() @Self() public ngControl: NgControl,
  ) {
    this.parts = fb.group({
      'count': '',
      'unit': '',
      'doesLink': false,
    });
    if (this.ngControl != null && this.ngControl.valueAccessor == null) { this.ngControl.valueAccessor = this; }

    fm.monitor(elRef.nativeElement, true).subscribe((origin) => {
      this.focused = !!origin;
      if (this._onTouchedCb) {
        this._onTouchedCb();
      }
      this.stateChanges.next();
    });
  }

  ngOnDestroy() {
    this.stateChanges.complete();
    this.fm.stopMonitoring(this.elRef.nativeElement);
  }

  setDescribedByIds(ids: string[]) {
    this.describedBy = ids.join(' ');
  }

  onContainerClick(event: MouseEvent) {
    if ((event.target as Element).tagName.toLowerCase() != 'input') {
      this.elRef.nativeElement.querySelector('input').focus();
    }
    if (this._onTouchedCb) {
      this._onTouchedCb(event);
    }
 
  }

  updateValue() {
    let ev = new EthValue(this._units,this.parts.value.count,this.parts.value.unit,this.parts.value.doesLink);
    this.value = ev;
  }
  countchange(event : KeyboardEvent) {
    console.log("d");
    let newval = this.parts.value.count.replace(/[^\.\d]/g,'');
    /*let pix = newval.indexOf('.');
    if (pix > 0) {
      newval = newval.substring(0,pix);
    }*/
    if (newval.length == 0) {
      newval = "0";
    } else if (newval.startsWith('0')) {
      newval = newval.substring(1); // TODO use regexp for it
    }
    this.parts.value.count = newval;
    this.updateValue();
  }
  unitchange(event : Event) {
    this.updateValue();
  }
  linkchange(event : Event) {
    //this._doesLink = event.target['checked'];
    this._doesLink = event['checked'];
    this.updateValue();
  }
  _doesLink = false;

}
