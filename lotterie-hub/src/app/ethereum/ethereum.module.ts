import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WEB3 } from './tokens';
import Web3 from 'web3';
import { LotterieService } from './lotterie.service';
import { MatFormFieldModule, MatInputModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
/*  providers: [{
    provide: WEB3,
    useFactory: ,
  }],*/
  declarations: [],
  exports: []
})
export class EthereumModule { }
