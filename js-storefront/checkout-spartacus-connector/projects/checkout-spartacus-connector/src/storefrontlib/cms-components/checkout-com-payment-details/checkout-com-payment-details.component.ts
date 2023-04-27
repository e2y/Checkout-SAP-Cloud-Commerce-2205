import { Component, OnDestroy, OnInit } from '@angular/core';
import { Card, PaymentMethodsComponent } from '@spartacus/storefront';
import { PaymentDetails, TranslationService, UserIdService, UserPaymentService } from '@spartacus/core';
import { combineLatest, Observable, Subject } from 'rxjs';
import { first, map, switchMap, takeUntil } from 'rxjs/operators';
import { CheckoutComPaymentService } from '../../../core/services/checkout-com-payment.service';
import { CheckoutComPaymentDetails } from '../../interfaces';

@Component({
  selector: 'y-checkout-com-payment-methods',
  templateUrl: './checkout-com-payment-details.component.html'
})
export class CheckoutComPaymentDetailsComponent extends PaymentMethodsComponent implements OnInit, OnDestroy {

  showEditAddressForm = false;
  selectedPaymentMethod: CheckoutComPaymentDetails;
  private drop = new Subject<void>();

  constructor(
    private customUserPaymentService: UserPaymentService,
    private translationService: TranslationService,
    protected checkoutComPaymentService: CheckoutComPaymentService,
    protected userIdService: UserIdService,
  ) {
    super(customUserPaymentService, translationService);
  }

  getCardContent({
    defaultPayment,
    accountHolderName,
    expiryMonth,
    expiryYear,
    cardNumber,
    cardType,
  }: PaymentDetails): Observable<Card> {
    return combineLatest([
      this.translationService.translate('paymentCard.setAsDefault'),
      this.translationService.translate('common.delete'),
      this.translationService.translate('common.edit'),
      this.translationService.translate('paymentCard.deleteConfirmation'),
      this.translationService.translate('paymentCard.expires', {
        month: expiryMonth,
        year: expiryYear,
      }),
      this.translationService.translate('paymentCard.defaultPaymentMethod'),
      this.getIsABCParam(),
    ]).pipe(
      map(
        ([
          textSetAsDefault,
          textDelete,
          textEdit,
          textDeleteConfirmation,
          textExpires,
          textDefaultPaymentMethod,
          isABC
        ]) => {
          const actions: { name: string; event: string }[] = [];
          if (!defaultPayment) {
            actions.push({
              name: textSetAsDefault,
              event: 'default'
            });
          }
          if (isABC === false) {
            actions.push({
              name: textEdit,
              event: 'edit'
            });
          }
          actions.push({
            name: textDelete,
            event: 'delete'
          });
          const card: Card = {
            header: defaultPayment ? textDefaultPaymentMethod : undefined,
            textBold: accountHolderName,
            text: [cardNumber ?? '', textExpires],
            actions,
            deleteMsg: textDeleteConfirmation,
            img: this.getCardIcon(cardType?.code ?? ''),
          };

          return card;
        }
      )
    );
  }

  editPaymentMethodButtonHandle(paymentMethod: CheckoutComPaymentDetails): void {
    this.showEditAddressForm = true;
    this.selectedPaymentMethod = paymentMethod;
  }

  hidePaymentForm(): void {
    this.showEditAddressForm = false;
  }

  setPaymentDetails(paymentDetails: CheckoutComPaymentDetails): void {
    if (paymentDetails) {
      this.checkoutComPaymentService.updatePaymentDetails(paymentDetails)
        .pipe(takeUntil(this.drop))
        .subscribe(() =>
            this.hidePaymentForm(),
          err => console.error('updatePaymentDetails with errors', { err })
        );
    }
  }

  setEditPaymentMethod(paymentDetails: PaymentDetails): void {
    if (this.editCard !== paymentDetails.id) {
      this.editCard = paymentDetails.id;
    } else {
      this.deletePaymentMethod(paymentDetails);
    }
  }

  private getIsABCParam(): Observable<any> {
    return this.userIdService.getUserId().pipe(
      first(id => !!id),
      switchMap((userId) => {
        this.checkoutComPaymentService.getIsABC(userId);
        return this.checkoutComPaymentService.getIsABCFromState();
      }),
    );
  }

  ngOnDestroy() {
    this.drop.next();
    this.drop.complete();
  }
}
