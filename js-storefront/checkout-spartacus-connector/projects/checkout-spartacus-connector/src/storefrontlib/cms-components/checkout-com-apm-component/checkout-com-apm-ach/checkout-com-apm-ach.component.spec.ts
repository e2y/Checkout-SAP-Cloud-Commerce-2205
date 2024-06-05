import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckoutComApmAchComponent } from './checkout-com-apm-ach.component';
import {
  Address,
  AddressValidation,
  GlobalMessageService,
  I18nTestingModule, MockTranslatePipe,
  Order,
  Region,
  RoutingService,
  UserAddressAdapter,
  UserAddressService
} from '@spartacus/core';
import { Card, FormErrorsModule, ModalService } from '@spartacus/storefront';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgxPlaidLinkService } from 'ngx-plaid-link';
import { CheckoutComAchService } from '../../../../core/services/ach/checkout-com-ach.service';
import { Store, StoreModule } from '@ngrx/store';
import { StateWithCheckoutCom } from '../../../../core/store/checkout-com.state';
import { CheckoutDeliveryFacade } from '@spartacus/checkout/root';
import { CheckoutComPaymentService } from '../../../../core/services/checkout-com-payment.service';
import { ChangeDetectorRef, Component, Input, Output } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { CheckoutComApmAchConsentsComponent } from './checkout-com-apm-ach-consents/checkout-com-apm-ach-consents.component';
import { CheckoutComBillingAddressComponent } from '../../checkout-com-billing-address/checkout-com-billing-address.component';
import { reducer } from '../../../../core/store/checkout-com.reducer';
import { CheckoutComApmAchAccountListModalComponent } from './checkout-com-apm-ach-account-list-modal/checkout-com-apm-ach-account-list-modal.component';
import createSpy = jasmine.createSpy;

@Component({
  selector: 'lib-checkout-com-billing-address',
  template: '',
})
class MockCheckoutComBillingAddressComponent {
  @Input() billingAddressForm: FormGroup;
  @Output() sameAsShippingAddressChange = new BehaviorSubject<boolean>(true);
}
@Component({
  selector: 'cx-card',
  template: '',
})
class MockCardComponent {
  @Input()
  content: Card;
}

@Component({
  template: '',
  selector: 'lib-checkout-com-billing-address',
})
class MockLibCheckoutComBillingAddressComponent {
  @Input() billingAddressForm;
  @Output() sameAsShippingAddressChange = new BehaviorSubject<boolean>(true);
}

@Component({
  selector: 'cx-spinner',
  template: '',
})
class MockSpinnerComponent {
}

const achLinkToken = 'link-sandbox-294f20db-2531-44a6-a2f0-136506c963a6';
/* TODO: Vefiry
{
SERIALIZED_NAME_LINK_TOKEN: 'expiration',
SERIALIZED_NAME_EXPIRATION: 'link_token',
SERIALIZED_NAME_REQUEST_ID: 'request_id',
expiration: new Date().toUTCString(),
linkToken: 'link-sandbox-294f20db-2531-44a6-a2f0-136506c963a6',
requestId: 'Y6y9KO2GVzYtjY3',
};*/
const billingAddress: Address = {
  country: {
    isocode: 'US',
  },
  defaultAddress: false,
  firstName: 'Test',
  formattedAddress: 'Address1, , New York, City, 000001',
  id: '8796126248983',
  lastName: 'User',
  line1: 'Address1',
  line2: '',
  phone: '',
  postalCode: '000001',
  region: {
    isocode: 'US-NY'
  },
  shippingAddress: false,
  title: 'Mr.',
  titleCode: 'mr',
  town: 'City',
  visibleInAddressBook: true
};
const institutionMeta = {
  name: 'Bank of America',
  institution_id: 'ins_127989'
};
const accountMeta1 = {
  id: '4lgVyA4wVqSZVAjQ7Q1BimzZKzDb7ac3ajKVD',
  name: 'Plaid Checking',
  mask: '0000',
  type: 'depository',
  subtype: 'checking',
  verification_status: null,
  class_type: null
};
const accountMeta2 = {
  id: '5QqJxWGn7zCBrqKv5jAMUk61aKmRDBtpNvwRq',
  name: 'Plaid Savings',
  mask: '1111',
  type: 'depository',
  subtype: 'savings',
  verification_status: null,
  class_type: null
};
const metadata = {
  status: null,
  link_session_id: 'session_id',
  institution: institutionMeta,
  accounts: [accountMeta1, accountMeta2],
  account: accountMeta1,
  account_id: '',
  transfer_status: '',
  public_token: ''
};
const deliveryAddress: Address = {
  country: {
    isocode: 'US',
  },
  defaultAddress: false,
  firstName: 'delivery',
  formattedAddress: 'Address1, New York, City, 000001',
  id: 'address_002',
  lastName: 'address',
  line1: 'test',
  line2: '',
  phone: '',
  postalCode: '000001',
  region: {
    isocode: 'US-NY'
  },
  shippingAddress: true,
  title: 'Mr.',
  titleCode: 'mr',
  town: 'City',
  visibleInAddressBook: true
};
const addressValidation: AddressValidation = {
  errors: null,
  decision: 'ACCEPT',
  suggestedAddresses: [billingAddress, deliveryAddress]
};
const regions: Region[] = [
  {
    countryIso: 'US',
    isocode: 'US',
    isocodeShort: 'USA',
    name: 'United States'
  }
];
const mockOrder: Order = {
  code: '1',
  statusDisplay: 'Shipped',
  deliveryAddress: {
    firstName: 'John',
    lastName: 'Smith',
    line1: 'Buckingham Street 5',
    line2: '1A',
    phone: '(+11) 111 111 111',
    postalCode: 'MA8902',
    town: 'London',
    country: {
      isocode: 'UK',
    },
  },
  deliveryMode: {
    name: 'Standard order-detail-shipping',
    description: '3-5 days',
    code: 'standard'
  },
  created: new Date('2019-02-11T13:02:58+0000'),
};

class MockCheckoutDeliveryFacade {
  getDeliveryAddress = createSpy('CheckoutDeliveryFacade.getDeliveryAddress').and.returnValue(of(deliveryAddress));
}

class MockCheckoutComAchService implements Partial<CheckoutComAchService> {
  getPlaidLinkMetadata = createSpy('CheckoutComAchService.getPlaidLinkMetadata').and.returnValue(of(metadata));
  requestPlaidLinkToken = createSpy('CheckoutComAchService.requestPlaidLinkToken').and.returnValue(of(achLinkToken));
  setPlaidLinkMetadata = createSpy('CheckoutComAchService.setPlaidLinkMetadata').and.callThrough();
  requestPlaidSuccessOrder = createSpy('CheckoutComAchService.requestPlaidLinkToken').and.returnValue(of({
    order: mockOrder,
    error: null
  }));
}

class MockUserAddressService implements Partial<MockUserAddressService> {
  verifyAddress = createSpy('UserAddressService.verifyAddress').and.returnValue(of(addressValidation));
  getRegions = createSpy('UserAddressService.getRegions').and.returnValue(of([regions]));
}

class MockCheckoutComPaymentService implements Partial<MockCheckoutComPaymentService> {
  updatePaymentAddress(): Observable<Address> {
    return of(billingAddress);
  }
}

class MockRoutingService {
  go = createSpy('RoutingService').and.callThrough();
}

describe('CheckoutComApmAchComponent', () => {
  let component: CheckoutComApmAchComponent;
  let fixture: ComponentFixture<CheckoutComApmAchComponent>;
  let plaidLinkService: NgxPlaidLinkService;
  let checkoutComAchService: CheckoutComAchService;
  let userAddressService: UserAddressService;
  let store: Store<StateWithCheckoutCom>;
  let checkoutDeliveryFacade: CheckoutDeliveryFacade;
  let modalInstance: ModalService;
  let routingService: RoutingService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        I18nTestingModule,
        FormErrorsModule,
        ReactiveFormsModule,
        StoreModule.forRoot({ user: reducer }),
      ],
      declarations: [
        MockTranslatePipe,
        MockCardComponent,
        CheckoutComApmAchComponent,
        CheckoutComBillingAddressComponent,
        CheckoutComApmAchConsentsComponent,
        CheckoutComApmAchAccountListModalComponent,
        MockSpinnerComponent,
      ],
      providers: [
        Store,
        FormBuilder,
        NgxPlaidLinkService,
        UserAddressService,
        UserAddressAdapter,
        CheckoutComPaymentService,
        CheckoutDeliveryFacade,
        GlobalMessageService,
        ChangeDetectorRef,
        UserAddressAdapter,
        ModalService,
        {
          provide: UserAddressService,
          useClass: MockUserAddressService
        },
        {
          provide: CheckoutComPaymentService,
          useClass: MockCheckoutComPaymentService
        },
        {
          provide: CheckoutComAchService,
          useClass: MockCheckoutComAchService
        },
        {
          provide: CheckoutDeliveryFacade,
          useClass: MockCheckoutDeliveryFacade
        },
        {
          provide: RoutingService,
          useClass: MockRoutingService,
        },
      ]
    }).compileComponents();
    plaidLinkService = TestBed.inject(NgxPlaidLinkService);
    checkoutComAchService = TestBed.inject(CheckoutComAchService);
    userAddressService = TestBed.inject(UserAddressService);
    modalInstance = TestBed.inject(ModalService);
    checkoutDeliveryFacade = TestBed.inject(CheckoutDeliveryFacade);
    routingService = TestBed.inject(RoutingService);
    store = TestBed.inject(Store);
    spyOn(store, 'dispatch').and.callThrough();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutComApmAchComponent);
    component = fixture.componentInstance;
    component.achEnabled.next(true);
    component.billingAddressForm = new FormGroup({});
    spyOn(component, 'open').and.returnValue();
    spyOn(modalInstance, 'open').and.callThrough();
    spyOn(modalInstance, 'closeActiveModal').and.callThrough();
    fixture.detectChanges();
    spyOn(component, 'showACHPopUpPayment').and.callThrough();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should Get Delivery Address', () => {
    component.getDeliveryAddress();
    fixture.detectChanges();
    expect(component.paymentAddress).toBe(deliveryAddress);
  });

  it('should toggle enable/disable continue button', () => {
    expect(component.disabled).toBeTrue;
    const checkbox = fixture.debugElement.query(By.css('#customerConsent'));
    expect(checkbox).toBeTruthy();
    checkbox.nativeElement.click();
    expect(component.disabled).toBeFalse();
  });

  it('should select Same Shipping Address', () => {
    component.sameAsShippingAddress$ = new BehaviorSubject<boolean>(true);
    component.sameShippingAddress();
    expect(component.sameAddress).toBe(true);
    expect(component.paymentAddress).toBe(deliveryAddress);
  });

  describe('should show Billing Address Form', () => {
    beforeEach(() => {
      component.sameAsShippingAddress$ = new BehaviorSubject<boolean>(true);
      component.sameShippingAddress();
      const sameAsShippingAddressCheckbox: HTMLInputElement = fixture.debugElement.query(By.css('#same-as-shipping-checkbox')).nativeElement;
      expect(sameAsShippingAddressCheckbox.checked).toBeTrue();
      sameAsShippingAddressCheckbox.click();
      fixture.detectChanges();
      expect(sameAsShippingAddressCheckbox.checked).toBeFalse();
      expect(component.sameAddress).toBe(false);
      expect(fixture.debugElement.query(By.css('#billing-address-form'))).toBeTruthy();
    });

    it('should Handle Address Verification Results', () => {
      expect(component.paymentAddress).toBe(deliveryAddress);
      const {
        firstName,
        lastName,
        line1,
        line2,
        town,
        region,
        country,
        postalCode
      } = billingAddress;
      const formValue = {
        firstName,
        lastName,
        line1,
        line2,
        town,
        region,
        country,
        postalCode
      };
      component.billingAddressForm.setValue(formValue);
      component.handleAddressVerificationResults(addressValidation);
      expect(component.paymentAddress).toEqual(formValue);
      expect(component.open).toHaveBeenCalled();
    });
  });

  it('plaid popup button should be visible', () => {
    fixture.detectChanges();
    expect(fixture.debugElement.nativeElement.querySelector('button[data-test-id="ach-plaid-open-btn"]')).toBeTruthy();
  });

  it('plaid popup button should not to be visible if plaid has error', () => {
    component.achEnabled.next(false);
    fixture.detectChanges();
    expect(fixture.debugElement.nativeElement.querySelector('button[data-test-id="ach-plaid-open-btn"]')).toBeFalsy();
  });

  it('plaid popup should be visible when user click open button', () => {
    component.linkToken.next('link-sandbox-294f20db-2531-44a6-a2f0-136506c963a6');
    let button = fixture.debugElement.nativeElement.querySelector('button[data-test-id="ach-plaid-open-btn"]');
    button.disabled = false;
    button.click();
    fixture.detectChanges();
    expect(component.showACHPopUpPayment).toHaveBeenCalled();
  });

  describe('plaid popup should be open', () => {
    let buttonContinue;
    const findModal = () => fixture.debugElement.nativeElement.closest('body').querySelector('y-checkout-com-apm-ach-account-list-modal');
    const openModal = () => {
      expect(component.achMetadata).toBe(metadata);
      component.onSuccess(metadata.public_token, metadata);
      expect(modalInstance.open).toHaveBeenCalledWith(CheckoutComApmAchAccountListModalComponent, {
        centered: true,
        size: 'md',
      });
      expect(component.modalRef.componentInstance.achMetadata).toBe(component.achMetadata);
      expect(findModal()).toBeTruthy();
    };

    beforeEach(() => {
      const termsAndConditionCheckbox = fixture.debugElement.query(By.css('#customerConsent')).nativeElement;
      buttonContinue = fixture.debugElement.nativeElement.querySelector('button[data-test-id="ach-plaid-open-btn"]');
      spyOn(plaidLinkService, 'createPlaid').and.callThrough();
      expect(component.linkToken.getValue()).toEqual(achLinkToken);
      component.linkToken.next(component.linkToken.getValue());
      expect(termsAndConditionCheckbox).toBeTruthy();
      expect(buttonContinue).toBeTruthy();
      /**
       * Terms and conditions Checkbox Events Handlers
       */
      expect(termsAndConditionCheckbox.checked).toBeFalse();
      expect(buttonContinue.disabled).toBeTrue();
      termsAndConditionCheckbox.click();
      fixture.detectChanges();
      expect(termsAndConditionCheckbox.checked).toBeTrue();
      expect(buttonContinue.disabled).toBeFalse();
    });

    it(' when user clicks open button', () => {
      fixture.detectChanges();
      buttonContinue.click();
      fixture.detectChanges();
      expect(component.showACHPopUpPayment).toHaveBeenCalled();
      expect(plaidLinkService.createPlaid).toHaveBeenCalled();
      console.log('Plaidlink Modal open');
      const closeIframe = new Promise(resolve => setTimeout(resolve, 2000));

      closeIframe.then(() => {
        const iframe = fixture.nativeElement.ownerDocument.querySelector('iframe');
        iframe.remove();
        console.log('Plaidlink Modal Removed');
      });
    });

    describe('should open Account List Modal', () => {
      beforeEach(() => openModal());

      it('then should close Account List Modal', () => {
        const modal = findModal();
        const closeButton = modal.querySelector('.close');
        expect(closeButton).toBeTruthy();
        closeButton.click();
        fixture.detectChanges();
        expect(component.showLoadingIcon).toBe(false);
        expect(modalInstance.getActiveModal().closed).toBeTruthy();
      });

      it(' and should place order', () => {
        spyOn(component, 'placeOrder').and.callThrough();
        modalInstance.closeActiveModal({
          type: 'submit',
          parameters: component.achMetadata
        });
        expect(component.showLoadingIcon).toBe(true);
        expect(component.placeOrder).toHaveBeenCalledWith(metadata);
        fixture.detectChanges();
        checkoutComAchService.requestPlaidSuccessOrder(component.achMetadata.public_token, component.achMetadata, !component.disabled)
          .subscribe(order => expect(order).toEqual({
            order: mockOrder,
            error: null
          }));
        expect(routingService.go).toHaveBeenCalledWith({ cxRoute: 'orderConfirmation' });
        expect(modalInstance.getActiveModal().closed).toBeTruthy();
      });
    });
  });

  it('should show Popup Consents', () => {
    let popupConsent = fixture.debugElement.query(By.css('#popup-consent')).nativeElement;
    fixture.detectChanges();
    popupConsent.click();
    expect(modalInstance.open).toHaveBeenCalledWith(CheckoutComApmAchConsentsComponent, {
      centered: true,
      size: 'lg',
    });
  });
});
