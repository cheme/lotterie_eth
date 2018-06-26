import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ThrowsComponent } from './throws/throws.component';
import { WinningparamDetailComponent } from './params/winningparam-detail/winningparam-detail.component';
import { ParamsModule } from './params/params.module';
import { WinningparamsComponent } from './params/winningparams/winningparams.component';
import { LotterieparamsComponent } from './params/lotterieparams/lotterieparams.component';
import { PhaseparamsComponent } from './params/phaseparams/phaseparams.component';
import { PhaseparamDetailComponent } from './params/phaseparam-detail/phaseparam-detail.component';
import { LotterieparamDetailComponent } from './params/lotterieparam-detail/lotterieparam-detail.component';
import { ThrowDetailsComponent } from './throw/throw-details/throw-details.component';
import { ThrowNewComponent } from './throw/throw-new/throw-new.component';
import { MyBoardComponent } from './throw/my-board/my-board.component';
//import { DashboardComponent }   from './dashboard/dashboard.component';

const routes: Routes = [
  { path: '', redirectTo: '/throws', pathMatch: 'full' },
  { path: 'throws', component: ThrowsComponent },
  { path: 'myboard', component: MyBoardComponent },
  { path: 'newthrow', component: ThrowNewComponent },
//  { path: 'dashboard', component: DashboardComponent },
  { path: 'throw/:address', component: ThrowDetailsComponent },
  { path: 'winningparams', component: WinningparamsComponent },
  { path: 'lotterieparams', component: LotterieparamsComponent },
  { path: 'phaseparams', component: PhaseparamsComponent },
  { path: 'winningparam/:id', component: WinningparamDetailComponent },
  { path: 'lotterieparam/:id', component: LotterieparamDetailComponent },
  { path: 'phaseparam/:id', component: PhaseparamDetailComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    ParamsModule
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }



