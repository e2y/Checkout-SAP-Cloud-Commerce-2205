package com.checkout.hybris.core.populators.payments;

import com.checkout.sdk.payments.PaymentRequest;
import com.checkout.sdk.payments.RequestSource;
import de.hybris.platform.core.model.order.CartModel;
import de.hybris.platform.servicelayer.dto.converter.ConversionException;

public interface CheckoutComCartModelToPaymentL2AndL3Converter {

	void convert(CartModel cartModel, PaymentRequest<RequestSource> requestSourcePaymentRequest) throws ConversionException;
}
