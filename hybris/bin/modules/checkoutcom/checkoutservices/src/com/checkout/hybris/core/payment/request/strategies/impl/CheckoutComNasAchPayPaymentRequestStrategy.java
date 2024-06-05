package com.checkout.hybris.core.payment.request.strategies.impl;

import com.checkout.hybris.core.address.strategies.CheckoutComPhoneNumberStrategy;
import com.checkout.hybris.core.model.CheckoutComAchPaymentInfoModel;
import com.checkout.hybris.core.payment.enums.CheckoutComPaymentType;
import com.checkout.hybris.core.payment.request.mappers.CheckoutComPaymentRequestStrategyMapper;
import com.checkout.hybris.core.payment.request.strategies.CheckoutComPaymentRequestStrategy;
import com.checkout.hybris.core.populators.payments.CheckoutComCartModelToPaymentL2AndL3Converter;
import com.checkout.sdk.common.AccountHolder;
import com.checkout.sdk.common.AccountHolderType;
import com.checkout.sdk.common.AccountType;
import com.checkout.sdk.common.Address;
import com.checkout.sdk.payments.PaymentRequest;
import com.checkout.sdk.payments.RequestSource;
import com.checkout.sdk.payments.source.BankAccountSource;
import de.hybris.platform.core.model.order.CartModel;
import de.hybris.platform.core.model.user.AddressModel;
import org.apache.commons.lang.StringUtils;

import java.util.Map;
import java.util.Optional;

import static com.checkout.hybris.core.payment.enums.CheckoutComPaymentType.ACH;
import static de.hybris.platform.servicelayer.util.ServicesUtil.validateParameterNotNull;
import static java.lang.String.format;

/**
 * specific {@link CheckoutComPaymentRequestStrategy} implementation for ACH payments
 */
public class CheckoutComNasAchPayPaymentRequestStrategy extends CheckoutComAbstractPaymentRequestStrategy {

    protected Map<String, String> accountTypeMapping = Map.of("CHECKING", "CURRENT",
                                                              "SAVINGS", "SAVINGS");

    public CheckoutComNasAchPayPaymentRequestStrategy(final CheckoutComPhoneNumberStrategy checkoutComPhoneNumberStrategy,
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
        return ACH;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public PaymentRequest<RequestSource> createPaymentRequest(final CartModel cart) {
        validateParameterNotNull(cart, "Cart model cannot be null");

        final String currencyIsoCode = cart.getCurrency().getIsocode();
        final Long amount = checkoutPaymentRequestServicesWrapper
            .checkoutComCurrencyService.convertAmountIntoPennies(currencyIsoCode, cart.getTotalPrice());

        final PaymentRequest<RequestSource> paymentRequest = getRequestSourcePaymentRequest(cart, currencyIsoCode,
                                                                                            amount);
        populatePaymentRequest(cart, paymentRequest);

        return paymentRequest;
    }

    @Override
    protected PaymentRequest<RequestSource> getRequestSourcePaymentRequest(final CartModel cart,
                                                                           final String currencyIsoCode,
                                                                           final Long amount) {
        validateParameterNotNull(cart.getPaymentInfo(), "paymentInfo cannot be null");

        if (cart.getPaymentInfo() instanceof CheckoutComAchPaymentInfoModel) {
            final BankAccountSource bankAccountSource = createBankAccountSource(cart);
            return PaymentRequest.fromSource(bankAccountSource, currencyIsoCode, amount);
        } else {
            throw new IllegalArgumentException(
                format("Strategy called with unsupported paymentInfo type : [%s] while trying to authorize cart: [%s]",
                       cart.getPaymentInfo().getClass().toString(), cart.getCode()));
        }
    }

    /**
     * Creates the source request for the set up payment source request to checkout.com
     *
     * @param cart the cart model
     * @return the populated BankAccountSource
     */
    protected BankAccountSource createBankAccountSource(final CartModel cart) {
        final CheckoutComAchPaymentInfoModel paymentInfo = Optional.ofNullable(cart.getPaymentInfo())
                                                                   .filter(
                                                                       CheckoutComAchPaymentInfoModel.class::isInstance)
                                                                   .map(CheckoutComAchPaymentInfoModel.class::cast)
                                                                   .orElseThrow(IllegalArgumentException::new);


        return new BankAccountSource(ACH.name().toLowerCase(),
                                     AccountType.valueOf(mapAccountType(paymentInfo)),
                                     paymentInfo.getBillingAddress().getCountry().getIsocode(),
                                     paymentInfo.getAccountNumber(),
                                     paymentInfo.getBankCode(),
                                     createAccountHolder(cart));
    }

    private String mapAccountType(final CheckoutComAchPaymentInfoModel paymentInfo) {
        return accountTypeMapping.get(paymentInfo.getAccountType().getCode().toUpperCase());
    }


    private AccountHolder createAccountHolder(final CartModel cart) {
        final AccountHolder accountHolder = new AccountHolder();

        final AddressModel billingAddress = Optional.ofNullable(cart.getPaymentAddress())
                                                    .filter(AddressModel.class::isInstance)
                                                    .map(AddressModel.class::cast)
                                                    .orElseThrow(IllegalArgumentException::new);

        final CheckoutComAchPaymentInfoModel paymentInfo = (CheckoutComAchPaymentInfoModel) cart.getPaymentInfo();
        accountHolder.setFirstName(billingAddress.getFirstname());
        accountHolder.setLastName(billingAddress.getLastname());
        accountHolder.setEmail(billingAddress.getEmail());
        accountHolder.setPhone(checkoutComPhoneNumberStrategy.createPhone(billingAddress).orElse(null));
        accountHolder.setCompanyName(paymentInfo.getCompanyName());
        accountHolder.setType(StringUtils.isNotEmpty(
            paymentInfo.getCompanyName()) ? AccountHolderType.CORPORATE : AccountHolderType.INDIVIDUAL);


        final Address checkoutAddress = createAddress(billingAddress);
        accountHolder.setBillingAddress(checkoutAddress);

        return accountHolder;
    }

}
