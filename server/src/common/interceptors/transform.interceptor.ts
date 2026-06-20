import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaginatedResult } from '../dto/paginated-result';
import { ApiSuccessResponse } from '../interfaces/api-response.interface';
import { SKIP_TRANSFORM_KEY } from '../decorators/skip-transform.decorator';

/**
 * Wraps every successful controller return value in the standard envelope:
 *   { success: true, data: ... }
 * Paginated results additionally surface `meta`. Routes marked @SkipTransform()
 * (file/stream downloads) are passed through untouched.
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, unknown> {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<unknown> {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_TRANSFORM_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) {
      return next.handle();
    }

    return next.handle().pipe(
      map((payload): ApiSuccessResponse<unknown> => {
        if (payload instanceof PaginatedResult) {
          return { success: true, data: payload.data, meta: payload.meta };
        }
        return { success: true, data: payload ?? null };
      }),
    );
  }
}
