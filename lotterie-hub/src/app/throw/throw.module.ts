import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThrowDetailsSmallComponent, DialogNPart } from './throw-details-small/throw-details-small.component';
import { RouterModule } from '@angular/router';
import { Athrow } from './athrow';
import { ThrowDetailsComponent } from './throw-details/throw-details.component';
import { ThrowNewComponent } from './throw-new/throw-new.component';
import { FormsModule } from '@angular/forms';
import { ParticipationDetailComponent } from './participation-detail/participation-detail.component';
import { ParticipationsComponent } from './participations/participations.component';
import { ParticipationNewComponent } from './participation-new/participation-new.component';
import {MatButtonModule, MatCardModule, MatDialogModule, MatFormFieldModule, MatExpansionModule, MatListModule, MatBadgeModule} from '@angular/material';
import { EthereumModule } from '../ethereum/ethereum.module';
import { EthComponentsModule } from '../eth-components/eth-components.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatExpansionModule,
    MatListModule,
    EthereumModule,
    EthComponentsModule,
    MatBadgeModule,
  ],
  exports: [
    ThrowDetailsSmallComponent,
    ThrowDetailsComponent,
    ThrowNewComponent,
  ],
  declarations: [
    ThrowDetailsSmallComponent,
    ThrowDetailsComponent,
    ThrowNewComponent,
    ParticipationDetailComponent,
    ParticipationsComponent,
    ParticipationNewComponent,
    DialogNPart,
  ],
  entryComponents: [
    DialogNPart,

  ]
})
export class ThrowModule { }
