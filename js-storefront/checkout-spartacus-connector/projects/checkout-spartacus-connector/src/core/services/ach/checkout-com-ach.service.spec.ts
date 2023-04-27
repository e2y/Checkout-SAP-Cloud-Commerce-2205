import { TestBed } from '@angular/core/testing';
import { CheckoutComAchService } from './checkout-com-ach.service';
import { ActiveCartService, Cart, GlobalMessageService, GlobalMessageType, HttpErrorModel, Order, Translatable, UserIdService } from '@spartacus/core';
import { CHECKOUT_COM_FEATURE, StateWithCheckoutCom } from '../../store/checkout-com.state';
import { Store, StoreModule } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { SetAchLinkToken, SetAchLinkTokenSuccess, SetAchOrderSuccess, SetAchOrderSuccessSuccess, } from '../../store/checkout-com.actions';
import { AchSuccessOrder, } from '../../model/Ach';
import { reducer } from '../../store/checkout-com.reducer';
import createSpy = jasmine.createSpy;

describe('CheckoutComAchService', () => {
  let service: CheckoutComAchService;
  let userIdService: UserIdService;
  let checkoutComStore: Store<StateWithCheckoutCom>;
  let globalMessageService: GlobalMessageService;

  const userId = 'testUserId';
  const cartId = 'testCartId';

  const publicToken = 'public-sandbox-294f20db-2531-44a6-a2f0-136506c963a6';

  const institutionMeta = {
    name: 'Bank of America',
    institution_id: 'ins_127989'
  };
  const address = {
    'country': {
      'isocode': 'US',
      'name': 'United States'
    },
    'defaultAddress': false,
    'firstName': 'a',
    'formattedAddress': 'a, a, Arkansas, a, a',
    'id': '8796162621463',
    'lastName': 'a',
    'line1': 'a',
    'line2': 'a',
    'phone': 'a',
    'postalCode': 'a',
    'region': {
      'countryIso': 'US',
      'isocode': 'US-AR',
      'isocodeShort': 'AR',
      'name': 'Arkansas'
    },
    'shippingAddress': true,
    'town': 'a',
    'visibleInAddressBook': true
  };
  const orderSuccess: Order = {
    'code': '00001037',
    'deliveryAddress': address,
    'entries': [
      {
        'product': {
          'averageRating': 4.5,
          'code': '300938',
          'manufacturer': 'HP',
          'name': 'Photosmart E317 Digital Camera',
        },
        'quantity': 1,
      }
    ],
    'paymentInfo': {
      'billingAddress': address,
    },
    'totalItems': 1,
    'totalPrice': {
      'currencyIso': 'USD',
      'formattedValue': '$120.11',
      'value': 120.11
    },
  };
  const accountMeta = {
    id: '5QqJxWGn7zCBrqKv5jAMUk61aKmRDBtpNvwRq',
    name: 'Plaid Checking',
    mask: '0000',
    type: 'depository',
    subtype: 'checking',
    verification_status: null,
    class_type: null
  };

  const metadata = {
    status: '',
    link_session_id: '',
    institution: institutionMeta,
    accounts: [accountMeta, accountMeta],
    account: accountMeta,
    account_id: '',
    transfer_status: '',
    public_token: ''
  };

  let customerConsents = true;

  class MockCheckoutComAchService implements Partial<CheckoutComAchService> {
    requestPlaidLinkToken(): Observable<string> {
      checkoutComStore.dispatch(new SetAchLinkToken({
        userId,
        cartId
      }));
      return this.getPlaidLinkToken();
    }

    getPlaidLinkToken(): Observable<string> {
      return of('link-sandbox-294f20db-2531-44a6-a2f0-136506c963a6');
    }

    requestPlaidSuccessOrder(): Observable<AchSuccessOrder> {
      checkoutComStore.dispatch(new SetAchOrderSuccess({
        userId,
        cartId,
        publicToken,
        metadata,
        customerConsents
      }));
      return this.getPlaidOrder();
    }

    getPlaidOrder(): Observable<AchSuccessOrder> {
      return of({order: orderSuccess, error: null});
    }

  }

  class ActiveCartServiceStub {
    cartId = cartId;

    public getActiveCartId() {
      return of(this.cartId);
    }

    getActive(): Observable<Cart> {
      return of({
        code: cartId
      });
    }
  }

  class UserIdServiceStub implements Partial<UserIdService> {
    getUserId = createSpy('getUserId').and.returnValue(of(userId));
  }

  class MockGlobalMessageService implements Partial<GlobalMessageService> {
    add(text: string | Translatable, type: GlobalMessageType, timeout?: number): void {
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({}),
        StoreModule.forFeature(CHECKOUT_COM_FEATURE, reducer),
      ],
      providers: [
        {
          provide: ActiveCartService,
          useClass: ActiveCartServiceStub
        },
        {
          provide: UserIdService,
          useClass: UserIdServiceStub
        },
        {
          provide: GlobalMessageService,
          useClass: MockGlobalMessageService
        },
        {
          provide: CheckoutComAchService,
          useClass: MockCheckoutComAchService
        },
      ]
    });

    service = TestBed.inject(CheckoutComAchService);
    checkoutComStore = TestBed.inject(Store);
    userIdService = TestBed.inject(UserIdService);
    globalMessageService = TestBed.inject(GlobalMessageService);

    spyOn(checkoutComStore, 'dispatch').and.callThrough();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should dispatch events for requestPlaidLinkToken', () => {
    service.requestPlaidLinkToken();

    expect(checkoutComStore.dispatch).toHaveBeenCalledWith(
      new SetAchLinkToken({
        userId,
        cartId
      })
    );
  });

  it('should getPlaidLinkToken request from state', (done) => {
    const payload = 'link-sandbox-294f20db-2531-44a6-a2f0-136506c963a6';

    checkoutComStore.dispatch(
      new SetAchLinkTokenSuccess(payload as string)
    );

    service.getPlaidLinkToken()
    .subscribe((achLinkToken) => {
      expect(achLinkToken).not.toBeNull();
      expect(achLinkToken).toEqual(payload);
      done();
    })
    .unsubscribe();
  });

  it('should dispatch events for requestPlaidSuccessOrder', () => {
    service.requestPlaidSuccessOrder(publicToken, metadata, customerConsents);

    expect(checkoutComStore.dispatch).toHaveBeenCalledWith(
      new SetAchOrderSuccess({
        userId,
        cartId,
        publicToken,
        metadata,
        customerConsents
      })
    );
  });

  it('should getPlaidOrderId request from state', (done) => {

    checkoutComStore.dispatch(
      new SetAchOrderSuccessSuccess(orderSuccess as Order)
    );

    service.getPlaidOrder()
    .subscribe((AchOrder) => {
      expect(AchOrder).not.toBeNull();
      expect(AchOrder).toEqual({order: orderSuccess, error: null});
      done();
    })
    .unsubscribe();
  });
});
