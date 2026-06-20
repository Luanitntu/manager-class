import { PaginationMeta } from '../interfaces/api-response.interface';

/**
 * Wrapper returned by services for list endpoints.
 * The TransformInterceptor detects this shape and lifts `meta`
 * to the top level of the API envelope.
 */
export class PaginatedResult<T> {
  readonly data: T[];
  readonly meta: PaginationMeta;

  constructor(data: T[], total: number, page: number, limit: number) {
    this.data = data;
    this.meta = {
      page,
      limit,
      total,
      totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
    };
  }
}
