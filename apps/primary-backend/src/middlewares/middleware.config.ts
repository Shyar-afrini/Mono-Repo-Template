import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { DatabaseModule } from 'database/drizzle.module';
import { RLSContextMiddleware } from './rls-context.middleware';

@Module({
  imports: [DatabaseModule],
  providers: [RLSContextMiddleware],
})
export class MiddlewareConfigModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RLSContextMiddleware).forRoutes('*'); // Apply to all routes
  }
}
