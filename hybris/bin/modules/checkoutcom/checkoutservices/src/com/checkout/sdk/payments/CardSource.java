package com.checkout.sdk.payments;

import com.checkout.sdk.common.Address;
import com.checkout.sdk.common.CheckoutUtils;
import com.checkout.sdk.common.Phone;
import com.google.gson.annotations.SerializedName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class CardSource implements RequestSource {
    public static final String TYPE_NAME = "card";
    private final String type = TYPE_NAME;
    private String number;

    private String firstName;

    private String lastName;

    @SerializedName("expiry_month")
    private Integer expiryMonth;

    @SerializedName("expiry_year")
    private Integer expiryYear;

    private String name;

    private String cvv;

    private Boolean stored;

    @SerializedName("store_for_future_use")
    private Boolean storeForFutureUse;

    @SerializedName("billing_address")
    private Address billingAddress;

    private Phone phone;



    public CardSource(String number, int expiryMonth, int expiryYear) {
        if (CheckoutUtils.isNullOrWhitespace(number)) {
            throw new IllegalArgumentException("The card number is required.");
        }
        if (expiryMonth < 1 || expiryMonth > 12) {
            throw new IllegalArgumentException("The expiry month must be between 1 and 12");
        }

        this.number = number;
        this.expiryMonth = expiryMonth;
        this.expiryYear = expiryYear;
    }

    @Override
    public String getType() {
        return type;
    }
}