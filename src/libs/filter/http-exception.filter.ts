import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { IResponse } from '@types';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch(Error)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const path = request.url ?? request.originalUrl ?? request.baseUrl;

    let code = HttpStatus.INTERNAL_SERVER_ERROR;
    let codeString = HttpStatus.INTERNAL_SERVER_ERROR.toString();
    let message =
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : exception.message;

    if (exception instanceof HttpException) {
      codeString = exception.getStatus().toString();
      code = exception.getStatus();
      message = exception.message;
      Logger.log(`[${path}] ${message}`);
    } else if (exception instanceof QueryFailedError) {
      codeString = '500';
      Logger.error(`[${path}] ${exception.message}`, HttpExceptionFilter.name);
    } else {
      Logger.error(`[${path}] ${exception.message}`, HttpExceptionFilter.name);
    }
    const errorResponse: IResponse<null> = {
      code: codeString,
      message,
      success: false,
      data: null,
      path: request.url,
      timestamp: new Date(),
    };

    response.status(code).json(errorResponse);
  }
}
