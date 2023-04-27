import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckoutComFramesInputComponent } from './checkout-com-frames-input.component';
import { ReactiveFormsModule } from '@angular/forms';
import { I18nModule } from '@spartacus/core';
import { IconModule } from '@spartacus/storefront';
import { TooltipModule } from 'ng2-tooltip-directive';

@NgModule({
  declarations: [CheckoutComFramesInputComponent],
  exports: [
    CheckoutComFramesInputComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    I18nModule,
    IconModule,
    TooltipModule,
  ]
})
export class CheckoutComFramesInputModule { }
