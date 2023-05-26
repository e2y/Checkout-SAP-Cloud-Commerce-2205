package com.checkout.sdk.events;

import com.checkout.sdk.common.Resource;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class EventNotificationSummaryResponse extends Resource {
    private String id;
    private String url;
    private Boolean success;
}