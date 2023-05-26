package com.checkout.sdk.events;

import com.checkout.sdk.common.Resource;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.time.Instant;

@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class AttemptSummaryResponse extends Resource {
    private int statusCode;
    private String responseBody;
    private String sendMode;
    private Instant timestamp;
}