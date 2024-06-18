package com.checkout.hybris.core.payment.request.strategies.impl;

import com.checkout.hybris.core.address.strategies.CheckoutComPhoneNumberStrategy;
import com.checkout.hybris.core.model.CheckoutComKlarnaAPMPaymentInfoModel;
import com.checkout.hybris.core.payment.enums.CheckoutComPaymentType;
import com.checkout.hybris.core.payment.request.mappers.CheckoutComPaymentRequestStrategyMapper;
import com.checkout.hybris.core.payment.request.strategies.CheckoutComPaymentRequestStrategy;
import com.checkout.hybris.core.populators.payments.CheckoutComCartModelToPaymentL2AndL3Converter;
import com.checkout.sdk.payments.PaymentRequest;
import com.checkout.sdk.payments.RequestSource;
import de.hybris.platform.core.model.order.CartModel;

import java.util.Optional;

import static com.checkout.hybris.core.payment.enums.CheckoutComPaymentType.KLARNA;

/**
 * specific {@link CheckoutComPaymentRequestStrategy} implementation for Klarna apm payments
 */
@SuppressWarnings("java:S107")
public class CheckoutComKlarnaPaymentRequestStrategy extends CheckoutComAbstractApmPaymentRequestStrategy {

    public CheckoutComKlarnaPaymentRequestStrategy(final CheckoutComPhoneNumberStrategy checkoutComPhoneNumberStrategy,
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
        return KLARNA;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    protected PaymentRequest<RequestSource> getRequestSourcePaymentRequest(final CartModel cart,
                                                                           final String currencyIsoCode, final Long amount) {

        final CheckoutComKlarnaAPMPaymentInfoModel klarnaPaymentInfo = (CheckoutComKlarnaAPMPaymentInfoModel) cart.getPaymentInfo();

        return PaymentRequest.forKlarna(klarnaPaymentInfo.getPaymentContext());
    }

    /**
     * {@inheritDoc}
     */
    @Override
    protected Optional<Boolean> isCapture() {
        return Optional.of(Boolean.FALSE);
    }

}
