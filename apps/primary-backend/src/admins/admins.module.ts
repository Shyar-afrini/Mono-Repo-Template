import { Module } from '@nestjs/common';
import { DatabaseModule } from 'database/drizzle.module';
import { Validator } from 'database/validator';
import { AdminsService } from './admins.service';

@Module({
  imports: [DatabaseModule],
  providers: [AdminsService, Validator],
  exports: [AdminsService],
})
export class AdminsModule { }
