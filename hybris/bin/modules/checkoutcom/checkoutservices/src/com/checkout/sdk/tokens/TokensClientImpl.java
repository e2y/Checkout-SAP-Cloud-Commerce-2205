package com.checkout.sdk.tokens;

import com.checkout.sdk.ApiClient;
import com.checkout.sdk.ApiCredentials;
import com.checkout.sdk.CheckoutConfiguration;
import com.checkout.sdk.PublicKeyCredentials;

import java.util.concurrent.CompletableFuture;

public class TokensClientImpl implements TokensClient {
    private final ApiClient apiClient;
    private final ApiCredentials credentials;

    public TokensClientImpl(ApiClient apiClient, CheckoutConfiguration configuration) {
        if (apiClient == null) {
            throw new IllegalArgumentException("apiClient must not be null");
        }
        if (configuration == null) {
            throw new IllegalArgumentException("configuration must not be null");
        }

        this.apiClient = apiClient;
        this.credentials = new PublicKeyCredentials(configuration);
    }

    @Override
    public CompletableFuture<CardTokenResponse> requestAsync(CardTokenRequest cardTokenRequest) {
        if (cardTokenRequest == null) {
            throw new IllegalArgumentException("cardTokenRequest must not be null");
        }
        return apiClient.postAsync("tokens", credentials, CardTokenResponse.class, cardTokenRequest, null);
    }

    @Override
    public CompletableFuture<TokenResponse> requestAsync(WalletTokenRequest walletTokenRequest) {
        if (walletTokenRequest == null) {
            throw new IllegalArgumentException("walletTokenRequest must not be null");
        }

        return apiClient.postAsync("tokens", credentials, TokenResponse.class, walletTokenRequest, null);
    }
}
