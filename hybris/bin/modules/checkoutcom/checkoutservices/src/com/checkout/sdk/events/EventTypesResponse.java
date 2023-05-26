package com.checkout.sdk.events;

import com.checkout.sdk.common.Resource;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class EventTypesResponse extends Resource {
    private String version;
    private List<String> eventTypes;
}