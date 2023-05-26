package com.checkout.sdk.sources;

import java.util.concurrent.CompletableFuture;

public interface SourcesClient {
    CompletableFuture<SourceResponse> requestAsync(SourceRequest sourceRequest);
}
