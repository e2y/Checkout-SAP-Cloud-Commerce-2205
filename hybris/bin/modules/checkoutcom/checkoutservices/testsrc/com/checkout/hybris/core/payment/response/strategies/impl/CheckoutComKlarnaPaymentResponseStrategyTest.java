package com.checkout.hybris.core.payment.response.strategies.impl;

import com.checkout.hybris.core.authorisation.AuthorizeResponse;
import com.checkout.hybris.core.model.CheckoutComKlarnaAPMPaymentInfoModel;
import com.checkout.hybris.core.payment.services.CheckoutComPaymentInfoService;
import com.checkout.sdk.payments.PaymentPending;
import de.hybris.bootstrap.annotations.UnitTest;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;

import static com.checkout.hybris.core.payment.enums.CheckoutComPaymentType.KLARNA;
import static org.junit.Assert.*;
import static org.mockito.Mockito.*;

@UnitTest
@RunWith(MockitoJUnitRunner.class)
public class CheckoutComKlarnaPaymentResponseStrategyTest {

    private static final String PAYMENT_ID = "paymentId";

    @InjectMocks
    private CheckoutComKlarnaPaymentResponseStrategy testObj;

    @Mock
    private PaymentPending pendingResponseMock;
    @Mock
    private CheckoutComKlarnaAPMPaymentInfoModel klarnaPaymentInfoMock;
    @Mock
    private CheckoutComPaymentInfoService paymentInfoServiceMock;

    @Before
    public void setUp() {
        when(pendingResponseMock.getId()).thenReturn(PAYMENT_ID);
        doNothing().when(paymentInfoServiceMock).addPaymentId(PAYMENT_ID, klarnaPaymentInfoMock);
    }

    @Test
    public void getStrategyKey_ShouldReturnAchPaymentType() {
        assertEquals(KLARNA, testObj.getStrategyKey());
    }

    @Test
    public void handlePendingPaymentResponse_WhenKlarna_ShouldReturnAuthorizeResponseSuccess() {
        final AuthorizeResponse result = testObj.handlePendingPaymentResponse(pendingResponseMock, klarnaPaymentInfoMock);

        verify(paymentInfoServiceMock).addPaymentId(PAYMENT_ID, klarnaPaymentInfoMock);
        assertFalse(result.getIsRedirect());
        assertTrue(result.getIsDataRequired());
        assertTrue(result.getIsSuccess());
        assertNull(result.getRedirectUrl());
    }

}
