import { EventEmitter, Input, Output, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckoutComApmIdealComponent } from './checkout-com-apm-ideal.component';
import { Address, I18nTestingModule } from '@spartacus/core';
import { FormErrorsModule } from '@spartacus/storefront';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApmPaymentDetails } from '../../../interfaces';

import { PaymentType } from '../../../../core/model/ApmData';
import { Observable } from 'rxjs';


describe('CheckoutComApmIdealComponent', () => {
  let component: CheckoutComApmIdealComponent;
  let fixture: ComponentFixture<CheckoutComApmIdealComponent>;
  let setPaymentDetails = new EventEmitter<{ paymentDetails: ApmPaymentDetails, billingAddress: Address }>();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [I18nTestingModule, FormErrorsModule, ReactiveFormsModule],
      declarations: [CheckoutComApmIdealComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutComApmIdealComponent);
    component = fixture.componentInstance;

    setPaymentDetails = new EventEmitter<{ paymentDetails: ApmPaymentDetails, billingAddress: Address }>();
    component.setPaymentDetails = setPaymentDetails;
    component.sameAsShippingAddress = true;

    // simplified billing address form for tst
    component.billingAddressForm = new FormGroup({
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required])
    });

    fixture.detectChanges();
  });

  afterEach(() => {
    if (setPaymentDetails) {
      setPaymentDetails.unsubscribe();
    }
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should use the billing address if given', (done) => {
    component.sameAsShippingAddress = false;
    const billingAddress = {
      firstName: 'John',
      lastName: 'Doe',
    } as Address;
    component.billingAddressForm.setValue(billingAddress);

    setPaymentDetails
      .subscribe((event) => {
      expect(event.billingAddress).toEqual(billingAddress);
      expect(event.paymentDetails).toEqual({ type: PaymentType.iDeal});

      done();
    });

    fixture.detectChanges();

    expect(document.querySelector('button[data-test-id="ideal-continue-btn"]')['disabled']).toEqual(false);

    component.next();
  });

  it('should not call setPaymentDetails event if billing address is not valid', () => {
    component.sameAsShippingAddress = false;
    const billingAddress = {
      firstName: 'John',
      lastName: '',
    } as Address;
    component.billingAddressForm.setValue(billingAddress);

    fixture.detectChanges();

    expect(document.querySelector('button[data-test-id="ideal-continue-btn"]')['disabled']).toEqual(false);
  });
});
