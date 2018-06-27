import { Component, OnInit } from '@angular/core';
import { StorageService } from '../storage.service';
import { MatSliderChange } from '@angular/material';


@Component({
  selector: 'app-lott-environment',
  templateUrl: './lott-environment.component.html',
  styleUrls: ['./lott-environment.component.css']
})
export class LottEnvironmentComponent implements OnInit {
  constructor(
    private storageService : StorageService,
  ) { }

  public env;
  ngOnInit() {
    this.env = this.storageService.environment;
  }
  savePrefs() {
    this.storageService.environment = this.env;
    this.storageService.saveEnvironment();
    alert("Please restart/refresh your application");

  }
  resetToDefault() {
    confirm("Conf will be deleted");
    this.storageService.resetEnvironment();
    this.env = this.storageService.environment;
    alert("Please restart/refresh your application");
  }

  static i32ToPercent(i : number) : number {
    //return (i / (2 ** 32)) * 100;
    let p = (i / 4294967296) * 100;
    return parseInt(p.toFixed(0));
  }
  percentOM(value: number | null) : string {
    if (!value) {
      return "0";
    }
    return (LottEnvironmentComponent.i32ToPercent(value) + '%');
  }
  changeOM(ev: MatSliderChange) {
    this.env.defaultOwnerMargin = ev.value;
  }
  changeACM(ev: MatSliderChange) {
    this.env.defaultAuthorContractMargin = ev.value;
  }
  changeADM(ev: MatSliderChange) {
    this.env.defaultAuthorDappMargin = ev.value;
  }
  changeTM(ev: MatSliderChange) {
    this.env.defaultThrowerMargin = ev.value;
  }
}

