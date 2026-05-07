import {
  PaginationConstruct,
  paginationParams,
  parseSortBy,
  type PaginationQuery,
} from '@mono-repo-template/backend/types';
import {
  OK_STATUS,
  SESSION_TOKEN,
  verifyJWT,
} from '@mono-repo-template/backend/utils';
import {
  Admin,
  insertAdminSchema,
  updateAdminSchema,
  type NewAdmin,
  type UpdateAdmin
} from '@mono-repo-template/database';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { ZodValidationPipe } from 'nestjs-zod';
import { DenyAccess } from 'src/decorators/deny-access.decorator';
import { RequirePermission } from 'src/decorators/require-permission.decorator';
import { PermissionGuard } from 'src/guards/permission.guard';
import { AuthGuard } from 'src/middlewares/check-auth.middleware';
import z from 'zod';
import { AdminsService } from './admins.service';

const createAdminBodySchema = insertAdminSchema;

const updateAdminBodySchema = updateAdminSchema
  .omit({ password: true })

@Controller('admins')
@UseGuards(AuthGuard, PermissionGuard)
export class AdminsController {
  constructor(
    private AdminServices: AdminsService,
  ) { }

  @Get()
  @HttpCode(OK_STATUS)
  @RequirePermission('admin:read')
  async getAdmins(
    @Request() req: ExpressRequest,
    @Query('q', new ZodValidationPipe(z.string().optional()))
    search: string | undefined,
    @Query(new ZodValidationPipe(paginationParams))
    paginationParams: PaginationQuery,
    @Query('sortBy', new ZodValidationPipe(z.string().optional()))
    sort: string | undefined,
  ): Promise<PaginationConstruct<Omit<Admin, 'password'>[]>> {
    const sessionToken = req.cookies[SESSION_TOKEN];
    const currentAdminId = verifyJWT(sessionToken)?.sub as string;

    const admins = await this.AdminServices.getAdmins(
      paginationParams,
      search,
      parseSortBy(sort),
      currentAdminId || '',
    );

    if (!admins.success && admins.error) {
      throw new HttpException(
        { message: admins.error.message, code: admins.error.code },
        admins.statusCode,
        {
          cause: admins.error.details,
        },
      );
    }
    return admins.data as PaginationConstruct<Omit<Admin, 'password'>[]>;
  }


  @Get('current-session')
  @HttpCode(OK_STATUS)
  async getCurrentSession(
    @Request() req: ExpressRequest,
  ): Promise<any> {
    const admin = req.cookies[SESSION_TOKEN]
      ? verifyJWT(req.cookies[SESSION_TOKEN])
      : null;

    if (!admin) {
      throw new UnauthorizedException('Not Logged In');
    }

    const result = await this.AdminServices.getCurrentAdmin(admin?.sub);
    if (!result.success && result.error) {
      throw new HttpException(
        { message: result.error.message, code: result.error.code },
        result.statusCode,
        {
          cause: result.error.details,
        },
      );
    }
    return result.data;
  }

  @Get(':id')
  @RequirePermission('admin:read')
  async getAdminById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Request() req: ExpressRequest,
  ): Promise<Omit<Admin, 'password'>> {
    const currentAdminId = verifyJWT(req.cookies[SESSION_TOKEN])?.sub as string;
    const admin = await this.AdminServices.getAdminById(id, currentAdminId);

    if (!admin.success && admin.error) {
      throw new HttpException(
        { message: admin.error.message, code: admin.error.code },
        admin.statusCode,
        {
          cause: admin.error.details,
        },
      );
    }
    return admin.data as Omit<Admin, 'password'>;
  }

  @Post()
  @RequirePermission('admin:write')
  async createNewAdmin(
    @Body(new ZodValidationPipe(createAdminBodySchema))
    adminData: NewAdmin,
  ): Promise<Omit<Admin, 'password'>> {
    const admin = await this.AdminServices.createNewAdmin(adminData);
    if (!admin.success && admin.error) {
      throw new HttpException(
        { message: admin.error.message, code: admin.error.code },
        admin.statusCode,
        {
          cause: admin.error.details,
        },
      );
    }
    return admin.data as Omit<Admin, 'password'>;
  }

  @Put(':id')
  @RequirePermission('admin:write')
  async updateAdmin(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body(new ZodValidationPipe(updateAdminBodySchema))
    adminData: UpdateAdmin,
  ): Promise<Omit<Admin, 'password'>> {
    const admin = await this.AdminServices.updateAdmin(id, adminData);

    if (!admin.success && admin.error) {
      throw new HttpException(
        { message: admin.error.message, code: admin.error.code },
        admin.statusCode,
        {
          cause: admin.error.details,
        },
      );
    }
    return admin.data as Omit<Admin, 'password'>;
  }

  @Patch(':id/change-password')
  @RequirePermission('admin:write')
  async changeAdminPassword(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body(new ZodValidationPipe(insertAdminSchema.pick({ password: true })))
    adminData: Pick<NewAdmin, 'password'>,
  ): Promise<Omit<Admin, 'password'>> {
    const admin = await this.AdminServices.changeAdminPassword(
      id,
      adminData.password,
    );

    if (!admin.success && admin.error) {
      throw new HttpException(
        { message: admin.error.message, code: admin.error.code },
        admin.statusCode,
        {
          cause: admin.error.details,
        },
      );
    }
    return admin.data as Omit<Admin, 'password'>;
  }

  @Delete(':id')
  @RequirePermission('admin:delete')
  async deleteAdmin(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<Omit<Admin, 'password'>> {
    const admin = await this.AdminServices.deleteAdmin(id);

    if (!admin.success && admin.error) {
      throw new HttpException(
        { message: admin.error.message, code: admin.error.code },
        admin.statusCode,
        {
          cause: admin.error.details,
        },
      );
    }
    return admin.data as Omit<Admin, 'password'>;
  }

  @Patch(':id/deactivate')
  @RequirePermission('admin:write')
  async deactivateAdmin(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<any> {
    const admin = await this.AdminServices.deactivateAdmin(id);

    if (!admin.success && admin.error) {
      throw new HttpException(
        { message: admin.error.message, code: admin.error.code },
        admin.statusCode,
        {
          cause: admin.error.details,
        },
      );
    }

    return admin.data;
  }

  @Patch(':id/activate')
  @RequirePermission('admin:write')
  async activateAdmin(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<any> {
    const admin = await this.AdminServices.activateAdmin(id);

    if (!admin.success && admin.error) {
      throw new HttpException(
        { message: admin.error.message, code: admin.error.code },
        admin.statusCode,
        {
          cause: admin.error.details,
        },
      );
    }

    return admin.data;
  }
}
