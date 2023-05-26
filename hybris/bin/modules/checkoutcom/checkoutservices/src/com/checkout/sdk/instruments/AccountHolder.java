package com.checkout.sdk.instruments;

import com.checkout.sdk.common.Address;
import com.checkout.sdk.common.Phone;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountHolder {
    private Address billingAddress;
    private Phone phone;
}
