import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AmountEthComponent } from './amount-eth/amount-eth.component';
import { MatFormFieldModule, MatSelectModule, MatCheckbox, MatCheckboxModule, MatTooltipModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTooltipModule,
  ],
  declarations: [AmountEthComponent, AmountEthComponent],
  exports: [AmountEthComponent]
})
export class EthComponentsModule { }
