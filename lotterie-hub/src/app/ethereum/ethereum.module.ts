import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WEB3 } from './tokens';
import Web3 from 'web3';
import { LotterieService } from './lotterie.service';

@NgModule({
  imports: [
    CommonModule
  ],
/*  providers: [{
    provide: WEB3,
    useFactory: ,
  }],*/
  declarations: []
})
export class EthereumModule { }
