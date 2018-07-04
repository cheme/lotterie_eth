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
import {MatButtonModule, MatCardModule, MatDialogModule, MatFormFieldModule, MatExpansionModule, MatListModule, MatBadgeModule, MatSliderModule, MatInputModule, MatPaginator, MatPaginatorModule, MatSlideToggleModule, MatGridListModule, MatTabsModule, MatSelectModule, MatCheckboxModule} from '@angular/material';
import { EthereumModule } from '../ethereum/ethereum.module';
import { EthComponentsModule } from '../eth-components/eth-components.module';
import { MyBoardComponent } from './my-board/my-board.component';
import { MyFavoritesComponent } from './my-favorites/my-favorites.component';
import { ErcValueComponent } from './erc-value/erc-value.component';

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
    MatSliderModule,
    MatInputModule,
    MatPaginatorModule,
    MatSlideToggleModule,
    MatGridListModule,
    MatTabsModule,
    MatSelectModule,
    MatCheckboxModule,
  ],
  exports: [
    ThrowDetailsSmallComponent,
    ThrowDetailsComponent,
    ThrowNewComponent,
    MyBoardComponent,
    MyFavoritesComponent,
  ],
  declarations: [
    ThrowDetailsSmallComponent,
    ThrowDetailsComponent,
    ThrowNewComponent,
    ParticipationDetailComponent,
    ParticipationsComponent,
    ParticipationNewComponent,
    DialogNPart,
    MyBoardComponent,
    MyFavoritesComponent,
    ErcValueComponent,
  ],
  entryComponents: [
    DialogNPart,

  ]
})
export class ThrowModule { }
