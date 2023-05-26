package com.checkout.sdk.common;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponseInfo {
    private int httpStatusCode;
    private String requestId;
}
