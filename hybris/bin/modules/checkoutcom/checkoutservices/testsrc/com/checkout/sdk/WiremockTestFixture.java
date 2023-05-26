package com.checkout.sdk;

import com.checkout.sdk.ApiClientImpl;
import com.checkout.sdk.CheckoutApi;
import com.checkout.sdk.CheckoutApiImpl;
import com.checkout.sdk.CheckoutConfiguration;
import com.github.tomakehurst.wiremock.junit.WireMockRule;
import org.junit.Before;
import org.junit.Rule;

import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.wireMockConfig;

public class WiremockTestFixture {

    @Rule
    public WireMockRule wireMockRule = new WireMockRule(wireMockConfig().dynamicPort());

    public CheckoutConfiguration configuration;
    public CheckoutApi api;

    @Before
    public void before() {
        configuration = loadConfiguration();
        api = new CheckoutApiImpl(new ApiClientImpl(configuration), configuration);
    }

    private CheckoutConfiguration loadConfiguration() {
        CheckoutConfiguration configuration = new CheckoutConfiguration("test_secret_key", "http://localhost:" + wireMockRule.port() + "/");
        configuration.setPublicKey("test_public_key");

        return configuration;
    }
}
