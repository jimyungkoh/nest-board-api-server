import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { TResponse } from '../types';
import formatResponse from '../utils/response.formatter';

@Injectable()
export class SuccessResponseInterceptor<T>
  implements NestInterceptor<T, TResponse<T>>
{
  intercept(_: ExecutionContext, next: CallHandler): Observable<TResponse<T>> {
    return next.handle().pipe(map((data) => formatResponse(true, data, null)));
  }
}
