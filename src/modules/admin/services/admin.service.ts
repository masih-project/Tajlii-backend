import {
  ConflictException,
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateAdminDto, LoginAdminDto, SignupAdminDto } from '../dto/createAdmin.dto';
import { Model, Types } from 'mongoose';
import { IAdminTokenPayload } from '../types/admin-token-payload.interface';
import { LoginAdmin } from '../dto/loginAdmin.dto';
import { UpdateAdminDto } from '../dto/updateAdmin.dto';
import { QueryAdmin } from '../dto/queryAdmin.dto';
import { ChangePasswordDto, UpdateEmail, UpdatePhoneNumber } from 'src/types/public.types';
import { HashUtils } from 'src/utils/hast-utils';
import { JWTUtils } from 'src/utils/jwt-utils';
import { AuthService } from 'src/modules/Auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { Admin } from '../schemas/admin.schema';
import { RoleService } from '../../role/services/role.service';
import { PermissionType } from '../../role/types';
import { UpdateAdminMeDto } from '../dto/updateAdminMe.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel('admins') private adminModel: Model<Admin>,
    private hashUtils: HashUtils,
    private jwtUtils: JWTUtils,
    private authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly roleService: RoleService,
  ) {}
  async createAdmin(body: CreateAdminDto): Promise<any> {
    if (body.password !== body.confirm_password) {
      throw new BadRequestException('رمز عبور و تکرار رمز عبور با هم مطابقت ندارد');
    }
    const username = body.username.toLocaleLowerCase();
    const admin = await this.adminModel.findOne({ username });
    if (admin) {
      throw new BadRequestException('همچین ادمینی وجود دارد');
    }
    const password = await this.hashUtils.hashString(body.password);
    await this.adminModel.create({
      ...body,
      username,
      password,
    });
  }
  async loginAdmin(body: LoginAdmin): Promise<any> {
    const username = body.username.toLocaleLowerCase();
    const admin = await this.adminModel.findOne({ username });
    if (!admin) {
      throw new BadRequestException('نام کاربری یا رمز عبور صحیح نمیباشد');
    }
    const hasVerifyPassword = await this.hashUtils.verifyPassword(body.password, admin.password);
    if (!hasVerifyPassword) {
      throw new BadRequestException('نام کاربری یا رمز عبور صحیح نمیباشد');
    }
    const token = await this.jwtUtils.generateToken({ _id: admin._id });
    return token;
  }
  async getAdmins(adminId: ObjectId, query: QueryAdmin): Promise<any> {
    const { limit, skip, keyword = '' } = query;

    const items = await this.adminModel
      .find(
        {
          _id: { $ne: new Object(adminId) }, // Replace 'yourAdminId' with your actual admin ID
          $or: [
            {
              first_name: {
                $regex: new RegExp(keyword as string),
                $options: 'i',
              },
            },
            {
              last_name: {
                $regex: new RegExp(keyword as string),
                $options: 'i',
              },
            },
            {
              email: { $regex: new RegExp(keyword as string), $options: 'i' },
            },
          ],
        },
        { __v: 0, password: 0 },
      )
      .limit(limit)
      .skip(Number(limit) * Number(skip) * (Number(skip) - 1));

    const count = await this.adminModel.find({
      $or: [
        {
          first_name: {
            $regex: new RegExp(keyword as string),
            $options: 'i',
          },
        },
        {
          last_name: {
            $regex: new RegExp(keyword as string),
            $options: 'i',
          },
        },
        {
          email: { $regex: new RegExp(keyword as string), $options: 'i' },
        },
      ],
    });

    return {
      count,
      items,
    };
  }
  async getAdmin(id: string): Promise<any> {
    const admin = await this.adminModel.findOne(
      {
        _id: id,
      },
      { __v: 0, password: 0 },
    );

    if (!admin) {
      throw new NotFoundException('کاربری یافت نشد');
    }
    return admin;
  }

  async updateAdminProfile(id: Types.ObjectId, body: UpdateAdminMeDto): Promise<any> {
    await this.adminModel.updateOne(
      { _id: id },
      {
        $set: {
          ...body,
        },
      },
    );
  }

  async updateAdmin(id: string, body: UpdateAdminDto): Promise<any> {
    const admin = await this.adminModel.findOne(
      {
        _id: id,
      },
      { __v: 0, password: 0 },
    );
    if (!admin) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    if (body.username) {
      const username = body.username.toLocaleUpperCase();
      const has_admin_exist = await this.adminModel.findOne({
        username,
      });
      if (has_admin_exist) {
        throw new BadRequestException('همچین ادمینی وجود دارد');
      }
    }
    let data = {
      ...body,
    };
    if (body.password) {
      const password = await this.hashUtils.hashString(body.password);
      data = {
        ...data,
        password,
      };
    }
    await this.adminModel.updateOne(
      { _id: id },
      {
        $set: data,
      },
    );
  }
  async updatePhoneNumberAdmin(id: Types.ObjectId, body: UpdatePhoneNumber, otp_sms_sign: string): Promise<any> {
    await this.authService.verfiyOtpByPhoneNumber(body, otp_sms_sign);
    await this.adminModel.updateOne(
      { _id: id },
      {
        phone_number: body.phone_number,
      },
    );
  }
  async updateEmailAdmin(id: Types.ObjectId, body: UpdateEmail, otp_email_sign: string): Promise<any> {
    await this.authService.verifyOtpByEmail(body, otp_email_sign);
    await this.adminModel.updateOne(
      { _id: id },
      {
        email: body.email,
      },
    );
  }
  async deleteAdmin(id: string): Promise<any> {
    await this.adminModel.deleteOne({ _id: id });
  }
  async changePasswordAdmin(id: string, body: ChangePasswordDto): Promise<any> {
    if (body.password !== body.confirm_password) {
      throw new BadRequestException('رمز عبور و تکرار رمزعبور مطابقت ندارد');
    }
    const password = await this.hashUtils.hashString(body.password);
    return await this.adminModel.updateOne(
      { _id: id },
      {
        password,
      },
    );
  }

  signToken(payload: IAdminTokenPayload) {
    return this.jwtService.sign(payload);
  }

  async getAdminAndVerifyAccess(adminId: string, permissions: PermissionType[]) {
    const admin = await this.adminModel.findById(adminId).populate('roleId').exec();
    if (!permissions.length) return admin;
    if (!admin?.roleId?.permissions?.length) throw new ForbiddenException('access denied.');
    const hasAccess = permissions.every((p) => admin.roleId.permissions.includes(p));
    if (!hasAccess) throw new ForbiddenException('access denied.');
    return admin;
  }

  async signup(dto: SignupAdminDto) {
    if (dto.roleId) await this.roleService.getRole(dto.roleId);

    const username = dto.username.toLocaleLowerCase();
    const duplicateUsername = await this.adminModel.findOne({ username }).exec();
    if (duplicateUsername) throw new ConflictException('duplicate username');
    const duplicatePhone = await this.adminModel.findOne({ phone_number: dto.phone_number }).exec();
    if (duplicatePhone) throw new ConflictException('duplicate phone');

    const password = await this.hashUtils.hashString(dto.password);
    return this.adminModel.create({
      ...dto,
      username,
      password,
    });
  }
  async login(dto: LoginAdminDto) {
    const username = dto.username.toLocaleLowerCase();
    const admin = await this.adminModel.findOne({ $or: [{ username }, { phone_number: username }] }).exec();
    if (!admin) throw new UnauthorizedException('invalid username or password');
    const passIsValid = await this.hashUtils.verifyPassword(dto.password, admin.password);
    if (!passIsValid) throw new UnauthorizedException('invalid username or password');

    const accessToken = this.signToken({
      sub: admin._id.toString(),
      phone: admin.phone_number,
      username: admin.username,
    });
    return {
      accessToken,
      refreshToken: '',
      admin,
    };
  }
}
