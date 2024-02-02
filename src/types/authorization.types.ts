import { Request } from 'express';
import { RoleUser } from './role.types';

export class BankInfo {
  bank_name: string;
  card_number: string;
  account_number: string;
  shaba_number: string;
}
export type Document = {
  img_national_code: string;
  img_birth_certificate_code: string;
};
export type UserAuth = {
  first_name: string;
  last_name: string;
  gender: 'MALE' | 'FEMALE';
  national_code: string;
  address: string;
  phone_number: string;
  mobile: string;
  identification_code: string;
  username: string;
  postal_code: string;
  is_iranian: boolean;
  brith_day: string;
  city_id: string;
  father_name: string;
  code_upper_head: string;
  birth_certificate_code: string;
  role: RoleUser[];
  _id: string;
  img_url: string;
  marketer_code: string;
  bank_info?: BankInfo | null;
  documents?: Document | null;
  province?: any;
};
type AuthUserPayLoad = {
  user?: UserAuth;
};
export type RequestUserWithAuth = Request & AuthUserPayLoad;
export type JwtPayload = {
  _id: string;
};
export type AdminAuth = {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  status: 0 | 1;
  username: string;
  _id: string;
  img_url: string;
};
type AdminAuthPayload = {
  admin: AdminAuth;
};
export type RequestAdminWithAuth = Request & AdminAuthPayload;
