import { HttpErrorResponse } from '@angular/common/http';
import { KlarnaPaymentMethodCategory } from '../storefrontlib/interfaces';

export interface CheckoutComRedirect {
  type?: string;
  redirectUrl?: string;
}

export interface KlarnaInitParams {
  clientToken?: string;
  paymentContext?: string;
  instanceId?: string;
  success?: boolean;
  httpError?: HttpErrorResponse;
}
