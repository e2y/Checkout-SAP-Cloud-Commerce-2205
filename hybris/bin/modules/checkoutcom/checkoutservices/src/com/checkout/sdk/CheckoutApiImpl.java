package com.checkout.sdk;

import com.checkout.sdk.events.EventsClient;
import com.checkout.sdk.events.EventsClientImpl;
import com.checkout.sdk.instruments.InstrumentsClient;
import com.checkout.sdk.instruments.InstrumentsClientImpl;
import com.checkout.sdk.payments.PaymentsClient;
import com.checkout.sdk.payments.PaymentsClientImpl;
import com.checkout.sdk.sources.SourcesClient;
import com.checkout.sdk.sources.SourcesClientImpl;
import com.checkout.sdk.tokens.TokensClient;
import com.checkout.sdk.tokens.TokensClientImpl;
import com.checkout.sdk.webhooks.WebhooksClient;
import com.checkout.sdk.webhooks.WebhooksClientImpl;

public class CheckoutApiImpl implements CheckoutApi {

    private PaymentsClient paymentsClient;
    private SourcesClient sourcesClient;
    private TokensClient tokensClient;
    private WebhooksClient webhooksClient;
    private EventsClient eventsClient;
    private InstrumentsClient instrumentsClient;

    public CheckoutApiImpl(ApiClient apiClient, CheckoutConfiguration configuration) {
        paymentsClient = new PaymentsClientImpl(apiClient, configuration);
        sourcesClient = new SourcesClientImpl(apiClient, configuration);
        tokensClient = new TokensClientImpl(apiClient, configuration);
        webhooksClient = new WebhooksClientImpl(apiClient, configuration);
        eventsClient = new EventsClientImpl(apiClient, configuration);
        instrumentsClient = new InstrumentsClientImpl(apiClient, configuration);
    }

    public static CheckoutApi create(String secretKey, boolean useSandbox, String publicKey) {
        CheckoutConfiguration configuration = new CheckoutConfiguration(secretKey, useSandbox);
        configuration.setPublicKey(publicKey);

        ApiClient apiClient = new ApiClientImpl(configuration);
        return new CheckoutApiImpl(apiClient, configuration);
    }

    public static CheckoutApi create(String secretKey, String uri, String publicKey) {
        CheckoutConfiguration configuration = new CheckoutConfiguration(secretKey, uri);
        configuration.setPublicKey(publicKey);

        ApiClient apiClient = new ApiClientImpl(configuration);
        return new CheckoutApiImpl(apiClient, configuration);
    }

    @Override
    public PaymentsClient paymentsClient() {
        return paymentsClient;
    }

    @Override
    public SourcesClient sourcesClient() {
        return sourcesClient;
    }

    @Override
    public TokensClient tokensClient() {
        return tokensClient;
    }

    @Override
    public WebhooksClient webhooksClient() {
        return webhooksClient;
    }

    @Override
    public EventsClient eventsClient() {
        return eventsClient;
    }

    @Override
    public InstrumentsClient instrumentsClient() {
        return instrumentsClient;
    }
}