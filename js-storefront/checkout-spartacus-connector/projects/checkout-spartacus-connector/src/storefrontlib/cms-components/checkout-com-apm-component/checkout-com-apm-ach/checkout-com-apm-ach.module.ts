import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckoutComApmAchComponent } from './checkout-com-apm-ach.component';
import { CheckoutComBillingAddressModule } from '../../checkout-com-billing-address/checkout-com-billing-address.module';
import { NgxPlaidLinkModule } from "ngx-plaid-link";
import { I18nModule } from '@spartacus/core';
import { CheckoutComApmAchConsentsComponent } from './checkout-com-apm-ach-consents/checkout-com-apm-ach-consents.component';
import { SpinnerModule } from '@spartacus/storefront';
import { ReactiveFormsModule } from '@angular/forms';
import { CheckoutComApmAchAccountListModalComponent } from './checkout-com-apm-ach-account-list-modal/checkout-com-apm-ach-account-list-modal.component';

@NgModule({
  declarations: [CheckoutComApmAchComponent, CheckoutComApmAchConsentsComponent, CheckoutComApmAchAccountListModalComponent],
  exports: [
    CheckoutComApmAchComponent
  ],
  imports: [
    CommonModule,
    CheckoutComBillingAddressModule,
    NgxPlaidLinkModule,
    I18nModule,
    SpinnerModule,
    ReactiveFormsModule
  ]
})
export class CheckoutComApmAchModule { }
