import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WinningparamDetailComponent } from './winningparam-detail/winningparam-detail.component';
import { WinningparamsComponent } from './winningparams/winningparams.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PhaseparamsComponent } from './phaseparams/phaseparams.component';
import { PhaseparamDetailComponent } from './phaseparam-detail/phaseparam-detail.component';
import { LotterieparamDetailComponent } from './lotterieparam-detail/lotterieparam-detail.component';
import { LotterieparamsComponent } from './lotterieparams/lotterieparams.component';
import {
  MatButtonModule,
  MatTableModule,
  MatSortModule,
  MatPaginatorModule,
  MatListModule,
  MatFormFieldModule,
  MatSelectModule,
  MatCheckboxModule,
  MatTooltipModule,
  MatInputModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatDividerModule,
  } from '@angular/material';
import { PhaseparamNewComponent } from './phaseparam-new/phaseparam-new.component';
import { LotterieparamNewComponent } from './lotterieparam-new/lotterieparam-new.component';
import { EthereumModule } from '../ethereum/ethereum.module';
import { EthComponentsModule } from '../eth-components/eth-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatButtonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatListModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatDividerModule,
    //MatNativeDateModule,
    EthComponentsModule,
  ],
  exports: [
    WinningparamDetailComponent,
    WinningparamsComponent,
    LotterieparamsComponent,
    LotterieparamDetailComponent,
    PhaseparamsComponent,
    PhaseparamDetailComponent,
    PhaseparamNewComponent,
  ],
  declarations: [
    WinningparamDetailComponent,
    WinningparamsComponent,
    PhaseparamsComponent,
    PhaseparamDetailComponent,
    PhaseparamNewComponent,
    LotterieparamDetailComponent,
    LotterieparamsComponent,
    LotterieparamNewComponent
  ]
})
export class ParamsModule { }
