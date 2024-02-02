import { RoleUser } from 'src/types/role.types';
export interface Document {
  img_national_code: string;
  img_birth_certificate_code: string;
}
export interface BankInfo {
  bank_name: string;
  card_number: string;
  account_number: string;
  shaba_number: string;
}
export interface User {
  code: string;
  readonly first_name: string;
  readonly last_name: string;
  readonly gender: 'MALE' | 'FEMALE';
  readonly national_code: string;
  readonly address: string;
  readonly phone_number: string;
  readonly mobile: string;
  identification_code: string;
  readonly username: string;
  readonly postal_code: string;
  readonly password: string;
  readonly is_iranian: boolean;
  readonly brith_day: string;
  readonly city_id: string;
  readonly father_name: string;
  code_upper_head: string;
  readonly birth_certificate_code: string;
  readonly role: RoleUser[];
  readonly _id: string;
  readonly img_url: string;
  readonly marketer_code: string;
  readonly status: 0 | 1 | 2 | 3 | 4;
  readonly email: string;
  readonly documents: Document;
  readonly bank_info: any;
}
export interface SkanetUser {
  readonly first_name: string;
  readonly last_name: string;
  readonly gender: 'MALE' | 'FEMALE';
  readonly national_code: string;
  readonly address: string;
  readonly phone_number: string;
  readonly mobile: string;
  readonly identification_code: string;
  readonly username: string;
  readonly postal_code: string;
  readonly password: string;
  readonly is_iranian: boolean;
  readonly brith_day: string;
  readonly city_id: string;
  readonly father_name: string;
  readonly code_upper_head: string;
  readonly birth_certificate_code: string;
  readonly role: RoleUser[];
  readonly _id: string;
  readonly img_url: string;
  readonly marketer_code: string;
  readonly email: string;
  readonly status: 0 | 1 | 2;
}
