import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LogErrorInterceptor } from './log-error.interceptor';
import { ResponseInterceptor } from './response.interceptor';
import { ClsModule } from 'nestjs-cls';
import { LoggerModule } from '@libs/logger';

@Module({
  imports: [ClsModule, LoggerModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LogErrorInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class InterceptorModule {}
