import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckoutComPaymentDetailsComponent } from './checkout-com-payment-details.component';
import { AuthGuard, CmsConfig, I18nModule, provideConfig } from '@spartacus/core';
import { CardModule, SpinnerModule } from '@spartacus/storefront';
import { PaymentFormModule } from '@spartacus/checkout/components';
import { CheckoutComPaymentFormModule } from './checkout-com-payment-form/checkout-com-payment-form.module';

@NgModule({
  imports: [
    CommonModule,
    CardModule,
    SpinnerModule,
    I18nModule,
    PaymentFormModule,
    CheckoutComPaymentFormModule
  ],
  providers: [
    provideConfig({
      cmsComponents: {
        AccountPaymentDetailsComponent: {
          component: CheckoutComPaymentDetailsComponent,
          guards: [AuthGuard],
        },
      },
    } as CmsConfig),
  ],
  declarations: [CheckoutComPaymentDetailsComponent],
  exports: [CheckoutComPaymentDetailsComponent]
})
export class CheckoutComPaymentDetailsModule { }
