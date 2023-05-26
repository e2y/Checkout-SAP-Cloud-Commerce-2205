package com.checkout.sdk.payments;

import lombok.Data;

@Data
public class PaymentActionSummary {
    private String id;
    private String type;
    private String responseCode;
    private String responseSummary;
}