package com.checkout.hybris.core.payment.request.strategies.impl;

import com.checkout.hybris.core.address.strategies.CheckoutComPhoneNumberStrategy;
import com.checkout.hybris.core.model.CheckoutComCreditCardPaymentInfoModel;
import com.checkout.hybris.core.payment.enums.CheckoutComPaymentType;
import com.checkout.hybris.core.payment.request.mappers.CheckoutComPaymentRequestStrategyMapper;
import com.checkout.hybris.core.payment.request.strategies.CheckoutComPaymentRequestStrategy;
import com.checkout.hybris.core.populators.payments.CheckoutComCartModelToPaymentL2AndL3Converter;
import com.checkout.sdk.payments.*;
import de.hybris.platform.core.model.order.CartModel;
import de.hybris.platform.core.model.order.payment.PaymentInfoModel;
import de.hybris.platform.core.model.user.AddressModel;

import java.util.Optional;

import static com.checkout.hybris.core.enums.PaymentActionType.AUTHORIZE_AND_CAPTURE;
import static com.checkout.hybris.core.payment.enums.CheckoutComPaymentType.CARD;
import static java.lang.String.format;

/**
 * specific {@link CheckoutComPaymentRequestStrategy} implementation for card payments
 */
public class CheckoutComCardPaymentRequestStrategy extends CheckoutComAbstractPaymentRequestStrategy implements CheckoutComPaymentRequestStrategy {

    public CheckoutComCardPaymentRequestStrategy(final CheckoutComPhoneNumberStrategy checkoutComPhoneNumberStrategy,
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
        return CARD;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    protected Optional<Boolean> isCapture() {
        return Optional.of(checkoutPaymentRequestServicesWrapper.checkoutComMerchantConfigurationService
            .getPaymentAction().equals(AUTHORIZE_AND_CAPTURE));
    }

    /**
     * {@inheritDoc}
     */
    @Override
    protected PaymentRequest<RequestSource> getRequestSourcePaymentRequest(final CartModel cart,
                                                                           final String currencyIsoCode, final Long amount) {
        final PaymentInfoModel paymentInfo = cart.getPaymentInfo();
        if (paymentInfo instanceof CheckoutComCreditCardPaymentInfoModel checkoutComCreditCardPaymentInfo) {

            if (paymentInfo.isSaved() && checkoutComCreditCardPaymentInfo.getSubscriptionId() != null) {
                return createIdSourcePaymentRequest(checkoutComCreditCardPaymentInfo, currencyIsoCode, amount);
            } else {
                return createTokenSourcePaymentRequest(checkoutComCreditCardPaymentInfo, currencyIsoCode, amount, cart.getPaymentAddress());
            }
        } else {
            throw new IllegalArgumentException(format("Strategy called with unsupported paymentInfo type : [%s] while trying to authorize cart: [%s]", paymentInfo.getClass().toString(), cart.getCode()));
        }
    }

    /**
     * Creates Payment request of type IdSource
     *
     * @param paymentInfo     from the cart
     * @param currencyIsoCode currency
     * @param amount          amount
     * @return paymentRequest to send to Checkout.com
     */
    protected PaymentRequest<RequestSource> createIdSourcePaymentRequest(final CheckoutComCreditCardPaymentInfoModel paymentInfo, final String currencyIsoCode, final Long amount) {
        return PaymentRequest.fromSource(new IdSource(paymentInfo.getSubscriptionId()), currencyIsoCode, amount);
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
    protected PaymentRequest<RequestSource> createTokenSourcePaymentRequest(final CheckoutComCreditCardPaymentInfoModel paymentInfo, final String currencyIsoCode, final Long amount, final AddressModel billingAddress) {
        final PaymentRequest<RequestSource> paymentRequest = PaymentRequest.fromSource(new TokenSource(paymentInfo.getCardToken()), currencyIsoCode, amount);
        ((TokenSource) paymentRequest.getSource()).setBillingAddress(billingAddress != null ? createAddress(billingAddress) : null);
        return paymentRequest;
    }

    /**
     * Create the 3dsecure info object for the request.
     *
     * @return ThreeDSRequest the request object
     */
    @Override
    protected Optional<ThreeDSRequest> createThreeDSRequest() {
        final ThreeDSRequest threeDSRequest = new ThreeDSRequest();
        threeDSRequest.setEnabled(checkoutPaymentRequestServicesWrapper
            .checkoutComMerchantConfigurationService.isThreeDSEnabled());
        threeDSRequest.setAttemptN3D(checkoutPaymentRequestServicesWrapper
            .checkoutComMerchantConfigurationService.isAttemptNoThreeDSecure());
        return Optional.of(threeDSRequest);
    }
}
