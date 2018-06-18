import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WinningparamDetailComponent } from './winningparam-detail/winningparam-detail.component';
import { WinningparamsComponent } from './winningparams/winningparams.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PhaseparamsComponent } from './phaseparams/phaseparams.component';
import { PhaseparamDetailComponent } from './phaseparam-detail/phaseparam-detail.component';
import { LotterieparamDetailComponent } from './lotterieparam-detail/lotterieparam-detail.component';
import { LotterieparamsComponent } from './lotterieparams/lotterieparams.component';
import {MatButtonModule, MatTableModule, MatSortModule, MatPaginatorModule, MatListModule} from '@angular/material';

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
  ],
  exports: [
    WinningparamDetailComponent,
    WinningparamsComponent,
    LotterieparamsComponent,
    LotterieparamDetailComponent,
    PhaseparamsComponent,
    PhaseparamDetailComponent,
  ],
  declarations: [WinningparamDetailComponent, WinningparamsComponent, PhaseparamsComponent, PhaseparamDetailComponent, LotterieparamDetailComponent, LotterieparamsComponent]
})
export class ParamsModule { }
