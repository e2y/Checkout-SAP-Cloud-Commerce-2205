package com.checkout.sdk.payments;

import com.checkout.sdk.common.Resource;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class CaptureResponse extends Resource {
    private String actionId;
    private String reference;
}