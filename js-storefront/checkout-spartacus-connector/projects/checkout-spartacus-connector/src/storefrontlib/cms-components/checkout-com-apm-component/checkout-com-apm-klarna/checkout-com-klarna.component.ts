import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { CheckoutComApmService } from '../../../../core/services/checkout-com-apm.service';
import { BehaviorSubject, Subject, throwError } from 'rxjs';
import { distinctUntilChanged, filter, finalize, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { KlarnaInitParams } from '../../../../core/interfaces';
import { ApmPaymentDetails } from '../../../interfaces';
import { Address, GlobalMessageService, GlobalMessageType, WindowRef } from '@spartacus/core';
import { PaymentType } from '../../../../core/model/ApmData';
import { AbstractControl, FormGroup } from '@angular/forms';
import { CheckoutComPaymentService } from '../../../../core/services/checkout-com-payment.service';
import { makeFormErrorsVisible } from '../../../../core/shared/make-form-errors-visible';
import { CheckoutDeliveryFacade } from '@spartacus/checkout/root';

interface KlarnaLoadError {
  invalid_fields?: string[];
}

interface KlarnaLoadResponse {
  show_form: boolean;
  error?: KlarnaLoadError;
}

interface KlarnaAuthResponse {
  authorization_token?: string;
  payment_context?: string;
  show_form: boolean;
  approved?: boolean;
  finalize_required?: boolean;
  error?: KlarnaLoadError;
}

export interface KlarnaAddress {
  given_name?: string;
  family_name?: string;
  email?: string;
  street_address?: string;
  postal_code?: string;
  city?: string;
  phone?: string;
  country?: string;
}

@Component({
  selector: 'lib-checkout-com-apm-klarna',
  templateUrl: './checkout-com-klarna.component.html',
  styleUrls: ['./checkout-com-klarna.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutComKlarnaComponent implements OnInit, OnDestroy {
  @Input() billingAddressForm: FormGroup = new FormGroup({});
  @Output() setPaymentDetails: EventEmitter<{ paymentDetails: ApmPaymentDetails, billingAddress: Address }> = new EventEmitter<{
    paymentDetails: ApmPaymentDetails,
    billingAddress: Address
  }>();
  @ViewChild('widget') widget: ElementRef;
  public loadingWidget$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public authorizing$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public initializing$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public sameAsShippingAddress$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  private sameAsShippingAddress: boolean = true;
  private drop: Subject<void> = new Subject<void>();
  private currentCountryCode: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  private billingAddressHasBeenSet: boolean = false;

  public paymentContext: string = null;
  public instanceId: string = null;
  public emailAddress: string = '';
  public klarnaShippingAddressData: KlarnaAddress;
  public klarnaBillingAddressData: KlarnaAddress;

  constructor(
    protected checkoutComApmSrv: CheckoutComApmService,
    protected msgSrv: GlobalMessageService,
    protected checkoutComPaymentService: CheckoutComPaymentService,
    protected checkoutDeliveryFacade: CheckoutDeliveryFacade,
    private ngZone: NgZone,
    protected windowRef: WindowRef,
  ) {
  }

  ngOnInit(): void {
    this.addScript();
  }

  listenForAddressSourceChange(): void {
    this.sameAsShippingAddress$.pipe(
      switchMap((sameAsShippingAddress: boolean) => {
        this.sameAsShippingAddress = sameAsShippingAddress;
        if (!sameAsShippingAddress) {
          const countryCtrl: AbstractControl = this.billingAddressForm.get('country.isocode');
          if (countryCtrl && countryCtrl.value) {
            this.currentCountryCode.next(countryCtrl.value);
          }
        }
        return this.checkoutDeliveryFacade.getDeliveryAddress().pipe(
          take(1),
          tap((address: Address): void => {
            this.currentCountryCode.next(address?.country?.isocode);
            this.klarnaShippingAddressData = this.normalizeKlarnaAddress(address);

            if (this.sameAsShippingAddress) {
              this.klarnaBillingAddressData = this.klarnaShippingAddressData;
            } else {
              this.klarnaBillingAddressData = this.normalizeKlarnaAddress(this.billingAddressForm.value);
            }
          })
        );
      }),
      takeUntil(this.drop)
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.drop.next();
  }

  normalizeKlarnaAddress(address: Address): KlarnaAddress {
    return {
      given_name: address.firstName || '',
      family_name: address.lastName || '',
      email: this.emailAddress,
      street_address: address.line1 || '',
      postal_code: address.postalCode || '',
      city: address.town || '',
      phone: address.phone || '',
      country: address.country?.isocode || ''
    };
  }

  public authorize(): void {
    if (!this.sameAsShippingAddress && !this.billingAddressForm.valid) {
      makeFormErrorsVisible(this.billingAddressForm);
      return;
    }
    if (this.authorizing$.getValue()) {
      return;
    }

    try {
      const k = (this.windowRef.nativeWindow as { [key: string]: any })['Klarna']?.Payments;
      if (!k) {
        console.error('Klarna is not set');
        return;
      }
      let billingAddress: Address = null;
      if (!this.sameAsShippingAddress) {
        billingAddress = this.billingAddressForm.value;
      }
      this.authorizing$.next(true);
      k.authorize({
          instance_id: this.instanceId
        },
        {
          billing_address: this.klarnaBillingAddressData,
          shipping_address: this.klarnaShippingAddressData
        },
        (response: KlarnaAuthResponse): void => {
          this.authorizing$.next(false);
          if (response != null && response.approved === true && response.authorization_token) {
            this.setPaymentDetails.next({
              paymentDetails: {
                type: PaymentType.Klarna,
                authorizationToken: response.authorization_token,
                paymentContextId: this.paymentContext,
              } as ApmPaymentDetails,
              billingAddress
            });
          }
        });
    } catch (e) {
      this.authorizing$.next(false);
      console.error('CheckoutComKlarnaComponent::initKlarna', e);
    }
  }

  private listenForCountryCode(): void {
    this.currentCountryCode.pipe(
      filter((c: string) => !!c && this.billingAddressHasBeenSet),
      distinctUntilChanged(),
      switchMap(() => {
        this.initializing$.next(true);
        return this.checkoutComApmSrv.getKlarnaInitParams().pipe(
          finalize(() => this.initializing$.next(false))
        );
      }),
      takeUntil(this.drop)
    ).subscribe({
      next: (params: KlarnaInitParams): void => {
        this.initKlarna(params);
      },
      error: (error) => {
        console.error(error);
        this.msgSrv.add({ key: 'paymentForm.klarna.initializationFailed' }, GlobalMessageType.MSG_TYPE_ERROR);
      }
    });
  }

  private listenForCountrySelection(): void {
    this.billingAddressForm.valueChanges.pipe(
      filter(values => values?.country?.isocode), distinctUntilChanged(), takeUntil(this.drop)
    ).subscribe((values): void => {
      this.currentCountryCode.next(values?.country?.isocode);
    }, err => console.error('listenForCountrySelection with errors', { err }));
  }

  private klarnaIsReady(): void {
    this.initializing$.next(true);
    this.checkoutDeliveryFacade.getDeliveryAddress().pipe(
      switchMap((shippingAddress: Address) => {
        if (shippingAddress == null || typeof shippingAddress !== 'object') {
          return throwError('Shipping address is required');
        }
        return this.checkoutComPaymentService.updatePaymentAddress(shippingAddress)
          .pipe(tap((response: Address): void => {
            this.billingAddressHasBeenSet = true;
            this.emailAddress = response.email;
            this.klarnaShippingAddressData = this.normalizeKlarnaAddress(shippingAddress);
          }));
      }),
      take(1),
    ).pipe(
      finalize(
        () => this.initializing$.next(false)
      ),
      takeUntil(this.drop)
    ).subscribe({
      next: (address: Address): void => {
        if (address?.country?.isocode) {
          this.currentCountryCode.next(address.country.isocode);
        } else {
          this.msgSrv.add({ key: 'paymentForm.klarna.countryIsRequired' }, GlobalMessageType.MSG_TYPE_ERROR);
        }
        this.listenForCountryCode();
        this.listenForCountrySelection();
        this.listenForAddressSourceChange();
      },
      error: (): void => {
        this.msgSrv.add({ key: 'paymentForm.klarna.countryIsRequired' }, GlobalMessageType.MSG_TYPE_ERROR);
      }
    });
  }

  private initKlarna(params: KlarnaInitParams): void {
    try {
      const k = (this.windowRef.nativeWindow as { [key: string]: any })['Klarna']?.Payments;
      if (!k) {
        console.error('Klarna is not set');
        return;
      }

      this.paymentContext = params.paymentContext;
      this.instanceId = params.instanceId;

      k.init({
        client_token: params.clientToken,
      });
      this.loadWidget();
    } catch (e) {
      console.error('CheckoutComKlarnaComponent::initKlarna', e);
    }
  }

  private addScript(): void {
    if (this.windowRef && !(this.windowRef?.nativeWindow as { [key: string]: any })['Klarna'] as any) {
      Object.defineProperty(this.windowRef.nativeWindow, 'klarnaAsyncCallback', {
        value: () => {
          this.ngZone.run(() => {
            this.klarnaIsReady();
          });
        },
      });
      const script = this.windowRef.document.createElement('script');
      script.setAttribute('src', 'https://x.klarnacdn.net/kp/lib/v1/api.js');
      script.setAttribute('async', 'true');
      this.windowRef.document.body.appendChild(script);
    } else {
      this.ngZone.run((): void => {
        this.klarnaIsReady();
      });
    }
  }

  private loadWidget(): void {
    try {
      const k: any = (this.windowRef.nativeWindow as { [key: string]: any })['Klarna']?.Payments;
      if (!k) {
        console.error('Klarna is not set');
        return;
      }
      this.loadingWidget$.next(true);

      k.load(
        {
          container: '#klarnaContainer',
          instance_id: this.instanceId
        },
        {},
        (response: KlarnaLoadResponse): void => {
          this.loadingWidget$.next(false);
          if (response != null && typeof response === 'object') {
            if (response.error) {
              console.error('CheckoutComKlarnaComponent::loadWidget::response', response.error);
            }
          }
        });
    } catch (e) {
      this.loadingWidget$.next(false);
      console.error('CheckoutComKlarnaComponent::loadWidget', e);
    }
  }
}
