package com.checkout.sdk;

import com.checkout.sdk.common.Resource;

import java.util.Map;
import java.util.concurrent.CompletableFuture;

public interface ApiClient {
    <T> CompletableFuture<T> getAsync(String path, ApiCredentials credentials, Class<T> responseType);

    <T> CompletableFuture<T> putAsync(String path, ApiCredentials credentials, Class<T> responseType, Object request);

    CompletableFuture<Void> deleteAsync(String path, ApiCredentials credentials);

    <T> CompletableFuture<T> postAsync(String path, ApiCredentials credentials, Class<T> responseType, Object request, String idempotencyKey);

    <T> CompletableFuture<T> patchAsync(String path, ApiCredentials credentials, Class<T> responseType, Object request, String idempotencyKey);

    CompletableFuture<? extends Resource> postAsync(String path, ApiCredentials credentials, Map<Integer, Class<? extends Resource>> resultTypeMappings, Object request, String idempotencyKey);
}