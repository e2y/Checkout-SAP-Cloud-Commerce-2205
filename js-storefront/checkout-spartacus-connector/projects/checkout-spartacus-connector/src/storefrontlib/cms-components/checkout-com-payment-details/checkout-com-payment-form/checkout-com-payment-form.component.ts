import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PaymentFormComponent } from '@spartacus/checkout/components';
import { CheckoutDeliveryFacade, CheckoutPaymentFacade } from '@spartacus/checkout/root';
import { GlobalMessageService, UserAddressService, UserPaymentService } from '@spartacus/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalService } from '@spartacus/storefront';
import { CheckoutComPaymentDetails } from '../../../interfaces';

@Component({
  selector: 'y-checkout-com-payment-form',
  templateUrl: './checkout-com-payment-form.component.html'
})
export class CheckoutComPaymentFormComponent extends PaymentFormComponent implements OnInit {

  @Input() paymentDetailsData: CheckoutComPaymentDetails;

  paymentForm: FormGroup = this.fb.group({
    accountHolderName: ['', [Validators.required]],
    billingAddress: [''],
    cardType: [''],
    cardNumber: [''],
    defaultPayment: [null],
    expiryMonth: [null, Validators.required],
    expiryYear: [null, Validators.required],
    id: [''],
    paymentToken: [''],
    subscriptionId: ['']
  });

  constructor(
    protected checkoutPaymentService: CheckoutPaymentFacade,
    protected checkoutDeliveryService: CheckoutDeliveryFacade,
    protected userPaymentService: UserPaymentService,
    protected globalMessageService: GlobalMessageService,
    protected fb: FormBuilder,
    protected modalService: ModalService,
    protected userAddressService: UserAddressService
  ) {
    super(
      checkoutPaymentService,
      checkoutDeliveryService,
      userPaymentService,
      globalMessageService,
      fb,
      modalService,
      userAddressService,
    );
  }

  ngOnInit() {
    this.expMonthAndYear();
    this.paymentForm.patchValue(this.paymentDetailsData);
  }

  next(): void {
    if (this.paymentForm.valid) {
      this.setPaymentDetails.emit(this.paymentForm.value);
    } else {
      this.paymentForm.markAllAsTouched();
    }
  }
}
