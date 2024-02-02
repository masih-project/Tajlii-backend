import { Injectable } from '@nestjs/common';
import { RegisterCustomerDto } from 'src/modules/Auth/dto/registerCustomer.dto';
import { RegisterMarketerDto } from 'src/modules/Auth/dto/registerMarketer.dto';
import { SendOtpByEmail } from 'src/modules/Auth/dto/sendOtpByEmail.dto';
import { SendOtpDto } from 'src/modules/Auth/dto/sendOtpByPhoneNumber.dto';
import { VerifyOtpByEmail } from 'src/modules/Auth/dto/verifyOtpByEmail.dto';

@Injectable()
export class LoggerUtils {
  registerMarketer(body: RegisterMarketerDto) {
    const template = `
        <div>
            کاربر
            <b>
            ${body.username}
            </b>
            با نقش مشتری با موفقیت ثبت نام کرد
        </div>
        `;
    return template;
  }
  registerCustomer(body: RegisterCustomerDto) {
    const template = `
        <div>
            کاربر
            <b>
            ${body.username}
            </b>
            با نقش بازاریاب با موفقیت ثبت نام کرد
        </div>
        `;
    return template;
  }
  sendOtpByPhoneNumber(body: SendOtpDto) {
    const template = `<div>
        یک کد یکبار مصرف برای 
        شماره
        <b>
        ${body.mobile}
        </b>
        ارسال شد
        </div>`;
    return template.trim();
  }
  sendOtpByEmail(body: SendOtpByEmail) {
    const template = `<div>
        یک کد یکبار مصرف برای 
        ایمیل
        <b>
        ${body.email}
        </b>
        ارسال شد
        </div>`;
    return template.trim();
  }
  verfiyOtpByPhoneNumber(body: any, flag: boolean) {
    let template = '';
    if (flag) {
      template = `
            <div>
            کاربر
            <b>
            ${body.phone_number}
            </b>
            رمز یکبار مصرف خود را با موفقیت تایید کرد
            </div>
            `;
    }
    if (flag) {
      template = `
            <div>
            کاربر
            <b>
            ${body.phone_number}
            </b>
            رمز یکبار مصرف خود را اشتباه وارد کرد
            </div>          `;
    }
    return template;
  }
  verifyOtpByEmail(body: VerifyOtpByEmail, flag: boolean) {
    let template = '';
    if (flag) {
      template = `
            <div>
            کاربر
            <b>
            ${body.email}
            </b>
            رمز یکبار مصرف خود را با موفقیت تایید کرد
            </div>
            `;
    }
    if (flag) {
      template = `
            <div>
            کاربر
            <b>
            ${body.email}
            </b>
            رمز یکبار مصرف خود را اشتباه وارد کرد
            </div>          `;
    }
    return template;
  }
}
