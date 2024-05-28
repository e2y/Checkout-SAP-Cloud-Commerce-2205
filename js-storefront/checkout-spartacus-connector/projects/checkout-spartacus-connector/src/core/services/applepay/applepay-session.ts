/* tslint:disable */
import { WindowRef } from '@spartacus/core';

export const createApplePaySession = (windowRef: WindowRef): null | any => {
  if (!windowRef.isBrowser()) {
    return null;
  }

  return (windowRef.nativeWindow as { [key: string]: any })['ApplePaySession'];
}
/* tslint:enable */
