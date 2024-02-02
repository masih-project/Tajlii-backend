import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JWTUtils } from 'src/utils/jwt-utils';
import { JwtPayload, RequestUserWithAuth } from 'src/types/authorization.types';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/modules/user/user.interface';

@Injectable()
export class CardUserAuthGuard implements CanActivate {
  constructor(
    private readonly jwtUtils: JWTUtils,
    @InjectModel('users') private userModel: Model<User>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<any> {
    try {
      const request: RequestUserWithAuth = context.switchToHttp().getRequest();
      // if (!request?.cookies?.session_id) {
      //   throw new UnauthorizedException('unauthorized');
      // }
      const authHeader = request.headers.authorization;
      if (!authHeader) {
        return true;
      }
      const token = authHeader.split(' ')[1];
      const { _id } = (await this.jwtUtils.verifyToken(token)) as JwtPayload;
      const user = await this.userModel.findOne({ _id });
      request.user = {
        first_name: user.first_name,
        last_name: user.last_name,
        gender: user.gender,
        national_code: user.national_code,
        address: user.address,
        phone_number: user.phone_number,
        identification_code: user.identification_code,
        username: user.username,
        postal_code: user.postal_code,
        is_iranian: user.is_iranian,
        brith_day: user.brith_day,
        city_id: user.city_id,
        father_name: user.father_name,
        code_upper_head: user.code_upper_head,
        birth_certificate_code: user.birth_certificate_code,
        role: user.role,
        _id: user._id,
        img_url: user.img_url,
        marketer_code: user.marketer_code,
        mobile: user.mobile,
      };
      return true;
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('unauthorized');
    }
  }
}
