import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JWTUtils } from 'src/utils/jwt-utils';
import { JwtPayload, RequestUserWithAuth } from 'src/types/authorization.types';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/modules/user/user.interface';
import { ObjectId } from 'mongodb';

@Injectable()
export class UserAuthGuard implements CanActivate {
  constructor(
    private readonly jwtUtils: JWTUtils,
    @InjectModel('users') private userModel: Model<User>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<any> {
    try {
      const request: RequestUserWithAuth = context.switchToHttp().getRequest();
      const authHeader = request.headers.authorization;
      if (!authHeader) {
        throw new UnauthorizedException('unauthorized');
      }
      const token = authHeader.split(' ')[1];
      const { _id } = (await this.jwtUtils.verifyToken(token)) as JwtPayload;
      const users = await this.userModel.aggregate([
        {
          $match: {
            _id: new ObjectId(_id),
          },
        },
        {
          $lookup: {
            from: 'provinces', // Collection name for cities
            localField: 'city_id',
            foreignField: 'cities._id',
            as: 'province',
          },
        },
        {
          $unwind: {
            path: '$province',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            'province.city': {
              $filter: {
                input: '$province.cities',
                cond: {
                  $eq: ['$$this._id', '$city_id'],
                },
              },
            },
          },
        },
        {
          $unwind: {
            path: '$province.city',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            first_name: '$first_name',
            last_name: '$last_name',
            code: '$code',
            gender: '$gender',
            national_code: '$national_code',
            mobile: '$mobile',
            phone_number: '$phone_number',
            is_iranian: '$is_iranian',
            postal_code: '$postal_code',
            username: '$username',
            father_name: '$father_name',
            birth_certificate_code: '$birth_certificate_code',
            identification_code: '$identification_code',
            img_url: '$img_url',
            marketer_code: '$marketer_code',
            bank_info: '$bank_info',
            documents: '$documents',
            role: '$role',
            address: '$address',
            code_upper_head: '$code_upper_head',
            province: {
              _id: '$province._id',
              name: '$province.name',
              city: '$province.city',
            },
          },
        },
      ]);
      if (!users.length) {
        throw new UnauthorizedException('unauthorized');
      }
      request.user = users[0];
      return true;
    } catch (error) {
      throw new UnauthorizedException('unauthorized');
    }
  }
}

@Injectable()
export class UserOptionalGuard implements CanActivate {
  constructor(private readonly jwtUtils: JWTUtils) {}
  async canActivate(context: ExecutionContext): Promise<any> {
    try {
      const request: RequestUserWithAuth = context.switchToHttp().getRequest();
      const authHeader = request?.headers?.authorization;
      if (authHeader) {
        const token = authHeader.split(' ')[1];
        const user: any = await this.jwtUtils.verifyToken(token);
        request.user = user;
      }
      return true;
    } catch (error) {
      return true;
    }
  }
}
