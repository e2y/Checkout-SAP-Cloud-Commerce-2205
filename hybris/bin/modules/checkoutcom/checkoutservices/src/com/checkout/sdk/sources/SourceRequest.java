package com.checkout.sdk.sources;

import com.checkout.sdk.common.Address;
import com.checkout.sdk.common.CheckoutUtils;
import com.checkout.sdk.common.Phone;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SourceRequest {
    private String type;
    private Address billingAddress;
    private String reference;
    private Phone phone;
    private CustomerRequest customer;
    private SourceData sourceData;

    public SourceRequest(String type, Address billingAddress) {
        if (CheckoutUtils.isNullOrWhitespace(type)) {
            throw new IllegalArgumentException("The payment source type is required.");
        }
        if (billingAddress == null) {
            throw new IllegalArgumentException("The payment source owner's billing address is required.");
        }

        this.type = type;
        this.billingAddress = billingAddress;
    }
}