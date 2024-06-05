package com.checkout.hybris.core.payment.request.strategies.impl;

import com.checkout.hybris.core.address.strategies.CheckoutComPhoneNumberStrategy;
import com.checkout.hybris.core.payment.enums.CheckoutComPaymentType;
import com.checkout.hybris.core.payment.request.mappers.CheckoutComPaymentRequestStrategyMapper;
import com.checkout.hybris.core.payment.request.strategies.CheckoutComPaymentRequestStrategy;
import com.checkout.hybris.core.populators.payments.CheckoutComCartModelToPaymentL2AndL3Converter;
import com.checkout.sdk.payments.AlternativePaymentSource;
import com.checkout.sdk.payments.PaymentRequest;
import com.checkout.sdk.payments.RequestSource;
import de.hybris.platform.core.model.order.CartModel;

import static com.checkout.hybris.core.payment.enums.CheckoutComPaymentType.BENEFITPAY;

/**
 * specific {@link CheckoutComPaymentRequestStrategy} implementation for BenefitPay apm payments
 */
public class CheckoutComBenefitPayPaymentRequestStrategy extends CheckoutComAbstractApmPaymentRequestStrategy {

    protected static final String INTEGRATION_TYPE_SOURCE_KEY = "integration_type";
    protected static final String INTEGRATION_TYPE_SOURCE_VALUE = "web";

    public CheckoutComBenefitPayPaymentRequestStrategy(final CheckoutComPhoneNumberStrategy checkoutComPhoneNumberStrategy,
                                                       final CheckoutComPaymentRequestStrategyMapper checkoutComPaymentRequestStrategyMapper,
                                                       final CheckoutComCartModelToPaymentL2AndL3Converter checkoutComCartModelToPaymentL2AndL3Converter,
                                                       final CheckoutPaymentRequestServicesWrapper checkoutPaymentRequestServicesWrapper) {
        super(checkoutComPhoneNumberStrategy, checkoutComPaymentRequestStrategyMapper,
              checkoutComCartModelToPaymentL2AndL3Converter, checkoutPaymentRequestServicesWrapper);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public CheckoutComPaymentType getStrategyKey() {
        return BENEFITPAY;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    protected PaymentRequest<RequestSource> getRequestSourcePaymentRequest(final CartModel cart,
                                                                           final String currencyIsoCode, final Long amount) {
        final PaymentRequest<RequestSource> paymentRequest = super.getRequestSourcePaymentRequest(cart, currencyIsoCode, amount);
        final AlternativePaymentSource source = (AlternativePaymentSource) paymentRequest.getSource();
        source.put(INTEGRATION_TYPE_SOURCE_KEY, INTEGRATION_TYPE_SOURCE_VALUE);

        return paymentRequest;
    }
}
