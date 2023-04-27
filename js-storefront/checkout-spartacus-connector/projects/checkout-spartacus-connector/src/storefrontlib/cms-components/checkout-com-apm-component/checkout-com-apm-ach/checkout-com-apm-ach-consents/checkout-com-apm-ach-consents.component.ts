import { Component, OnInit } from '@angular/core';
import { ModalService } from '@spartacus/storefront';

@Component({
  selector: 'y-checkout-com-apm-ach-consents',
  templateUrl: './checkout-com-apm-ach-consents.component.html',
})
export class CheckoutComApmAchConsentsComponent  {

  constructor(protected modalService: ModalService) { }

  close() {
    this.modalService.dismissActiveModal();
  }

}
