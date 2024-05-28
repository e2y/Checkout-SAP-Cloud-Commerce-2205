import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

import { NgxPlaidLinkService, PlaidConfig, PlaidLinkHandler } from 'ngx-plaid-link';

import { CheckoutComAchService } from '../../../../core/services/ach/checkout-com-ach.service';
import { AchSuccessMetadata, AchSuccessPopup } from '../../../../core/model/Ach';
import { Address, AddressValidation, GlobalMessageService, GlobalMessageType, RoutingService, UserAddressService } from '@spartacus/core';
import { CheckoutDeliveryFacade, CheckoutFacade } from '@spartacus/checkout/root';
import { filter, take, takeUntil, tap } from 'rxjs/operators';
import { CheckoutComPaymentService } from '../../../../core/services/checkout-com-payment.service';
import { FormControl, FormGroup } from '@angular/forms';
import { ModalRef, ModalService } from '@spartacus/storefront';
import { CheckoutComApmAchConsentsComponent } from './checkout-com-apm-ach-consents/checkout-com-apm-ach-consents.component';
import { CheckoutComApmAchAccountListModalComponent } from './checkout-com-apm-ach-account-list-modal/checkout-com-apm-ach-account-list-modal.component';
import { createPaymentFailAction } from '../../../../core/store/checkout-com.effects';

@Component({
  selector: 'lib-checkout-com-apm-ach',
  templateUrl: './checkout-com-apm-ach.component.html',
  styleUrls: ['./checkout-com-apm-ach.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutComApmAchComponent implements OnInit, OnDestroy {

  protected drop = new Subject();

  achEnabled = new BehaviorSubject<boolean>(true);
  @Input() billingAddressForm: FormGroup;
  sameAsShippingAddress$ = new BehaviorSubject<boolean>(true);
  linkToken = new BehaviorSubject<string>('');
  plaidSuccessPopup$ = new BehaviorSubject<AchSuccessPopup>({});
  paymentAddress: Address;
  disabled = true;
  modalRef: ModalRef;
  showLoadingIcon = false;
  sameAddress: boolean;
  customerConsents = new FormControl();
  achMetadata: AchSuccessMetadata;

  private plaidLinkHandler: PlaidLinkHandler;

  private config: PlaidConfig = {
    apiVersion: 'v2',
    env: 'sandbox',
    selectAccount: false,
    token: null,
    webhook: '',
    product: ['auth'],
    countryCodes: ['US'],
    key: '',
    onSuccess: this.onSuccess,
    onExit: () => '',
  };

  constructor(
    protected plaidLinkService: NgxPlaidLinkService,
    protected checkoutComAchService: CheckoutComAchService,
    protected checkoutFacade: CheckoutFacade,
    protected checkoutPaymentService: CheckoutComPaymentService,
    protected checkoutDeliveryFacade: CheckoutDeliveryFacade,
    protected userAddressService: UserAddressService,
    protected globalMessageService: GlobalMessageService,
    protected modalService: ModalService,
    protected routingService: RoutingService,
    protected cd?: ChangeDetectorRef
  ) {
  }

  ngOnDestroy(): void {
    this.drop.next();
  }

  ngOnInit(): void {
    this.checkoutComAchService.requestPlaidLinkToken().pipe(
      filter((response) => !!response && Object.keys(response).length > 0),
      takeUntil(this.drop)
    ).subscribe((linkToken) => {
      this.linkToken.next(linkToken || '');
      this.config.token = this.linkToken.getValue();
    }, () => this.showErrors('plaidLinkTokenApi'));
    this.sameShippingAddress();
    this.checkoutComAchService.getPlaidLinkMetadata().pipe(
      filter(response => !!response),
      takeUntil(this.drop)
    ).subscribe(metaData => {
      this.achMetadata = metaData;
    }, error => console.log(error));
  }

  sameShippingAddress(): void {
    this.sameAsShippingAddress$.pipe(
      takeUntil(this.drop)).subscribe(res => {
      this.sameAddress = res;
      if (res) {
        this.getDeliveryAddress();
      }
    }, error => console.log(error));
  }

  getDeliveryAddress(): void {
    this.checkoutDeliveryFacade.getDeliveryAddress().pipe(
      take(1),
      tap((address) => {
          this.paymentAddress = address;
        }
      ),
      takeUntil(this.drop)
    ).subscribe();
  }

  handleAddressVerificationResults(results: AddressValidation) {
    if (results.decision === 'ACCEPT') {
      this.paymentAddress = this.billingAddressForm.value;
      this.checkoutPaymentService.updatePaymentAddress(this.paymentAddress).pipe(
        filter((response) => !!response && Object.keys(response).length > 0),
        takeUntil(this.drop)
      ).subscribe(() => {
        this.open();
      }, (error: any) => console.log(error));
    } else if (results.decision === 'REJECT') {
      this.globalMessageService.add(
        { key: 'addressForm.invalidAddress' },
        GlobalMessageType.MSG_TYPE_ERROR
      );
    }
  }

  handleShowACHPopup(): void {
    if (this.achMetadata) {
      this.showAchPlaidLinkAccounts();
      return;
    }

    this.showACHPopUpPayment();
  }

  showErrors(info?: string): void {
    this.achEnabled.next(false);
    this.globalMessageService.add(
      info,
      GlobalMessageType.MSG_TYPE_ERROR
    );
  }

  showACHPopUpPayment(): void {
    this.plaidLinkService
      .createPlaid(
        Object.assign({}, this.config, {
          onSuccess: (token: string, metadata: AchSuccessMetadata) => {
            this.cd.detectChanges();
            this.onSuccess(token, metadata);
          },
          onExit: () => this.exit(),
          onEvent: () => ''
        })
      )
      .then((handler: PlaidLinkHandler) => {
        this.plaidLinkHandler = handler;
        if (!this.sameAddress) {
          this.userAddressService
            .verifyAddress(this.billingAddressForm.value)
            .pipe(
              takeUntil(this.drop))
            .subscribe((result) => {
              this.handleAddressVerificationResults(result);
            }, error => console.log(error));
        } else {
          this.checkoutPaymentService.updatePaymentAddress(this.paymentAddress).pipe(
            filter((response) => !!response && Object.keys(response).length > 0),
            takeUntil(this.drop)
          ).subscribe(() => {
            this.open();
          }, error => console.log(error));
        }
      });
  }

  showPopUpConsents(): void {
    this.modalRef = this.modalService.open(CheckoutComApmAchConsentsComponent, {
      centered: true,
      size: 'lg',
    });
  }

  showAchPlaidLinkAccounts(): void {
    this.modalRef = this.modalService.open(CheckoutComApmAchAccountListModalComponent, {
      centered: true,
      size: 'md',
    });
    this.modalRef.componentInstance.achMetadata = this.achMetadata;

    this.modalRef.closed.pipe(
      filter(response => !!response),
      takeUntil(this.drop)
    ).subscribe(reason => {
      if (reason.type === 'submit' && reason.parameters) {
        this.placeOrder(reason.parameters);
      }
    }, error => console.log(error));
  }

  continueButtonDisabled(target: any): void {
    this.disabled = !(target as HTMLInputElement).checked;
  }

  open(): void {
    this.plaidLinkHandler.open();
  }

  exit(): void {
    this.plaidLinkHandler.exit();
  }

  onSuccess(public_token: string, metadata: AchSuccessMetadata): void {
    this.plaidSuccessPopup$.next({
      public_token,
      metadata
    } as AchSuccessPopup);
    this.checkoutComAchService.setPlaidLinkMetadata(metadata);
    this.showAchPlaidLinkAccounts();
  }

  placeOrder(metadata: AchSuccessMetadata): void {
    this.showLoadingIcon = true;
    this.cd.detectChanges();
    this.checkoutComAchService.requestPlaidSuccessOrder(metadata.public_token, metadata, !this.disabled)
      .pipe(filter(AchOrderId => AchOrderId && Object.keys(AchOrderId).length !== 0),
        takeUntil(this.drop)).subscribe((res) => {
      this.routingService.go({ cxRoute: 'orderConfirmation' });
    }, error => {
      console.log(error);
      this.showLoadingIcon = false;
    });
  }
}
