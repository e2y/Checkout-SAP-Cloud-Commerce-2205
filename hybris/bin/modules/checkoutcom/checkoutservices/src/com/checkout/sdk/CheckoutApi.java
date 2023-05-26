package com.checkout.sdk;

import com.checkout.sdk.events.EventsClient;
import com.checkout.sdk.instruments.InstrumentsClient;
import com.checkout.sdk.payments.PaymentsClient;
import com.checkout.sdk.sources.SourcesClient;
import com.checkout.sdk.tokens.TokensClient;
import com.checkout.sdk.webhooks.WebhooksClient;

public interface CheckoutApi {
    PaymentsClient paymentsClient();

    SourcesClient sourcesClient();

    TokensClient tokensClient();

    WebhooksClient webhooksClient();

    EventsClient eventsClient();

    InstrumentsClient instrumentsClient();
}