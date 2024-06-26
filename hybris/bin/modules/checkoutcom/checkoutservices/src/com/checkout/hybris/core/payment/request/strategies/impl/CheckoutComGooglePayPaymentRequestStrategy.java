package com.checkout.hybris.core.payment.request.strategies.impl;

import com.checkout.hybris.core.address.strategies.CheckoutComPhoneNumberStrategy;
import com.checkout.hybris.core.model.CheckoutComGooglePayConfigurationModel;
import com.checkout.hybris.core.model.CheckoutComGooglePayPaymentInfoModel;
import com.checkout.hybris.core.payment.enums.CheckoutComPaymentType;
import com.checkout.hybris.core.payment.request.mappers.CheckoutComPaymentRequestStrategyMapper;
import com.checkout.hybris.core.payment.request.strategies.CheckoutComPaymentRequestStrategy;
import com.checkout.hybris.core.populators.payments.CheckoutComCartModelToPaymentL2AndL3Converter;
import com.checkout.sdk.payments.PaymentRequest;
import com.checkout.sdk.payments.RequestSource;
import com.checkout.sdk.payments.ThreeDSRequest;
import com.checkout.sdk.payments.TokenSource;
import de.hybris.platform.core.model.order.CartModel;
import de.hybris.platform.core.model.order.payment.PaymentInfoModel;
import de.hybris.platform.core.model.user.AddressModel;

import java.util.Optional;

import static com.checkout.hybris.core.payment.enums.CheckoutComPaymentType.GOOGLEPAY;
import static java.lang.String.format;

/**
 * specific {@link CheckoutComPaymentRequestStrategy} implementation for GooglePay payments
 */
public class CheckoutComGooglePayPaymentRequestStrategy extends CheckoutComAbstractApmPaymentRequestStrategy {

    public CheckoutComGooglePayPaymentRequestStrategy(final CheckoutComPhoneNumberStrategy checkoutComPhoneNumberStrategy,
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
        return GOOGLEPAY;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    protected PaymentRequest<RequestSource> getRequestSourcePaymentRequest(final CartModel cart,
                                                                           final String currencyIsoCode, final Long amount) {
        final PaymentInfoModel paymentInfo = cart.getPaymentInfo();
        if (paymentInfo instanceof CheckoutComGooglePayPaymentInfoModel) {
            return createTokenSourcePaymentRequest((CheckoutComGooglePayPaymentInfoModel) paymentInfo, currencyIsoCode, amount, cart.getPaymentAddress());
        } else {
            throw new IllegalArgumentException(format("Strategy called with unsupported paymentInfo type : [%s] while trying to authorize cart: [%s]", paymentInfo.getClass().toString(), cart.getCode()));
        }
    }

    /**
     * Creates Payment request of type Token source
     *
     * @param paymentInfo     from the cart
     * @param currencyIsoCode currency
     * @param amount          amount
     * @param billingAddress  to set in the request
     * @return paymentRequest to send to Checkout.com
     */
    protected PaymentRequest<RequestSource> createTokenSourcePaymentRequest(final CheckoutComGooglePayPaymentInfoModel paymentInfo,
                                                                            final String currencyIsoCode,
                                                                            final Long amount,
                                                                            final AddressModel billingAddress) {
        final PaymentRequest<RequestSource> paymentRequest = PaymentRequest.fromSource(new TokenSource(paymentInfo.getToken()), currencyIsoCode, amount);
        ((TokenSource) paymentRequest.getSource()).setBillingAddress(billingAddress != null ? createAddress(billingAddress) : null);
        return paymentRequest;
    }

    /**
     * GooglePay is like card payments. Capture or auto-capture depends on the merchant configuration
     *
     * @return tru is we auto-capture, false otherwise
     */
    @Override
    protected Optional<Boolean> isCapture() {
        return Optional.of(checkoutPaymentRequestServicesWrapper.checkoutComMerchantConfigurationService.isAutoCapture());
    }

    /**
     * Create the 3d secure info object for the request.
     *
     * @return ThreeDSRequest the request object
     */
    @Override
    protected Optional<ThreeDSRequest> createThreeDSRequest() {
        final CheckoutComGooglePayConfigurationModel googlePayConfiguration =
            checkoutPaymentRequestServicesWrapper.checkoutComMerchantConfigurationService.getGooglePayConfiguration();
        final ThreeDSRequest threeDSRequest = new ThreeDSRequest();
        Optional.ofNullable(googlePayConfiguration).ifPresent(enabled -> threeDSRequest.setEnabled(googlePayConfiguration.getThreeDSEnabled()));
        return Optional.of(threeDSRequest);
    }
}
