import { Logger } from '@libs/logger';
import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { IResponse } from '@types';
import { Request, Response } from 'express';
import { ClsService } from 'nestjs-cls';
import { catchError, Observable, of } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LogErrorInterceptor implements NestInterceptor {
  constructor(
    private readonly cls: ClsService,
    private readonly log: Logger,
  ) {
    this.log.setContext(LogErrorInterceptor.name);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    this.cls.set('requestId', uuidv4());
    return next.handle().pipe(
      catchError((err) => {
        let code = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = err.message ?? 'Internal server error';
        const request = context.switchToHttp().getRequest<Request>();
        const path = request.url ?? request.originalUrl ?? request.baseUrl;
        if (err instanceof HttpException) {
          message =
            typeof err.getResponse() === 'object'
              ? (err.getResponse()['message'] ?? err.getResponse())
              : err.getResponse();
          code = err.getStatus();
          this.log.log(`[${path}] ${message}`);
        } else {
          this.log.error(err, path);
        }
        const errorResponse: IResponse<null> = {
          code,
          message,
          success: false,
          data: null,
          path: path,
          timestamp: new Date(),
        };

        context.switchToHttp().getResponse<Response>().status(code);
        return of(errorResponse);
      }),
    );
  }
}
