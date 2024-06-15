import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { ServiceException } from '../errors/service-exception';
import formatResponse from '../utils/response.formatter';

@Catch(HttpException, ServiceException)
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException | ServiceException, host: ArgumentsHost) {
    const context = host.switchToHttp();

    const response = context.getResponse<Response>();
    const status = exception.getStatus();
    const message = exception.message;

    response.status(status).json(formatResponse(false, null, message));
  }
}
