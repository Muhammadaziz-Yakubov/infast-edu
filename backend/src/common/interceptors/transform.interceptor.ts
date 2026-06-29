import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    // Avoid double intercepting or intercepting non-JSON/Swagger endpoints if needed.
    // For this API, it wraps all standard REST responses in the success format.
    return next.handle().pipe(
      map((data) => {
        // If data already contains a 'success' key, return as-is
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }
        return {
          success: true,
          data: data !== undefined && data !== null ? data : {},
        };
      }),
    );
  }
}
