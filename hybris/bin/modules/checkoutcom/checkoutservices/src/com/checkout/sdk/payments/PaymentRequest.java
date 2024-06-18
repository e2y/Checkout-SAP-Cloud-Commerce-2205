package com.checkout.sdk.payments;

import com.checkout.sdk.common.CheckoutUtils;
import com.checkout.sdk.payments.sender.PaymentSender;
import com.google.gson.annotations.SerializedName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NonNull;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
public class PaymentRequest<T extends RequestSource> {
    private T source;
    private T destination;
    private Long amount;
    private String currency;
    private String paymentType;
    private Boolean merchantInitiated;
    private String reference;
    private String description;
    private Boolean capture;
    private CustomerRequest customer;
    private Instant captureOn;
    private BillingDescriptor billingDescriptor;
    private ShippingDetails shipping;
    @SerializedName("3ds")
    private ThreeDSRequest threeDS;
    private String previousPaymentId;
    private RiskRequest risk;
    private String successUrl;
    private String failureUrl;
    private String paymentIp;
    private PaymentRecipient recipient;
    private Processing processing;
    @Builder.Default
    private Map<String, Object> metadata = new HashMap<>();
    private String fundTransferType;
    private String processingChannelId;
    private AuthorizationType authorizationType;
    private MarketplaceData marketplace;
    private String paymentContextId;

    private PaymentSender sender;

    private List<Product> items;

    private PaymentRequest(T sourceOrDestination, String currency, Long amount, boolean isSource) {
        if (sourceOrDestination == null) {
            throw new IllegalArgumentException(String.format("The payment %s is required.", isSource ? "source" : "destination"));
        }
        if (CheckoutUtils.isNullOrWhitespace(currency)) {
            throw new IllegalArgumentException("The currency is required.");
        }
        if (amount != null && amount < 0) {
            throw new IllegalArgumentException("The amount cannot be negative");
        }
        this.source = isSource ? sourceOrDestination : null;
        this.destination = isSource ? null : sourceOrDestination;
        this.amount = amount;
        this.currency = currency;
        this.metadata = new HashMap<>();
    }

    private PaymentRequest(String paymentContextId) {
        this.paymentContextId = paymentContextId;
    }

    public static <T extends RequestSource> PaymentRequest<T> fromSource(T source, String currency, Long amount) {
        return new PaymentRequest<>(source, currency, amount, true);
    }

    public static <T extends RequestSource> PaymentRequest<T> fromDestination(T destination, String currency, Long amount) {
        return new PaymentRequest<>(destination, currency, amount, false);
    }

    public static <T extends RequestSource> PaymentRequest<T> forKlarna(String paymentContextId) {
        return new PaymentRequest<>(paymentContextId);
    }
}
