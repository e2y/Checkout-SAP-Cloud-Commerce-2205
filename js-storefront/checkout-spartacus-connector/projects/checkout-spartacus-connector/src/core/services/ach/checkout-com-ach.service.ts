import { Injectable } from '@angular/core';
import { StateWithCheckoutCom } from '../../store/checkout-com.state';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { switchMap } from 'rxjs/operators';
import { AchSuccessMetadata, AchSuccessOrder } from '../../model/Ach';
import { getUserIdCartId } from '../../shared/get-user-cart-id';
import { ActiveCartService, GlobalMessageService, Order, UserIdService } from '@spartacus/core';
import { getAchLinkToken, getAchOrderSuccess, PlaidLinkMetadata } from '../../store/checkout-com.selectors';
import { SetAchAccountListSuccess, SetAchLinkToken, SetAchOrderSuccess } from '../../store/checkout-com.actions';

@Injectable({
  providedIn: 'root'
})
export class CheckoutComAchService {

  constructor(
    protected checkoutComStore: Store<StateWithCheckoutCom>,
    protected activeCartService: ActiveCartService,
    protected userIdService: UserIdService,
    protected globalMessageService: GlobalMessageService,
  ) {
  }


  public requestPlaidLinkToken(): Observable<string> {
    return getUserIdCartId(this.userIdService, this.activeCartService)
      .pipe(
        switchMap(({userId, cartId}) => {
          this.checkoutComStore.dispatch(new SetAchLinkToken({userId, cartId}));
          return this.getPlaidLinkToken();
        }
      ));
  }

  public getPlaidLinkToken(): Observable<string> {
    return this.checkoutComStore.pipe(select(getAchLinkToken));
  }

  public setPlaidLinkMetadata(achSuccessMetadata: AchSuccessMetadata): void {
    this.checkoutComStore.dispatch(new SetAchAccountListSuccess(achSuccessMetadata));
  }

  public getPlaidLinkMetadata(): Observable<AchSuccessMetadata> {
    return this.checkoutComStore.pipe(select(PlaidLinkMetadata));
  }

  public requestPlaidSuccessOrder(publicToken: string, metadata: AchSuccessMetadata, customerConsents: boolean):
    Observable<AchSuccessOrder> {
    return getUserIdCartId(this.userIdService, this.activeCartService)
      .pipe(
        switchMap(({userId, cartId}) => {
            this.checkoutComStore.dispatch(new SetAchOrderSuccess({userId, cartId, publicToken, metadata, customerConsents}));
            return this.getPlaidOrder();
          }
        ));
  }

  public getPlaidOrder(): Observable<AchSuccessOrder> {
    return this.checkoutComStore.pipe(select(getAchOrderSuccess));
  }

}
