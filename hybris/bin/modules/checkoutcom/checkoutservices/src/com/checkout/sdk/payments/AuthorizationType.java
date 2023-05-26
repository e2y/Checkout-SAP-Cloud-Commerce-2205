package com.checkout.sdk.payments;

import com.google.gson.annotations.SerializedName;

public enum AuthorizationType {
    @SerializedName("Final")
    FINAL,
    @SerializedName("Estimated")
    ESTIMATED
}