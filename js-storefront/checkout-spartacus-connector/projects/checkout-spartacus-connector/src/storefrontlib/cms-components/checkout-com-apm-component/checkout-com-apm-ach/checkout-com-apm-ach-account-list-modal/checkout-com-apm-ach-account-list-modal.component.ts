import { Component, Input, OnInit } from '@angular/core';
import { accountMeta, AchSuccessMetadata } from '../../../../../core/model/Ach';
import { ModalService } from '@spartacus/storefront';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'y-checkout-com-apm-ach-account-list-modal',
  templateUrl: './checkout-com-apm-ach-account-list-modal.component.html',
  styleUrls: ['./checkout-com-apm-ach-account-list-modal.component.scss'],
})
export class CheckoutComApmAchAccountListModalComponent implements OnInit {
  @Input() achMetadata: AchSuccessMetadata;
  achAccountListForm = this.fb.group({
    account_id: ['', Validators.required],
  });
  achAccountList: any = {} as { [key: string]: accountMeta[] };
  Object = Object;
  constructor(
    protected modalService: ModalService,
    protected fb: FormBuilder
  ) {
  }

  ngOnInit(): void {
    this.achMetadata.accounts.map((account: accountMeta) => {
      if (this.achAccountList[account.subtype]) {
        this.achAccountList[account.subtype].push(account);
      } else {
        this.achAccountList[account.subtype] = [account];
      }
    });
    this.achAccountListForm.patchValue({ account_id: this.achMetadata.account_id });
  }

  onSubmit(): void {
    const account_id = this.achAccountListForm.get('account_id').value;
    const selectedAccount = this.achMetadata.accounts.filter(account => account.id === account_id);

    if (selectedAccount.length) {
      const parameters: AchSuccessMetadata = {
        ...this.achMetadata,
        account_id,
        account: selectedAccount[0]
      };
      this.modalService.closeActiveModal({
        type: 'submit',
        parameters
      });
    } else {
      console.log('Account Id Not found');
    }
  }

  close(reason: string) {
    this.modalService.closeActiveModal({ type: reason });
  }
}
