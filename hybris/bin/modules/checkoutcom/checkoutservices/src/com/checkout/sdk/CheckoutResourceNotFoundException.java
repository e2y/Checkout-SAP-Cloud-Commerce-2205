package com.checkout.sdk;

import com.checkout.sdk.common.ApiResponseInfo;

public class CheckoutResourceNotFoundException extends CheckoutApiException {
    public CheckoutResourceNotFoundException(String requestId) {
        super(new ApiResponseInfo(404, requestId));
    }
}