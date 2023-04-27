import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutComPaymentDetailsComponent } from './checkout-com-payment-details.component';
import { I18nTestingModule, PaymentDetails, UserAddressAdapter, UserIdService, UserPaymentService } from '@spartacus/core';
import { StoreModule } from '@ngrx/store';
import { CHECKOUT_COM_FEATURE } from '../../../core/store/checkout-com.state';
import { reducer } from '../../../core/store/checkout-com.reducer';
import { PaymentFormModule } from '@spartacus/checkout/components';
import { CheckoutComPaymentFormModule } from './checkout-com-payment-form/checkout-com-payment-form.module';
import { Observable, of } from 'rxjs';
import { ApplicationModule, Component, DebugElement, Input } from '@angular/core';
import { CardComponent } from '@spartacus/storefront';
import { CheckoutComPaymentService } from '../../../core/services/checkout-com-payment.service';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

@Component({
  template: '',
  selector: 'cx-spinner',
})
class MockCxSpinnerComponent {
}

const mockCardContent = {
  id: '2',
  defaultPayment: false,
  accountHolderName: 'Test User',
  expiryMonth: '11',
  expiryYear: '2020',
  cardNumber: '4242424242424242',
  cardType: {
    code: 'visa',
    name: 'Visa'
  },
};
const mockPayment: PaymentDetails = {
  defaultPayment: true,
  accountHolderName: 'John Doe',
  cardNumber: '4111 1111 1111 1111',
  expiryMonth: '11',
  expiryYear: '2020',
  id: '2',
  cardType: {
    code: 'master',
  },
};

@Component({
  selector: 'cx-icon',
  template: '',
})
class MockCxIconComponent {
  @Input() type;
}

class MockUserPaymentService {
  getPaymentMethodsLoading(): Observable<boolean> {
    return of();
  }

  getPaymentMethods(): Observable<PaymentDetails[]> {
    return of([mockPayment]);
  }

  loadPaymentMethods(): void {
  }

  deletePaymentMethod(_paymentMethodId: string): void {
  }

  setPaymentMethodAsDefault(_paymentMethodId: string): void {
  }
}

class MockCheckoutComPaymentService implements Partial<CheckoutComPaymentService> {
  updatePaymentDetails(paymentDetails) {
    return of(null);
  }

  getIsABC(): void {
  }
  getIsABCFromState():Observable<boolean> {
    return of(null);
  }
}

class MockUserIdService implements Partial<UserIdService> {
  getUserId() {
    return of('100');
  }
}

describe('CheckoutComPaymentDetailsComponent', () => {
  let component: CheckoutComPaymentDetailsComponent;
  let fixture: ComponentFixture<CheckoutComPaymentDetailsComponent>;
  let userService: UserPaymentService;
  let checkoutComPaymentService: CheckoutComPaymentService;
  let userIdService: UserIdService;
  let spy: any;
  let el: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
        declarations: [
          CheckoutComPaymentDetailsComponent,
          MockCxSpinnerComponent,
          CardComponent,
          MockCxIconComponent,
        ],
        imports: [
          ApplicationModule,
          I18nTestingModule,
          StoreModule.forRoot({}),
          StoreModule.forFeature(CHECKOUT_COM_FEATURE, reducer),
          PaymentFormModule,
          CheckoutComPaymentFormModule,
          RouterTestingModule,
        ],
        providers: [
          UserAddressAdapter,
          {
            provide: UserPaymentService,
            useClass: MockUserPaymentService
          },
          {
            provide: CheckoutComPaymentService,
            useClass: MockCheckoutComPaymentService
          },
          {
            provide: UserIdService,
            useClass: MockUserIdService,
          }
        ],
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutComPaymentDetailsComponent);
    component = fixture.componentInstance;
    el = fixture.debugElement;
    userService = TestBed.inject(UserPaymentService);
    checkoutComPaymentService = TestBed.inject(CheckoutComPaymentService);
    userIdService = TestBed.inject(UserIdService);
    spy = spyOn(checkoutComPaymentService, 'getIsABCFromState');
    spy.and.returnValue(of(false));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show basic information', () => {
    function getTitle(elem: DebugElement) {
      return elem.query(By.css('.cx-header')).nativeElement.textContent;
    }

    function getBodyMessage(elem: DebugElement) {
      return elem.query(By.css('.cx-msg')).nativeElement.textContent;
    }

    component.ngOnInit();
    fixture.detectChanges();
    expect(getTitle(el)).toContain('paymentMethods.paymentMethods');
    expect(getBodyMessage(el)).toContain(' paymentMethods.newPaymentMethodsAreAddedDuringCheckout ');
  });

  it('should show spinner if payment methods are loading', () => {
    spyOn(userService, 'getPaymentMethodsLoading').and.returnValue(of(true));

    function getSpinner(elem: DebugElement) {
      return elem.query(By.css('cx-spinner'));
    }
    component.ngOnInit();
    fixture.detectChanges();
    expect(getSpinner(el)).toBeTruthy();
  });

  it('should show payment methods after loading', () => {
    spyOn(userService, 'getPaymentMethodsLoading').and.returnValue(of(false));
    function getCard(elem: DebugElement) {
      return elem.query(By.css('cx-card'));
    }
    component.ngOnInit();
    fixture.detectChanges();
    expect(getCard(el)).toBeTruthy();
  });

  it('should render all payment methods', () => {
    spyOn(userService, 'getPaymentMethodsLoading').and.returnValue(of(false));
    spyOn(userService, 'getPaymentMethods').and.returnValue(
      of([mockPayment, mockPayment])
    );

    function getCards(elem: DebugElement): DebugElement[] {
      return elem.queryAll(By.css('cx-card'));
    }
    component.ngOnInit();
    fixture.detectChanges();
    expect(getCards(el).length).toEqual(2);
  });

  it('should show confirm on delete', () => {
    spyOn(userService, 'getPaymentMethodsLoading').and.returnValue(of(false));
    spyOn(userService, 'getPaymentMethods').and.returnValue(
      of([mockPayment])
    );

    function getDeleteMsg(elem: DebugElement): string {
      return elem.query(By.css('cx-card .cx-card-delete-msg')).nativeElement.textContent;
    }
    function getDeleteButton(elem: DebugElement): any {
      return elem.queryAll(By.css('cx-card .card-link'))[1].nativeElement;
    }
    function getCancelButton(elem: DebugElement): DebugElement {
      return elem.query(By.css('cx-card .btn-secondary'));
    }
    component.ngOnInit();
    fixture.detectChanges();
    getDeleteButton(el).click();
    fixture.detectChanges();
    expect(getDeleteMsg(el)).toContain('paymentCard.deleteConfirmation');
    getCancelButton(el).nativeElement.click();
    fixture.detectChanges();
    expect(getCancelButton(el)).toBeFalsy();
  });

  it('should show update payment method form', () => {
    spyOn(userService, 'getPaymentMethodsLoading').and.returnValue(of(false));
    spyOn(userService, 'getPaymentMethods').and.returnValue(
      of([mockPayment])
    );

    function getEditButton(elem: DebugElement): any {
      return elem.queryAll(By.css('cx-card .card-link'))[0].nativeElement;
    }
    function getPaymentMethodForm(elem: DebugElement): DebugElement {
      return elem.query(By.css('y-checkout-com-payment-form'));
    }
    component.ngOnInit();
    fixture.detectChanges();
    getEditButton(el).click();
    fixture.detectChanges();
    expect(getPaymentMethodForm(el)).toBeTruthy();
  });

  it('should not show edit button', () => {
    spyOn(userService, 'getPaymentMethodsLoading').and.returnValue(of(false));
    spyOn(userService, 'getPaymentMethods').and.returnValue(
      of([mockPayment])
    );
    spy.and.returnValue(of(true));

    function getActionButtons(elem: DebugElement): any {
      return elem.queryAll(By.css('cx-card .card-link'));
    }
    function getPaymentMethodForm(elem: DebugElement): DebugElement {
      return elem.query(By.css('y-checkout-com-payment-form'));
    }
    component.ngOnInit();
    fixture.detectChanges();
    expect(getActionButtons(el).length).toBe(1);
    expect(getPaymentMethodForm(el)).toBeFalsy();
  });
});
