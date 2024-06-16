import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { ServiceException } from '../errors/service-exception';
import formatResponse from '../utils/response.formatter';

@Catch(Error)
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();

    if (
      exception instanceof HttpException ||
      exception instanceof ServiceException
    ) {
      const { status, message } = this.getExceptionDetails(exception);

      return response.status(status).json(formatResponse(false, null, message));
    }

    return response
      .status(400)
      .json(formatResponse(false, null, exception.message));
  }

  private getExceptionDetails(exception: HttpException | ServiceException): {
    status: number;
    message: string | object;
  } {
    if (exception instanceof HttpException === false)
      return {
        status: exception.getStatus(),
        message: exception.message,
      };

    const { statusCode: status, message } = exception.getResponse() as {
      statusCode: number;
      message: string | object;
    };

    return { status, message };
  }
}
