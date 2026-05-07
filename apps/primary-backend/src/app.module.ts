import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from 'database/drizzle.module';
import { Validator } from 'database/validator';
import { AdminsController } from './admins/admins.controller';
import { AdminsModule } from './admins/admins.module';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { PermissionGuard } from './guards/permission.guard';
import { LimiterMiddleware } from './middlewares/limiter.middleware';
import { MiddlewareConfigModule } from './middlewares/middleware.config';

@Module({
  imports: [
    DatabaseModule,
    MiddlewareConfigModule,
    AdminsModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 100,
        },
        {
          name: 'short',
          ttl: 1000,
          limit: 3,
        },
        {
          name: 'medium',
          ttl: 10000,
          limit: 20,
        },
        {
          name: 'long',
          ttl: 60000,
          limit: 100,
        },
      ],
    }),
  ],
  controllers: [
    AdminsController,
    AuthController,
  ],
  providers: [
    LimiterMiddleware,
    PermissionGuard,
    AuthService,
    Validator,
  ],
})
export class AppModule { }
