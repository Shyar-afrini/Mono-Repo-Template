import { InjectionToken, Module, type ValueProvider } from '@nestjs/common';
import {
  DRIZZLE_PRIMARY_DB,
  primaryDb,
  type PrimaryDb
} from '@mono-repo-template/database';

const PrimaryDbProvider: ValueProvider<PrimaryDb> = {
  provide: DRIZZLE_PRIMARY_DB as InjectionToken<PrimaryDb>,
  useValue: primaryDb,
};

@Module({
  providers: [PrimaryDbProvider],
  exports: [PrimaryDbProvider],
})
export class DatabaseModule { }
