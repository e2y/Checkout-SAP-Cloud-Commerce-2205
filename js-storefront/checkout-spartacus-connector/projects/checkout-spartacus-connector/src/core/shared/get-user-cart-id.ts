import { ActiveCartService, UserIdService, getCartIdByUserId, Cart } from '@spartacus/core';
import { Observable } from 'rxjs';
import { withLatestFrom, map, first, take } from 'rxjs/operators';

export function getUserIdCartId(
  userIdService: UserIdService,
  activeCartService: ActiveCartService,
): Observable<{ userId: string, cartId: string }> {
  return activeCartService.getActive().pipe(
    first((cart: Cart) => cart != null && typeof cart === 'object' && Object.keys(cart).length > 0),
    withLatestFrom(userIdService.getUserId()),
    map(([cart, userId]): {cartId: string, userId: string} => ({userId, cartId: getCartIdByUserId(cart, userId)})),
    take(1)
  );
}
