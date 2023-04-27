import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutComApmAchAccountListModalComponent } from './checkout-com-apm-ach-account-list-modal.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { I18nTestingModule } from '@spartacus/core';
import { By } from '@angular/platform-browser';
import { ModalService } from '@spartacus/storefront';
import { DebugElement } from '@angular/core';

const institutionMeta = {
  name: 'Bank of America',
  institution_id: 'ins_127989'
};

const accountMeta1 = {
  id: '4lgVyA4wVqSZVAjQ7Q1BimzZKzDb7ac3ajKVD',
  name: 'Plaid Checking',
  mask: '0000',
  type: 'depository',
  subtype: 'checking',
  verification_status: null,
  class_type: null
};

const accountMeta2 = {
  id: '5QqJxWGn7zCBrqKv5jAMUk61aKmRDBtpNvwRq',
  name: 'Plaid Savings',
  mask: '1111',
  type: 'depository',
  subtype: 'savings',
  verification_status: null,
  class_type: null
};

const achMetadata = {
  status: null,
  link_session_id: 'session_id',
  institution: institutionMeta,
  accounts: [accountMeta1, accountMeta2],
  account: accountMeta1,
  account_id: accountMeta1.id,
  transfer_status: null,
  public_token: 'public-sandbox-676e2b36-b1cd-49ab-9a27-3933a001393e'
};

describe('CheckoutComApmAchAccountListModalComponent', () => {
  let component: CheckoutComApmAchAccountListModalComponent;
  let fixture: ComponentFixture<CheckoutComApmAchAccountListModalComponent>;
  let modalService: ModalService;
  let formElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
        imports: [
          ReactiveFormsModule,
          I18nTestingModule,
        ],
        declarations: [
          CheckoutComApmAchAccountListModalComponent,
        ],
        providers: [
          FormBuilder,
          ModalService,
        ]
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutComApmAchAccountListModalComponent);
    component = fixture.componentInstance;
    component.achMetadata = achMetadata;
    modalService = TestBed.inject(ModalService);
    spyOn(modalService, 'closeActiveModal').and.callThrough();
    formElement = fixture.debugElement.query(By.css('form'));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should verify archMetaData is not empty', () => {
    expect(component.achMetadata).toBe(achMetadata);
  });

  it('should set default value as account_id', () => {
    expect(component.achAccountListForm.get('account_id').value).toBe(achMetadata.account_id);
  });

  describe('should update  form with selected value', () => {

    beforeEach(() => {
      expect(formElement).toBeTruthy();
      const options = formElement.queryAll(By.css('form .cx-list-group-item'));
      expect(options).toBeTruthy();
      const newValue = achMetadata.accounts[1].id;
      expect(component.achAccountListForm.get('account_id').value).toBe(achMetadata.account_id);
      expect(options.length === achMetadata.accounts.length).toBeTrue();
      options[1].query(By.css(`#input-${newValue}`)).nativeElement.click();
      fixture.detectChanges();
      expect(component.achAccountListForm.get('account_id').value).toBe(newValue);
    });

    it('should submit form using selected id', () => {
      const submitButton = formElement.query(By.css('button.btn-primary'));
      expect(submitButton).toBeTruthy();
      submitButton.nativeElement.click();
      const parameters = {
        ...achMetadata,
        account_id: '5QqJxWGn7zCBrqKv5jAMUk61aKmRDBtpNvwRq',
        account: accountMeta2,
      };
      expect(modalService.closeActiveModal).toHaveBeenCalledWith({
        type: 'submit',
        parameters
      });
    });
  });

  it('should close modal', () => {
    const closeButton = formElement.query(By.css('.close'));
    expect(closeButton).toBeTruthy();
    closeButton.nativeElement.click();
    expect(modalService.closeActiveModal).toHaveBeenCalledWith({ type: 'close' });
  });
});
