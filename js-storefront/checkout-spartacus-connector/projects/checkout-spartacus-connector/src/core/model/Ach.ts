import { HttpErrorModel, Order } from '@spartacus/core';
import { HttpErrorResponse } from '@angular/common/http';

export interface AchLinkToken {
  SERIALIZED_NAME_LINK_TOKEN?: string;
  SERIALIZED_NAME_EXPIRATION?: string;
  SERIALIZED_NAME_REQUEST_ID?: string;
  expiration?: string;
  linkToken?: string;
  requestId?: string;
  httpError?: HttpErrorResponse;
  success?: boolean;
}

export interface AchSuccessPopup {
  public_token?: string;
  metadata?: AchSuccessMetadata;
}

export interface AchSuccessMetadata {
  status?: string;
  link_session_id?: string;
  institution?: institutionMeta;
  accounts?: accountMeta[];
  account?: accountMeta;
  account_id?: string;
  transfer_status?: string;
  public_token?: string;
}

interface institutionMeta {
  name?: string;
  institution_id?: string;
}

export interface accountMeta {
  id?: string;
  name?: string;
  mask?: string;
  type?: string;
  subtype?: string;
  verification_status?: string;
  class_type?: string;
}

export interface AchSuccessOrder {
  order?: Order,
  error?: HttpErrorModel
};

