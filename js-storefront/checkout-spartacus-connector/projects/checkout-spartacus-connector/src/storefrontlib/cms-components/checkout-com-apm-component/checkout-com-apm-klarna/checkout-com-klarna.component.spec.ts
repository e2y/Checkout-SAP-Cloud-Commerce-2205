import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutComKlarnaComponent, KlarnaAddress } from './checkout-com-klarna.component';
import { BehaviorSubject, EMPTY, of, throwError } from 'rxjs';
import { PaymentType } from '../../../../core/model/ApmData';
import { CheckoutComApmService } from '../../../../core/services/checkout-com-apm.service';
import { Address, GlobalMessageService, GlobalMessageType, I18nTestingModule } from '@spartacus/core';
import { CheckoutComPaymentService } from '../../../../core/services/checkout-com-payment.service';
import { CheckoutDeliveryFacade } from '@spartacus/checkout/root';
import { Component, Input, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { KlarnaInitParams } from '../../../../core/interfaces';
import createSpy = jasmine.createSpy;

@Component({
  selector: 'lib-checkout-com-billing-address',
  template: '',
})
export class MockCheckoutComBillingAddressComponent {
  @Input() billingAddressForm: FormGroup;
  @Output() sameAsShippingAddressChange = new BehaviorSubject<boolean>(true);
}

const apm = { code: PaymentType.Klarna };

class CheckoutComApmServiceStub {
  getSelectedApmFromState = createSpy('getSelectedApmFromState').and.returnValue(of(apm));
  selectApm = createSpy('selectApm').and.stub();

  getKlarnaInitParams() {
    return of(EMPTY);
  };
}

class MockCheckoutComStore {
}

class MockGlobalMessageService {
  add = createSpy();
}

class MockCheckoutDeliveryFacade {
  getDeliveryAddress() {
    return of({ country: 'ES' });
  }
}

class CheckoutComPaymentStub {
  setPaymentAddress = createSpy('setPaymentAddress').and.stub();
  getPaymentAddressFromState = createSpy('getPaymentAddressFromState').and.returnValue(of({}));

  updatePaymentAddress() {
    return of(EMPTY);
  };
}

const billingAddressForm = new FormGroup({
  firstName: new FormControl(''),
  lastName: new FormControl(''),
  line1: new FormControl(''),
  postalCode: new FormControl(''),
  town: new FormControl(''),
  phone: new FormControl(''),
  country: new FormGroup({
    isocode: new FormControl('')
  })
});

const shippingAddress: Address = {
  firstName: 'firstName',
  lastName: 'lastName',
  email: 'test@test.com',
  line1: 'line1',
  postalCode: '000000',
  town: 'town',
  phone: '+000000',
  country: { isocode: 'US' },
};
const billingAddress: Address = {
  firstName: 'billingFirstName',
  lastName: 'billingLastName',
  line1: 'line1',
  postalCode: '000000',
  town: 'town',
  phone: '+000000',
  country: { isocode: 'CA' },
};

describe('CheckoutComKlarnaComponent', () => {
  let component: CheckoutComKlarnaComponent;
  let fixture: ComponentFixture<CheckoutComKlarnaComponent>;
  let checkoutDeliveryFacade: CheckoutDeliveryFacade;
  let checkoutComApmSrv: CheckoutComApmService;
  let msgSrv: GlobalMessageService;
  let checkoutComPaymentService: CheckoutComPaymentService;
  let initParamsSpy;
  let spyOnWinref;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CheckoutComKlarnaComponent, MockCheckoutComBillingAddressComponent],
      imports: [I18nTestingModule],
      providers: [
        {
          provide: CheckoutComApmService,
          useClass: CheckoutComApmServiceStub
        },
        {
          provide: GlobalMessageService,
          useClass: MockGlobalMessageService
        },
        {
          provide: CheckoutComPaymentService,
          useClass: CheckoutComPaymentStub
        },
        {
          provide: CheckoutDeliveryFacade,
          useClass: MockCheckoutDeliveryFacade
        },
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutComKlarnaComponent);
    component = fixture.componentInstance;
    checkoutDeliveryFacade = TestBed.inject(CheckoutDeliveryFacade);
    checkoutComApmSrv = TestBed.inject(CheckoutComApmService);
    msgSrv = TestBed.inject(GlobalMessageService);
    checkoutComPaymentService = TestBed.inject(CheckoutComPaymentService);
    initParamsSpy = spyOn(checkoutComApmSrv, 'getKlarnaInitParams');
    initParamsSpy.and.callThrough();
    // @ts-ignore
    spyOn(component, 'loadWidget').and.callThrough();
    // @ts-ignore
    spyOnWinref = spyOnProperty(component.windowRef, 'nativeWindow');
    spyOnWinref.and.returnValue({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('normalizeKlarnaAddress', () => {
    it('should return KlarnaAddress with all fields filled when Address is complete', () => {
      component.emailAddress = 'john.doe@example.com';
      const address: Address = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        line1: '123 Street',
        postalCode: '12345',
        town: 'Town',
        phone: '1234567890',
        country: { isocode: 'US' },
      };
      const expected: KlarnaAddress = {
        given_name: 'John',
        family_name: 'Doe',
        email: 'john.doe@example.com',
        street_address: '123 Street',
        postal_code: '12345',
        city: 'Town',
        phone: '1234567890',
        country: 'US',
      };
      expect(component.normalizeKlarnaAddress(address)).toEqual(expected);
    });

    it('should return KlarnaAddress with empty fields when Address is incomplete', () => {
      const address: Address = {
        firstName: '',
        lastName: '',
        email: component.emailAddress,
        line1: '',
        postalCode: '',
        town: '',
        phone: '',
        country: null,
      };
      const expected: KlarnaAddress = {
        given_name: '',
        family_name: '',
        email: '',
        street_address: '',
        postal_code: '',
        city: '',
        phone: '',
        country: '',
      };
      expect(component.normalizeKlarnaAddress(address)).toEqual(expected);
    });

    it('should return KlarnaAddress with emailAddress when Address email is missing', () => {
      const address: Address = {
        firstName: 'John',
        lastName: 'Doe',
        email: component.emailAddress,
        line1: '123 Street',
        postalCode: '12345',
        town: 'Town',
        country: { isocode: 'US' },
        phone: '1234567890',
      };
      const expected: KlarnaAddress = {
        given_name: 'John',
        family_name: 'Doe',
        email: '',
        street_address: '123 Street',
        postal_code: '12345',
        city: 'Town',
        phone: '1234567890',
        country: 'US',
      };
      expect(component.normalizeKlarnaAddress(address)).toEqual(expected);
    });
  });

  describe('listenForAddressSourceChange', () => {
    it('should update klarnaShippingAddressData and klarnaBillingAddressData when sameAsShippingAddress is true', () => {
      component.sameAsShippingAddress$.next(true);
      spyOn(checkoutDeliveryFacade, 'getDeliveryAddress').and.returnValue(of(shippingAddress));
      component.listenForAddressSourceChange();
      expect(component.klarnaShippingAddressData).toEqual(component.normalizeKlarnaAddress(shippingAddress));
      expect(component.klarnaBillingAddressData).toEqual(component.klarnaShippingAddressData);
    });

    it('should update klarnaShippingAddressData and klarnaBillingAddressData separately when sameAsShippingAddress is false', () => {
      component.billingAddressForm = billingAddressForm;
      component.billingAddressForm.patchValue(billingAddress);
      component.sameAsShippingAddress$.next(false);
      fixture.detectChanges();
      spyOn(checkoutDeliveryFacade, 'getDeliveryAddress').and.returnValue(of(shippingAddress));
      component.listenForAddressSourceChange();
      fixture.detectChanges();
      expect(component.klarnaShippingAddressData).toEqual(component.normalizeKlarnaAddress(shippingAddress));
      expect(component.klarnaBillingAddressData).toEqual(component.normalizeKlarnaAddress(billingAddress));
    });

    it('should not update klarnaBillingAddressData when sameAsShippingAddress is false and country is not selected', () => {
      component.billingAddressForm.patchValue(billingAddress);
      component.sameAsShippingAddress$.next(false);
      spyOn(checkoutDeliveryFacade, 'getDeliveryAddress').and.returnValue(of(shippingAddress));
      component.listenForAddressSourceChange();
      expect(component.klarnaShippingAddressData).toEqual(component.normalizeKlarnaAddress(shippingAddress));
      expect(component.klarnaBillingAddressData).not.toEqual(component.normalizeKlarnaAddress(billingAddress));
    });
  });

  describe('authorize', () => {
    it('should not authorize when sameAsShippingAddress is false and billingAddressForm is invalid', () => {
      component.sameAsShippingAddress$.next(false);
      component.billingAddressForm.setErrors({ invalid: true });
      component.authorize();
      expect(component.authorizing$.getValue()).toBe(false);
    });

    it('should not authorize when authorizing$ is true', () => {
      component.authorizing$.next(true);
      component.authorize();
      expect(component.authorizing$.getValue()).toBe(true);
    });

    it('should not authorize when Klarna is not set', () => {
      // @ts-ignore
      spyOnWinref.and.returnValue({});
      component.authorize();
      expect(component.authorizing$.getValue()).toBe(false);
    });

    it('should authorize when sameAsShippingAddress is true', () => {
      component.sameAsShippingAddress$.next(true);
      // @ts-ignore
      spyOnWinref.and.returnValue({
        Klarna: {
          Payments: {
            authorize: jasmine.createSpy().and.callFake((_, __, callback) => callback({
              approved: true,
              authorization_token: 'token'
            }))
          }
        }
      });
      component.authorize();
      expect(component.authorizing$.getValue()).toBe(false);
    });

    it('should authorize when sameAsShippingAddress is false and billingAddressForm is valid', () => {
      component.sameAsShippingAddress$.next(false);
      component.billingAddressForm.setErrors(null);
      // @ts-ignore
      spyOnWinref.and.returnValue({
        Klarna: {
          Payments: {
            authorize: jasmine.createSpy().and.callFake((_, __, callback) => callback({
              approved: true,
              authorization_token: 'token'
            }))
          }
        }
      });
      component.authorize();
      expect(component.authorizing$.getValue()).toBe(false);
    });
  });

  describe('listenForCountryCode', () => {
    beforeEach(() => {
      component.billingAddressForm = billingAddressForm;
      // @ts-ignore
      component.billingAddressHasBeenSet = false;
      // @ts-ignore
      component.currentCountryCode.next(null);
    });
    it('should initialize Klarna when country code is set and billing address has been set', () => {
      initParamsSpy.and.returnValue(of({
        clientToken: 'token',
        paymentContext: 'context',
        instanceId: 'id'
      }));
      // @ts-ignore
      component.billingAddressHasBeenSet = true;
      // @ts-ignore
      component.currentCountryCode.next('US');
      // @ts-ignore
      spyOn(component, 'initKlarna');
      // @ts-ignore
      component.listenForCountryCode();
      // @ts-ignore
      expect(component.initKlarna).toHaveBeenCalledWith({
        clientToken: 'token',
        paymentContext: 'context',
        instanceId: 'id'
      });
    });

    it('should not initialize Klarna when country code is not set', () => {
      // @ts-ignore
      component.billingAddressHasBeenSet = false;
      // @ts-ignore
      component.currentCountryCode.next(null);
      // @ts-ignore
      spyOn(component, 'initKlarna');
      // @ts-ignore
      component.listenForCountryCode();
      expect(checkoutComApmSrv.getKlarnaInitParams).not.toHaveBeenCalled();
      // @ts-ignore
      expect(component.initKlarna).not.toHaveBeenCalled();
    });

    it('should not initialize Klarna when billing address has not been set', () => {
      // @ts-ignore
      component.billingAddressHasBeenSet = false;
      // @ts-ignore
      component.currentCountryCode.next('US');
      // @ts-ignore
      spyOn(component, 'initKlarna');
      // @ts-ignore
      component.listenForCountryCode();
      //expect(checkoutComApmSrv.getKlarnaInitParams).not.toHaveBeenCalled();
      // @ts-ignore
      expect(component.initKlarna).not.toHaveBeenCalled();
    });

    it('should handle error when getting Klarna init params fails', () => {
      initParamsSpy.and.returnValue(throwError('error'));
      // @ts-ignore
      component.billingAddressHasBeenSet = true;
      // @ts-ignore
      component.currentCountryCode.next('US');
      // @ts-ignore
      component.listenForCountryCode();
      expect(msgSrv.add).toHaveBeenCalledWith({ key: 'paymentForm.klarna.initializationFailed' }, GlobalMessageType.MSG_TYPE_ERROR);
    });
  });

  describe('listenForCountrySelection', () => {
    it('should update currentCountryCode when country is selected', () => {
      component.billingAddressForm = billingAddressForm;
      // @ts-ignore
      component.listenForCountrySelection();
      component.billingAddressForm.setValue(billingAddress);
      fixture.detectChanges();
      // @ts-ignore
      component.currentCountryCode.subscribe(value => {
        expect(value).toEqual('CA');
      });
    });

    it('should not update currentCountryCode when country is not selected', () => {
      component.billingAddressForm = billingAddressForm;
      // @ts-ignore
      component.listenForCountrySelection();
      const countryControl = component.billingAddressForm.get('country.isocode');
      countryControl.setValue(null);
      // @ts-ignore
      component.currentCountryCode.subscribe(value => {
        expect(value).toBeNull();
      });
    });

    it('should not update currentCountryCode when form value changes are not related to country', () => {
      component.billingAddressForm = billingAddressForm;
      const countryControl = component.billingAddressForm.get('country.isocode');
      countryControl.setValue('US');
      // @ts-ignore
      component.listenForCountrySelection();
      component.billingAddressForm.get('firstName').setValue('John');
      // @ts-ignore
      component.currentCountryCode.subscribe(value => {
        expect(value).toEqual('US');
      });
    });
  });

  describe('klarnaIsReady', () => {
    beforeEach(() => {
      component.billingAddressForm = billingAddressForm;
    });

    it('should update currentCountryCode and klarnaShippingAddressData when shipping address is valid', () => {
      const shippingAddress: Address = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        line1: '123 Street',
        postalCode: '12345',
        town: 'Town',
        phone: '1234567890',
        country: { isocode: 'US' },
      };
      component.billingAddressForm = billingAddressForm;
      fixture.detectChanges();
      spyOn(checkoutDeliveryFacade, 'getDeliveryAddress').and.returnValue(of(shippingAddress));
      spyOn(checkoutComPaymentService, 'updatePaymentAddress').and.returnValue(of(shippingAddress));
      // @ts-ignore
      component.klarnaIsReady();
      // @ts-ignore
      expect(component.currentCountryCode.getValue()).toEqual('US');
      expect(component.klarnaShippingAddressData).toEqual(component.normalizeKlarnaAddress(shippingAddress));
    });

    it('should not update currentCountryCode and klarnaShippingAddressData when shipping address is null', () => {
      spyOn(checkoutDeliveryFacade, 'getDeliveryAddress').and.returnValue(of(null));
      // @ts-ignore
      component.klarnaIsReady();
      // @ts-ignore
      expect(component.currentCountryCode.getValue()).toBeNull();
      expect(component.klarnaShippingAddressData).toBeUndefined();
      expect(msgSrv.add).toHaveBeenCalledWith({ key: 'paymentForm.klarna.countryIsRequired' }, GlobalMessageType.MSG_TYPE_ERROR);
    });

    it('should handle error when updatePaymentAddress fails', () => {
      const shippingAddress: Address = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        line1: '123 Street',
        postalCode: '12345',
        town: 'Town',
        phone: '1234567890',
        country: { isocode: 'US' },
      };
      spyOn(checkoutDeliveryFacade, 'getDeliveryAddress').and.returnValue(of(shippingAddress));
      spyOn(checkoutComPaymentService, 'updatePaymentAddress').and.returnValue(throwError('error'));
      // @ts-ignore
      component.klarnaIsReady();
      expect(msgSrv.add).toHaveBeenCalledWith({ key: 'paymentForm.klarna.countryIsRequired' }, GlobalMessageType.MSG_TYPE_ERROR);
    });
  });

  describe('initKlarna', () => {
    it('should initialize Klarna when Klarna is set', () => {
      const k = {
        Payments: {
          init: jasmine.createSpy(),
          load: jasmine.createSpy()
        }
      };
      // @ts-ignore
      spyOnWinref.and.returnValue({ Klarna: k });
      const params: KlarnaInitParams = {
        clientToken: 'token',
        paymentContext: 'context',
        instanceId: 'id'
      };
      // @ts-ignore
      component.initKlarna(params);
      expect(k.Payments.init).toHaveBeenCalledWith({ client_token: 'token' });
      // @ts-ignore
      expect(component.loadWidget).toHaveBeenCalled();
    });

    it('should not initialize Klarna when Klarna is not set', () => {
      // @ts-ignore
      spyOnWinref.and.returnValue({});
      const params: KlarnaInitParams = {
        clientToken: 'token',
        paymentContext: 'context',
        instanceId: 'id'
      };
      // @ts-ignore
      component.initKlarna(params);
      // @ts-ignore
      expect(component.loadWidget).not.toHaveBeenCalled();
    });

    it('should handle error when initializing Klarna fails', () => {
      const k = {
        Payments: {
          init: jasmine.createSpy().and.throwError('error'),
          load: jasmine.createSpy()
        }
      };
      // @ts-ignore
      spyOnWinref.and.returnValue({ Klarna: k });
      const params: KlarnaInitParams = {
        clientToken: 'token',
        paymentContext: 'context',
        instanceId: 'id'
      };
      spyOn(console, 'error');
      // @ts-ignore
      component.initKlarna(params);
      expect(console.error).toHaveBeenCalledWith('CheckoutComKlarnaComponent::initKlarna', jasmine.any(Error));
    });
  });

  describe('addScript', () => {
    it('should add script and define klarnaAsyncCallback when Klarna is not set', () => {
      // @ts-ignore
      spyOnWinref.and.returnValue({});
      const script = document.createElement('script');
      spyOn(document, 'createElement').and.returnValue(script);
      // @ts-ignore
      spyOn(component.windowRef.document.body, 'appendChild');
      // @ts-ignore
      component.addScript();
      expect(script.src).toEqual('https://x.klarnacdn.net/kp/lib/v1/api.js');
      expect(script.async).toEqual(true);
      // @ts-ignore
      expect(component.windowRef.document.body.appendChild).toHaveBeenCalledWith(script);
    });

    it('should not add script but call klarnaIsReady when Klarna is set', () => {
      // @ts-ignore
      spyOnWinref.and.returnValue({ Klarna: {} });
      // @ts-ignore
      spyOn(component.windowRef.document.body, 'appendChild');
      // @ts-ignore
      spyOn(component.ngZone, 'run');
      // @ts-ignore
      component.addScript();
      // @ts-ignore
      expect(component.windowRef.document.body.appendChild).not.toHaveBeenCalled();
      // @ts-ignore
      expect(component.ngZone.run).toHaveBeenCalled();
    });
  });

  describe('loadWidget', () => {
    it('should load widget when Klarna is set', () => {
      const k = {
        load: jasmine.createSpy().and.callFake((_, __, callback) => callback({}))
      };
      // @ts-ignore
      spyOnWinref.and.returnValue({ Klarna: { Payments: k } });
      // @ts-ignore
      component.loadWidget();
      expect(k.load).toHaveBeenCalled();
      expect(component.loadingWidget$.getValue()).toBe(false);
    });

    it('should not load widget when Klarna is not set', () => {
      // @ts-ignore
      spyOnWinref.and.returnValue({});
      // @ts-ignore
      component.loadWidget();
      expect(component.loadingWidget$.getValue()).toBe(false);
    });

    it('should handle error when loading widget fails', () => {
      const k = {
        load: jasmine.createSpy().and.throwError('error')
      };
      // @ts-ignore
      spyOnWinref.and.returnValue({ Klarna: { Payments: k } });
      spyOn(console, 'error');
      // @ts-ignore
      component.loadWidget();
      expect(console.error).toHaveBeenCalledWith('CheckoutComKlarnaComponent::loadWidget', jasmine.any(Error));
      expect(component.loadingWidget$.getValue()).toBe(false);
    });

    it('should handle error when response contains error', () => {
      const k = {
        load: jasmine.createSpy().and.callFake((_, __, callback) => callback({ error: { invalid_fields: ['field'] } }))
      };
      // @ts-ignore
      spyOnWinref.and.returnValue({ Klarna: { Payments: k } });
      spyOn(console, 'error');
      // @ts-ignore
      component.loadWidget();
      expect(console.error).toHaveBeenCalledWith('CheckoutComKlarnaComponent::loadWidget::response', { invalid_fields: ['field'] });
      expect(component.loadingWidget$.getValue()).toBe(false);
    });
  });
});
