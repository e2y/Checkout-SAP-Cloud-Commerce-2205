import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutComPaymentFormComponent } from './checkout-com-payment-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import {
  Address,
  AddressValidation,
  Country,
  GlobalMessageService,
  I18nTestingModule,
  Region,
  UserAddressService,
  UserPaymentService
} from '@spartacus/core';
import { FormErrorsModule, ICON_TYPE, ModalService, SpinnerModule } from '@spartacus/storefront';
import { NgSelectModule } from '@ng-select/ng-select';
import { Component, Input } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import createSpy = jasmine.createSpy;

const mockBillingCountries: Country[] = [
  {
    isocode: 'CA',
    name: 'Canada',
  },
];

const mockBillingAddress: Address = {
  firstName: 'John',
  lastName: 'Doe',
  line1: 'Green Street',
  line2: '420',
  town: 'Montreal',
  postalCode: 'H3A',
  country: { isocode: 'CA' },
  region: { isocodeShort: 'QC' },
};

const mockPayment: any = {
  accountHolderName: 'Test Name',
  billingAddress: mockBillingAddress,
  cardType: '',
  cardNumber: '1234123412341234',
  defaultPayment: null,
  expiryMonth: '02',
  expiryYear: 2022,
  id: '',
  paymentToken: '',
  subscriptionId: ''
};

@Component({
  selector: 'cx-spinner',
  template: '',
})
class MockSpinnerComponent {
}

@Component({
  selector: 'cx-billing-address-form',
  template: '',
})
class MockBillingAddressFormComponent {
  @Input()
  billingAddress: Address;
  @Input()
  countries$: Observable<Country[]>;
}

@Component({
  selector: 'cx-card',
  template: '',
})
class MockCardComponent {
  @Input()
  content: any;
}

@Component({
  selector: 'cx-icon',
  template: '',
})
class MockCxIconComponent {
  @Input() type: ICON_TYPE;
}

class MockCheckoutDeliveryService {
  getDeliveryAddress(): Observable<Address> {
    return of(null);
  }

  getAddressVerificationResults(): Observable<AddressValidation> {
    return of();
  }

  verifyAddress(_address: Address): void {
  }

  clearAddressVerificationResults(): void {
  }
}

class MockUserPaymentService {
  loadBillingCountries = createSpy();

  getAllBillingCountries(): Observable<Country[]> {
    return new BehaviorSubject(mockBillingCountries);
  }
}

class MockGlobalMessageService {
  add = createSpy();
}

const mockSuggestedAddressModalRef: any = {
  componentInstance: {
    enteredAddress: '',
    suggestedAddresses: '',
  },
  result: new Promise((resolve) => {
    return resolve(true);
  }),
};

class MockModalService {
  open(): any {
    return mockSuggestedAddressModalRef;
  }
}

class MockUserAddressService {
  getRegions(): Observable<Region[]> {
    return of([]);
  }

  verifyAddress(): Observable<AddressValidation> {
    return of({});
  }
}

describe('CheckoutComPaymentFormComponent', () => {
  let component: CheckoutComPaymentFormComponent;
  let fixture: ComponentFixture<CheckoutComPaymentFormComponent>;
  let mockUserPaymentService: MockUserPaymentService;
  let mockGlobalMessageService: MockGlobalMessageService;

  beforeEach(async () => {
    mockUserPaymentService = new MockUserPaymentService();
    mockGlobalMessageService = new MockGlobalMessageService();

    await TestBed.configureTestingModule({
        declarations: [
          CheckoutComPaymentFormComponent,
          MockCardComponent,
          MockBillingAddressFormComponent,
          MockCxIconComponent,
          MockSpinnerComponent,
        ],
        imports: [
          ReactiveFormsModule,
          NgSelectModule,
          I18nTestingModule,
          FormErrorsModule,
        ],
        providers: [
          {
            provide: ModalService,
            useClass: MockModalService
          },
          {
            provide: UserPaymentService,
            useValue: mockUserPaymentService
          },
          {
            provide: GlobalMessageService,
            useValue: mockGlobalMessageService
          },
          {
            provide: UserAddressService,
            useClass: MockUserAddressService
          },
        ],
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutComPaymentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.paymentDetailsData = mockPayment;
    component.ngOnInit();
    spyOn(component.setPaymentDetails, 'emit').and.callThrough();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update payment details form', () => {
    expect(component.paymentForm.value).toEqual({
      accountHolderName: 'Test Name',
      billingAddress: {
        firstName: 'John',
        lastName: 'Doe',
        line1: 'Green Street',
        line2: '420',
        town: 'Montreal',
        postalCode: 'H3A',
        country: { isocode: 'CA' },
        region: { isocodeShort: 'QC' },
      },
      cardType: '',
      cardNumber: '1234123412341234',
      defaultPayment: null,
      expiryMonth: '02',
      expiryYear: 2022,
      id: '',
      paymentToken: '',
      subscriptionId: ''
    });
  });

  it('should submit the update payment method form', () => {
    component.next();
    expect(component.setPaymentDetails.emit).toHaveBeenCalledWith(component.paymentForm.value);
  });

  it('should submit the update payment method form with error', () => {
    component.paymentForm.setValue({
      accountHolderName: '',
      billingAddress: '',
      cardType: '',
      cardNumber: '',
      defaultPayment: null,
      expiryMonth: null,
      expiryYear: null,
      id: '',
      paymentToken: '',
      subscriptionId: ''
    });
    component.next();
    expect(component.paymentForm.valid).toBeFalse();
  });
});
