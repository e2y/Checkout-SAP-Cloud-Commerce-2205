import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutComApmAchConsentsComponent } from './checkout-com-apm-ach-consents.component';
import { I18nTestingModule } from '@spartacus/core';

describe('CheckoutComApmAchConsentsComponent', () => {
  let component: CheckoutComApmAchConsentsComponent;
  let fixture: ComponentFixture<CheckoutComApmAchConsentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CheckoutComApmAchConsentsComponent],
      imports: [I18nTestingModule],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutComApmAchConsentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
