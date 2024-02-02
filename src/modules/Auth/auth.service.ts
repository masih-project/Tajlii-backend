import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterCustomerDto, RegisterCustomerSendOtpDto, RegisterCustomerVerifyDto } from './dto/registerCustomer.dto';
import { HashUtils } from '../../utils/hast-utils';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JWTUtils } from '../../utils/jwt-utils';
import { RegisterMarketerDto } from './dto/registerMarketer.dto';
import { OtpUtils } from '../../utils/otp-utils';
import { SendOtpDto, VerifyOtpDto } from './dto/sendOtpByPhoneNumber.dto';
import { SendOtpByEmail } from './dto/sendOtpByEmail.dto';
import { EmailUtils } from '../../utils/email-utils';
import { VerifyOtpByEmail } from './dto/verifyOtpByEmail.dto';
import { SmsUtils } from 'src/utils/sm-utils';
import { statusUser } from 'src/types/status.types';
import { LoginUser } from './dto/loginUser.dto';
import { Cart } from '../cart/cart.schema';
import { VerifyAuth } from './dto/verifyAuth.dto';
import { VezaratService } from '../user/services/vezarat.service';
import { User } from '../user/schema/user.schema';
import { randomInt } from 'crypto';
import { RoleUser } from '@$/types/role.types';
import { ObjectId } from 'mongodb';
import { Product } from '../product/schemas/product.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('users') private userModel: Model<User>,
    @InjectModel('carts') private cartModel: Model<Cart>,
    @InjectModel('products') private productModel: Model<Product>,
    private readonly hashUtils: HashUtils,
    private readonly jwtUtils: JWTUtils,
    private readonly otpUtils: OtpUtils,
    private readonly emailUtils: EmailUtils,
    private readonly smsUtils: SmsUtils,
    private readonly vezaratService: VezaratService,
  ) {}

  async registerCustomerSendOtp(dto: RegisterCustomerSendOtpDto) {
    const duplicateMobile = await this.userModel.findOne({ mobile: dto.mobile });
    if (duplicateMobile) throw new ConflictException('duplicate mobile');

    const identifier = await this.userModel.findOne({ code: dto.identification_code });
    if (!identifier) throw new NotFoundException('کدملی معرف در سیستم وجود ندارد');

    const code = randomInt(99999).toString().padStart(5, '0');
    await this.smsUtils.sendVerifyCode(dto.mobile, code);
    const sign = `${dto.mobile}.${code}`;
    const hash = await this.hashUtils.hashString(sign);
    return hash;
  }
  async registerCustomerResendCode(mobile: string) {
    const duplicateMobile = await this.userModel.findOne({ mobile: mobile });
    if (duplicateMobile) throw new ConflictException('duplicate mobile');

    const code = randomInt(99999).toString().padStart(5, '0');
    await this.smsUtils.sendVerifyCode(mobile, code);
    const sign = `${mobile}.${code}`;
    const hash = await this.hashUtils.hashString(sign);
    return hash;
  }
  async registerCustomerVerify(dto: RegisterCustomerVerifyDto, hash: string, session_id: string) {
    const duplicateMobile = await this.userModel.findOne({ mobile: dto.mobile });
    if (duplicateMobile) throw new ConflictException('duplicate mobile');

    const identifier = await this.userModel.findOne({ code: dto.identification_code });
    if (!identifier) throw new NotFoundException('کدملی معرف در سیستم وجود ندارد');

    const { code, ...userDto } = dto;
    const sign = `${dto.mobile}.${code}`;
    const isValid = await this.hashUtils.verifyPassword(sign, hash);
    if (!isValid) throw new BadRequestException('invalid code');

    const user = await this.userModel.create({
      ...userDto,
      status: statusUser.CONFIRMED,
      role: [RoleUser.CUSTOMER],
    });
    const token = await this.jwtUtils.generateToken({ _id: user._id });
    await this.smsUtils.sendWelcomCustomerMessage(dto.mobile, `${dto.first_name} ${dto.last_name}`);

    await this.setCartInLogin(session_id, user._id);

    return { user, token };
  }

  // old
  async registerCustomer(body: RegisterCustomerDto) {
    const { password } = body;
    const hashPassword = await this.hashUtils.hashString(password);
    const hasUsername = await this.userModel.findOne({
      username: body.username.toLocaleLowerCase(),
    });
    const hasIdentification_code = await this.userModel.findOne({
      code: body.identification_code,
    });
    if (!hasIdentification_code) {
      throw new BadRequestException('کدملی معرف در سیستم وجود ندارد');
    }
    const hasPhoneNumber = await this.userModel.findOne({
      mobile: body.mobile,
    });
    const hasNationalCode = await this.userModel.findOne({
      national_code: body.national_code,
    });
    if (hasUsername) {
      throw new BadRequestException('یوزرنیم وارد شده قبلا ثبت شده است');
    }
    if (hasPhoneNumber) {
      throw new BadRequestException('شماره وارد شده قبلا ثبت شده است');
    }
    if (hasNationalCode) {
      throw new BadRequestException(' کدملی شده قبلا ثبت شده است');
    }
    const user = await this.userModel.create({
      ...body,
      username: body.username.toLocaleLowerCase(),
      password: hashPassword,
      status: statusUser.CONFIRMED,
    });
    const token = await this.jwtUtils.generateToken({ _id: user._id });
    await this.smsUtils.sendWelcomCustomerMessage(body.mobile, body.username);
    return token;
  }

  async registerMarketer(body: RegisterMarketerDto) {
    const { password } = body;
    const hashPassword = await this.hashUtils.hashString(password);
    const hasUsername = await this.userModel.findOne({
      username: body.username.toLocaleLowerCase(),
    });
    const hasPhoneNumber = await this.userModel.findOne({
      mobile: body.mobile,
    });
    const hasNationalCode = await this.userModel.findOne({
      national_code: body.national_code,
    });
    const hasIdentification_code = await this.userModel.findOne({
      code: body.identification_code,
    });
    if (!hasIdentification_code) {
      throw new BadRequestException('کدملی معرف در سیستم وجود ندارد');
    }
    const has_code_upper_head = await this.userModel.findOne({
      code: body.code_upper_head,
    });
    if (!has_code_upper_head) {
      throw new BadRequestException('کدملی بالاسری در سیستم وجود ندارد');
    }
    if (hasUsername) {
      throw new BadRequestException('یوزرنیم وارد شده قبلا ثبت شده است');
    }
    if (hasPhoneNumber) {
      throw new BadRequestException('شماره وارد شده قبلا ثبت شده است');
    }
    if (hasNationalCode) {
      throw new BadRequestException(' کدملی شده قبلا ثبت شده است');
    }

    let vezaratCode: string;
    console.log('Before Getting Vezarat Code', process.env);
    if (process.env.NODE_ENV === 'production') {
      console.log('getting...');
      vezaratCode = await this.vezaratService.registerMarketer({
        nationalCode: body.national_code,
        firstName: body.first_name ?? '',
        lastName: body.last_name ?? '',
        birthDate: body.brith_day ?? '',
        address: body.address ?? '',
        education: '',
        email: body.email ?? '',
        fatherName: body.father_name ?? '',
        idNo: '',
        parentNationalCode: '',
        phone1: body.phone_number ?? '',
        phone2: '',
        postalCode: body.postal_code ?? '',
      });
    }

    const code = await this.generateUniqueCode();
    const user = await this.userModel.create({
      ...body,
      username: body.username.toLocaleLowerCase(),
      password: hashPassword,
      role: ['MARKETER'],
      status: statusUser.CONFIRMED,
      marketer_code: vezaratCode,
      code,
    });
    const token = await this.jwtUtils.generateToken({ _id: user._id });
    await this.smsUtils.sendWelcomMarketerMessage(body.mobile, body.username, user.code);
    return { token, user };
  }

  async sendOtp(dto: SendOtpDto) {
    const user = await this.userModel.findOne({ mobile: dto.mobile });
    if (!user) throw new UnauthorizedException('user not found');
    if (user.status !== statusUser.CONFIRMED) throw new ForbiddenException('access denied');

    const code = randomInt(99999).toString().padStart(5, '0');
    await this.smsUtils.sendOtp(`رمز موقت شما : ${code}`, dto.mobile, code);
    const sign = `${dto.mobile}.${code}`;
    const hash = await this.hashUtils.hashString(sign);
    return hash;
  }

  async verifyOtp(dto: VerifyOtpDto, hash: string, session_id: string) {
    const sign = `${dto.mobile}.${dto.code}`;
    const isValid = await this.hashUtils.verifyPassword(sign, hash);
    if (!isValid) throw new UnauthorizedException('invalid code');
    const user = await this.userModel.findOne({
      mobile: dto.mobile,
      status: statusUser.CONFIRMED,
    });
    if (!user) throw new UnauthorizedException('invalid user');
    const token = await this.jwtUtils.generateToken({ _id: user._id });

    await this.setCartInLogin(session_id, user._id);

    return { token, user };
  }

  async verfiyOtpByPhoneNumber(body: any, otp_sms_sign: string) {
    const [hashPhoneNumber, expired, hashOtp] = otp_sms_sign.split('_');
    const verifyOtp = await this.hashUtils.verifyPassword(body.verification.otp, hashOtp);
    const verifyPhoneNumber = await this.hashUtils.verifyPassword(body.phone_number, hashPhoneNumber);
    const hasExpired = Number(expired) < Date.now();
    if (hasExpired || !verifyOtp || !verifyPhoneNumber) {
      throw new BadRequestException('کد یکبارمصرف وارد شده صحیح نمیباشد');
    }
  }

  async sendOtpByEmail(body: SendOtpByEmail) {
    const otp = await this.otpUtils.generateOtp();
    const hashOtp = await this.hashUtils.hashString(otp);
    const hashEmail = await this.hashUtils.hashString(body.email);
    const emailSenderInfo = {
      to: body.email,
      subject: 'اسکانت',
      html: `
                    <div dir="rtl">
                کاربر گرامی
                <br/>
                کد یکبار مصرف شما در اسکانت
                <br/>
                ${otp}
                <br/>
                در صورتی که این درخواست از جانب شما ارسال نشده است؛ لطفا این ایمیل را نادیده بگیرید
            </div>
                `,
    };
    const ttl = 2 * 60 * 1000;
    const expires = Date.now() + ttl;
    const data = `${hashEmail}_${expires}_${hashOtp}`;
    await this.emailUtils.sendEmail(emailSenderInfo);
    return {
      sign: data,
    };
  }

  async verifyOtpByEmail(body: VerifyOtpByEmail, otp_email_sign: string) {
    const [expired, hashOtp] = otp_email_sign.split('_');
    const hasExpired = Number(expired) < Date.now();
    const verifyOtp = await this.hashUtils.verifyPassword(body.verification.otp, hashOtp);
    if (hasExpired || !verifyOtp) {
      throw new BadRequestException('کد یکبارمصرف وارد شده صحیح نمیباشد');
    }
  }

  async loginUser(body: LoginUser, session_id: string) {
    if (!session_id) {
      throw new BadRequestException('session_id وجود ندارد');
    }

    const user = await this.userModel.findOne({
      $or: [
        {
          username: body.username,
          // status: {
          //   $in: [statusUser.CONFIRMED],
          // },
        },
        {
          email: body.username,
          // status: {
          //   $in: [statusUser.CONFIRMED],
          // },
        },
      ],
    });
    if (!user) {
      throw new BadRequestException('یوزرنیم یا پسورد اشتباه میباشد');
    }
    if (user.status == 4) throw new ForbiddenException('access denied');
    const verifyPassword = await this.hashUtils.verifyPassword(body.password, user.password);
    if (!verifyPassword) {
      throw new BadRequestException('یوزرنیم یا پسورد اشتباه میباشد');
    }

    const token = await this.jwtUtils.generateToken({ _id: user._id });
    await this.setCartInLogin(session_id, user._id);
    return { token, user };
  }

  async verifyAuth(body: VerifyAuth) {
    const errors = [];
    const has_email = await this.userModel.findOne({
      email: body?.email,
    });
    if (has_email && body.email) {
      errors.push('ایمیل قبلا ثبت شده است');
    }
    const has_mobile = await this.userModel.findOne({
      mobile: body?.mobile,
    });
    if (has_mobile && body.mobile) {
      errors.push('شماره موبایل قبلا ثبت شده است');
    }
    const has_username = await this.userModel.findOne({
      username: body?.username,
    });
    if (has_username && body.username) {
      errors.push('نام کاربری قبلا ثبت شده است');
    }
    const has_national_code = await this.userModel.findOne({
      national_code: body?.national_code,
    });
    if (has_national_code && body.national_code) {
      errors.push('کدملی در سیستم موجود است');
    }
    const has_code_upper_head = await this.userModel.findOne({
      code: body?.code_upper_head,
    });
    if (!has_code_upper_head && body.code_upper_head) {
      errors.push('کد بالاسری در سیستم وجود ندارد');
    }
    const has_identification_code = await this.userModel.findOne({
      code: body?.identification_code,
    });
    if (!has_identification_code && body.identification_code) {
      errors.push('کد معرف در سیستم وجود ندارد');
    }
    return errors;
  }

  private async setCartInLogin(sessionId: string, userId: string | ObjectId) {
    await this.cartModel.updateMany(
      { session_id: sessionId },
      {
        user: userId,
      },
    );
  }

  async generateUniqueCode(): Promise<string> {
    const code = 'sasin' + randomInt(99999999).toString().padStart(8, '0');
    const exists = await this.userModel.findOne({ code });
    if (exists) return await this.generateUniqueCode();
    return code;
  }
}
