import {
  Controller,
  Get,
  Res,
  Body,
  Param,
  Delete,
  Query,
  Post,
  UseGuards,
  Patch,
  MethodNotAllowedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import * as excel from 'exceljs';
import { HasPermissions } from '@$/common/decorators/has-permissions.decorator';
import { ParseObjectIdPipe } from '@$/common/pipes/parse-objectid.pipe';
import { QueryUser } from '@$/modules/user/dto/queryUser.dto';
import { UpdateUserByAdmin } from '@$/modules/user/dto/updateUserByAdmin.dto';
import { CreateUserByAdmin } from '@$/modules/user/dto/createUserByAdmin.dto';
import { QuerySkanetUser } from '@$/modules/user/dto/querySkanetUser.dto';
import { QueryExcelUser } from '@$/modules/user/dto/queryExcelUser.dto';
import { QuerySubs } from '@$/modules/user/dto/querySubs.dto';
import { AdminGuard } from '../guards/admin.guard';
import { AuditLog } from '@$/common/decorators/audit-log.decorator';
import { User, UserDocument } from '@$/modules/user/schema/user.schema';
import { UserService } from '@$/modules/user/services/user.service';
import { VezaratService } from '@$/modules/user/services/vezarat.service';
import { TerminateRequestService } from '@$/modules/user/services/terminate-request.service';
import { AssessTerminateRequestDto, SearchTerminateRequestDto } from '../dto/terminate-request.dto';
import { CreateUserTestDto } from '../../user/dto/create-user-test.dto';

@ApiBearerAuth('Admin-Access-Token')
@UseGuards(AdminGuard)
@ApiTags('admin/user')
@Controller('admin/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly vezaratService: VezaratService,
    private readonly terminateRequestService: TerminateRequestService,
  ) {}

  @Get('/bank-info')
  @HasPermissions('Read.Admin')
  async getBankInfosByAdmin(@Query('limit') limit: number, @Query('skip') skip: number) {
    return await this.userService.getBankInfosByAdmin(limit,skip);
  }

  @Get('/change-referal-to-code/:role')
  @HasPermissions('Create.Admin')
  async changeReferalToCode(@Param('role') role: 'MARKETER' | 'CUSTOMER') {
    if (role === 'MARKETER') return this.userService.changeReferalToCode();
    return this.userService.changeReferalToCodeForUsers();
  }

  @Get('/test/subs')
  async getSubsUserTest(@Query() query: QuerySubs) {
    return await this.userService.getSubsUserTest(query);
  }

  @Get('/skanet')
  @HasPermissions('Read.User')
  async getSkanetUsersByAdmin(@Query() query: QuerySkanetUser) {
    return this.userService.getSkanetUsersByAdmin(query);
  }

  @Get('/skanet/:id')
  @HasPermissions('Read.User')
  async getSkanetUserByAdmin(@Param('id', ParseObjectIdPipe) id: string) {
    return this.userService.getSkanetUserByAdmin(id);
  }

  @Get('/marketers/vezarat')
  async getVezaratCodeForUsers() {
    if (process.env.NODE_ENV !== 'production') throw new MethodNotAllowedException('!production');
    const marketers: UserDocument[] = await this.userService._find({
      role: ['MARKETER'],
      marketer_code: { $in: [null, ''] },
    });
    for (let i = 0; i < marketers.length; i++) {
      const result = await this.vezaratService.registerMarketer({
        nationalCode: marketers[i].national_code,
        firstName: marketers[i].first_name ?? '',
        lastName: marketers[i].last_name ?? '',
        birthDate: marketers[i].brith_day ?? '',
        address: marketers[i].address ?? '',
        education: '',
        email: marketers[i].email ?? '',
        fatherName: marketers[i].father_name ?? '',
        idNo: '',
        parentNationalCode: '',
        phone1: marketers[i].phone_number ?? '',
        phone2: '',
        postalCode: marketers[i].postal_code ?? '',
      });
      if (result) {
        await this.userService._update(marketers[i]._id, { marketer_code: result });
      } else {
        const xx = await this.vezaratService.getPersonCode(marketers[i].national_code);
        if (xx) {
          await this.userService._update(marketers[i]._id, { marketer_code: xx });
        }
      }
    }
    return marketers;
  }

  @Patch('/marketer/terminate-request/:id')
  async assessTerminateRequests(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: AssessTerminateRequestDto) {
    return this.terminateRequestService.assessTerminateRequest(id, dto);
  }

  @Get('/marketer/terminate-request/:id')
  async getTerminateRequest(@Param('id', ParseObjectIdPipe) id: string) {
    return this.terminateRequestService.getTerminateInfo(id);
  }

  @Get('/marketer/terminate-request')
  async searchTerminateRequests(@Query() dto: SearchTerminateRequestDto) {
    return this.terminateRequestService.search(dto);
  }

  @Get('/:nationalCode/vezarat-info')
  async getVezaratInfo(@Param('nationalCode') nationalCode: string) {
    const status = await this.vezaratService.getPersonStatus(nationalCode);
    const code = await this.vezaratService.getPersonCode(nationalCode);
    const company = await this.vezaratService.getPersonCompany(nationalCode);
    return {
      status,
      code,
      company,
    };
  }

  @Get('/:id')
  @HasPermissions('Read.User')
  async getUserByAdmin(@Param('id', ParseObjectIdPipe) id: string) {
    return this.userService.getUserByAdmin(id);
  }

  @Get('/')
  @HasPermissions('Read.User')
  async getUsersByAdmin(@Query() query: QueryUser) {
    return this.userService.getUsersByAdmin(query);
  }

  @Delete('/:id')
  @HasPermissions('Delete.User')
  async deleteUserByAdmin(@Param('id', ParseObjectIdPipe) id: string) {
    return this.userService.deleteUserByAdmin(id);
  }

  @Patch('/:id')
  @HasPermissions('Update.User')
  async updateUserByAdmin(@Param('id', ParseObjectIdPipe) id: string, @Body() body: UpdateUserByAdmin) {
    return this.userService.updateUserByAdmin(id, body);
  }

  @Post('/')
  @AuditLog(User.name, 'CREATE')
  @HasPermissions('Create.User')
  async createUserByAdmin(@Body() body: CreateUserByAdmin) {
    return this.userService.createUserByAdmin(body);
  }
  @Get('/excel')
  @HasPermissions('Read.User')
  async genrateExcelUsers(@Query() query: QueryExcelUser, @Res() res: Response) {
    const users = await this.userService.genrateExcelUsers(query);
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Users');
    worksheet.columns = [
      { header: 'نام خانوادگی', key: 'last_name', width: 18 },
      { header: 'نام', key: 'first_name', width: 18 },
      { header: 'نام کاربری', key: 'username', width: 18 },
      { header: 'کدملی', key: 'national_code', width: 18 },
      { header: 'موبایل', key: 'mobile', width: 18 },
      { header: 'ایمیل', key: 'email', width: 18 },
      { header: 'کدپستی', key: 'postal_code', width: 18 },
      { header: 'آدرس', key: 'address', width: 18 },
      { header: 'شماره شناسنامه', key: 'birth_certificate_code', width: 18 },
      { header: 'نام پدر', key: 'father_name', width: 18 },
      { header: 'کدبالاسری', key: 'code_upper_head', width: 18 },
      { header: 'کدمعرف', key: 'identification_code', width: 18 },
      { header: 'کد بازاریاب', key: 'marketer_code', width: 18 },
      { header: 'کد وزارت', key: 'ministry_code', width: 18 },
    ];

    worksheet.addRows(users);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=' + 'users.xlsx');
    return workbook.xlsx.write(res).then(() => {
      res.status(200).end();
    });
  }

  @Get('/skanet/excel')
  @HasPermissions('Read.User')
  async genrateExcelSkanetUsers(@Query() query: QueryExcelUser, @Res() res: Response) {
    const users = await this.userService.genrateExcelUsers(query);
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Users');
    worksheet.columns = [
      { header: 'نام خانوادگی', key: 'last_name', width: 18 },
      { header: 'نام', key: 'first_name', width: 18 },
      { header: 'نام کاربری', key: 'username', width: 18 },
      { header: 'کدملی', key: 'national_code', width: 18 },
      { header: 'موبایل', key: 'mobile', width: 18 },
      { header: 'ایمیل', key: 'email', width: 18 },
      { header: 'کدپستی', key: 'postal_code', width: 18 },
      { header: 'آدرس', key: 'address', width: 18 },
      { header: 'شماره شناسنامه', key: 'birth_certificate_code', width: 18 },
      { header: 'نام پدر', key: 'father_name', width: 18 },
      { header: 'کدبالاسری', key: 'code_upper_head', width: 18 },
      { header: 'کدمعرف', key: 'identification_code', width: 18 },
      { header: 'کد بازاریاب', key: 'marketer_code', width: 18 },
      { header: 'کد وزارت', key: 'ministry_code', width: 18 },
    ];

    worksheet.addRows(users);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=' + 'users.xlsx');
    return workbook.xlsx.write(res).then(() => {
      res.status(200).end();
    });
  }

  @Get('/:id/subs')
  @HasPermissions('Read.User')
  async getSubsUserByAdmin(@Param('id', ParseObjectIdPipe) id: string, @Query() query: QuerySubs) {
    return this.userService.getSubsUserByAdmin(id, query);
  }

  @Get('/:id/parent')
  async getParents(@Param('id', ParseObjectIdPipe) id: string) {
    return await this.userService.getParents(id);
  }

  @Get('/subs/sasinnet')
  async getSubsUsersSkanetByAdmin(@Query() query: QuerySubs) {
    return this.userService.getSubsSasinNetByAdmin(query);
  }

  @Post('/test')
  async createTestuserByAdmin(@Body() body: CreateUserTestDto) {
    return await this.userService.createTestuserByAdmin(body);
  }

  @Get('/test/:id/subs')
  async getSubsTestUser(@Param('id', ParseObjectIdPipe) id: string, @Query() query: QuerySubs) {
    return await this.userService.getSubsTestUser(id, query);
  }

  @Delete('/test/:id')
  async deleteUserTestByAdmin(@Param('id', ParseObjectIdPipe) id: string) {
    return await this.userService.deleteUserTestByAdmin(id);
  }
}
