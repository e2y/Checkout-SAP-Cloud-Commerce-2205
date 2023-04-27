import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckoutComPaymentFormComponent } from './checkout-com-payment-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { I18nModule } from '@spartacus/core';
import { FormErrorsModule, SpinnerModule } from '@spartacus/storefront';
import { NgSelectModule } from '@ng-select/ng-select';



@NgModule({
  declarations: [
    CheckoutComPaymentFormComponent
  ],
  exports: [
    CheckoutComPaymentFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    I18nModule,
    FormErrorsModule,
    NgSelectModule,
    SpinnerModule
  ]
})
export class CheckoutComPaymentFormModule { }
