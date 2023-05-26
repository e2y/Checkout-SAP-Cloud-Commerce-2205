package com.checkout.sdk.payments;

import com.checkout.sdk.common.Resource;
import lombok.*;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class PaymentAction extends Resource {
    private String id;
    private String type;
    private Instant processedOn;
    private long amount;
    private String authCode;
    private String responseCode;
    private String responseSummary;
    private String reference;
    private Map<String, Object> metadata = new HashMap<>();
    private boolean approved;
}