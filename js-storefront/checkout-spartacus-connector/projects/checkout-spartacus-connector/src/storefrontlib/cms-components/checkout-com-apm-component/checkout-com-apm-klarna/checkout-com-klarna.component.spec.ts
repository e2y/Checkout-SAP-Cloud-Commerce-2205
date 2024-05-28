import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutComKlarnaComponent } from './checkout-com-klarna.component';
import { BehaviorSubject, of } from 'rxjs';
import { PaymentType } from '../../../../core/model/ApmData';
import { CheckoutComApmService } from '../../../../core/services/checkout-com-apm.service';
import { GlobalMessageService, I18nTestingModule } from '@spartacus/core';
import { CheckoutComPaymentService } from '../../../../core/services/checkout-com-payment.service';
import { CheckoutDeliveryFacade } from '@spartacus/checkout/root';
import createSpy = jasmine.createSpy;
import { Component, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'lib-checkout-com-billing-address',
  template: '',
})
export class MockCheckoutComBillingAddressComponent {
  @Input() billingAddressForm: FormGroup;
  @Output() sameAsShippingAddressChange = new BehaviorSubject<boolean>(true);
}


const apm = {code: PaymentType.Klarna};

class CheckoutComApmServiceStub {
  getSelectedApmFromState = createSpy('getSelectedApmFromState').and.returnValue(of(apm));
  selectApm = createSpy('selectApm').and.stub();
  getKlarnaInitParams = createSpy('getKlarnaInitParams').and.returnValue(of({}));
}

class MockCheckoutComStore {}

class MockGlobalMessageService {
  add = createSpy();
}

class MockCheckoutDeliveryFacade {
  getDeliveryAddress() {
    return of({country: 'ES'});
  }
}

class CheckoutComPaymentStub {
  setPaymentAddress = createSpy('setPaymentAddress').and.stub();
  getPaymentAddressFromState = createSpy('getPaymentAddressFromState').and.returnValue(of({}));
}

describe('CheckoutComKlarnaComponent', () => {
  let component: CheckoutComKlarnaComponent;
  let fixture: ComponentFixture<CheckoutComKlarnaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CheckoutComKlarnaComponent, MockCheckoutComBillingAddressComponent],
      imports: [I18nTestingModule],
      providers: [
        {provide: CheckoutComApmService, useClass: CheckoutComApmServiceStub},
        {provide: GlobalMessageService, useClass: MockGlobalMessageService},
        {provide: CheckoutComPaymentService, useClass: CheckoutComPaymentStub},
        {provide: CheckoutDeliveryFacade, useClass: MockCheckoutDeliveryFacade},
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutComKlarnaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
