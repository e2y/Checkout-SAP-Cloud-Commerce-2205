import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutComFramesFormComponent } from './checkout-com-frames-form.component';
import { StoreModule } from '@ngrx/store';
import { I18nModule, I18nTestingModule, TranslationService } from '@spartacus/core';
import { CheckoutComFramesInputModule } from '../checkout-com-frames-input/checkout-com-frames-input.module';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, of } from 'rxjs';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormErrorsModule } from '@spartacus/storefront';
import { CSS_CLASS_CARD_NUMBER, CSS_CLASS_EXPIRY_DATE, CSS_CLASS_CVV } from '../checkout-com-frames-input/interfaces';
import { CheckoutComPaymentService } from '../../../core/services/checkout-com-payment.service';
import { Component, Input } from '@angular/core';
import { FrameElementIdentifier } from './interfaces';

@Component({
  selector: 'lib-checkout-com-frames-input',
  template: ''
})
class MockCheckoutComFramesInputComponent {
  @Input() fieldType: FrameElementIdentifier;
  @Input() form: FormGroup;
  @Input() fieldName: string;
  @Input() icon: string;
  @Input() showTooltip: boolean;
  @Input() tooltipLabel: string;
  @Input() tooltipText: string;
}
class MockCheckoutComPaymentService {
  requestOccMerchantKey() {

  }

  getOccMerchantKeyFromState() {
    return of('pk_test_d4727781-a79c-460e-9773-05d762c63e8f');
  }
}

class MockTranslationService {
  translate(key: string) {
    return of(key);
  }
}

describe('CheckoutComFramesFormComponent', () => {
  let component: CheckoutComFramesFormComponent;
  let fixture: ComponentFixture<CheckoutComFramesFormComponent>;
  const scriptTag = document.createElement('script');
  scriptTag.setAttribute('src', 'https://cdn.checkout.com/js/framesv2.min.js');

  beforeAll((done) => {
    document.getElementsByTagName('head')[0].appendChild(scriptTag);
    scriptTag.onload = done;
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CheckoutComFramesFormComponent],
      imports: [StoreModule.forRoot({}),
        ReactiveFormsModule,
        CheckoutComFramesInputModule,
        NgSelectModule,
        I18nTestingModule,
        FormErrorsModule,
      ],
      providers: [
        {
          provide: TranslationService,
          useClass: MockTranslationService,
        },
        {
          provide: CheckoutComPaymentService,
          useClass: MockCheckoutComPaymentService
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutComFramesFormComponent);
    component = fixture.componentInstance;
    component.submitEvent = new Subject<void>();
    fixture.detectChanges();
  });

  it('should have frames embedded', () => {
    expect(component).toBeTruthy();
    expect(window['Frames']).toBeTruthy();
  });

  it('should have frames inputs', () => {
    expect(fixture.nativeElement.getElementsByClassName(CSS_CLASS_CARD_NUMBER).length).toBeGreaterThanOrEqual(1);
    expect(fixture.nativeElement.getElementsByClassName(CSS_CLASS_EXPIRY_DATE).length).toBeGreaterThanOrEqual(1);
    expect(fixture.nativeElement.getElementsByClassName(CSS_CLASS_CVV).length).toBeGreaterThanOrEqual(1);
  });
});
