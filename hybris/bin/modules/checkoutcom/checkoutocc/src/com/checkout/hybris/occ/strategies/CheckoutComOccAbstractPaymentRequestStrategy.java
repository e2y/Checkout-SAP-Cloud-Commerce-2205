package com.checkout.hybris.occ.strategies;

import com.checkout.hybris.core.address.strategies.CheckoutComPhoneNumberStrategy;
import com.checkout.hybris.core.payment.request.mappers.CheckoutComPaymentRequestStrategyMapper;
import com.checkout.hybris.core.payment.request.strategies.impl.CheckoutComAbstractPaymentRequestStrategy;
import com.checkout.hybris.core.populators.payments.CheckoutComCartModelToPaymentL2AndL3Converter;
import com.checkout.sdk.payments.PaymentRequest;
import com.checkout.sdk.payments.RequestSource;

/**
 * Abstract strategy that overrides redirect URLs for occ
 */
public abstract class CheckoutComOccAbstractPaymentRequestStrategy extends CheckoutComAbstractPaymentRequestStrategy {

    protected static final String CHECKOUT_COM_OCC_PAYMENT_REDIRECT_PAYMENT_SUCCESS = "/order-confirmation?authorized" +
            "=true";
    protected static final String CHECKOUT_COM_OCC_PAYMENT_REDIRECT_PAYMENT_FAILURE =
            "/order-confirmation?authorized=false";
    protected CheckoutPaymentRequestServicesOccWrapper checkoutPaymentRequestServicesOccWrapper;

    protected CheckoutComOccAbstractPaymentRequestStrategy(final CheckoutComPhoneNumberStrategy checkoutComPhoneNumberStrategy,
                                                           final CheckoutComPaymentRequestStrategyMapper checkoutComPaymentRequestStrategyMapper,
                                                           final CheckoutComCartModelToPaymentL2AndL3Converter checkoutComCartModelToPaymentL2AndL3Converter,
                                                           final CheckoutPaymentRequestServicesOccWrapper checkoutPaymentRequestServicesOCCWrapper) {
        super(checkoutComPhoneNumberStrategy, checkoutComPaymentRequestStrategyMapper,
              checkoutComCartModelToPaymentL2AndL3Converter, checkoutPaymentRequestServicesOCCWrapper);
        this.checkoutPaymentRequestServicesOccWrapper = checkoutPaymentRequestServicesOCCWrapper;
    }

    protected CheckoutComOccAbstractPaymentRequestStrategy() {
        // default empty constructor
    }

    /**
     * Populates failure and success urls for the occ
     *
     * @param request the request to populate
     */
    @Override
    protected void populateRedirectUrls(final PaymentRequest<RequestSource> request) {
        request.setSuccessUrl(checkoutPaymentRequestServicesOccWrapper.checkoutComOccUrlService.getFullUrl(CHECKOUT_COM_OCC_PAYMENT_REDIRECT_PAYMENT_SUCCESS, true));
        request.setFailureUrl(checkoutPaymentRequestServicesOccWrapper.checkoutComOccUrlService.getFullUrl(CHECKOUT_COM_OCC_PAYMENT_REDIRECT_PAYMENT_FAILURE, true));
    }
}
