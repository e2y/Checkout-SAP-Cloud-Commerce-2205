package com.checkout.sdk.payments;

import com.checkout.sdk.common.Phone;
import com.google.gson.annotations.SerializedName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerRequest {

    private String id;

    private String email;

    private String name;

    private Phone phone;

    @SerializedName("tax_number")
    private String taxNumber;
}