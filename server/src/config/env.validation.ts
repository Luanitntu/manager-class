import { plainToInstance, Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, validateSync } from 'class-validator';
export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

/**
 * Strongly-typed validation of process.env at boot.
 * The app refuses to start if a required variable is missing or malformed.
 */
export class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  PORT = 3001;

  @IsString()
  @IsOptional()
  API_PREFIX = 'api/v1';

  @IsString()
  @IsOptional()
  CORS_ORIGIN = 'http://localhost:3000';

  @IsString()
  DATABASE_URL!: string;

  @IsString()
  @IsOptional()
  REDIS_USERNAME = 'default';

  @IsString()
  @IsOptional()
  REDIS_HOST = 'localhost';

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  REDIS_PORT = 6379;

  @IsString()
  @IsOptional()
  REDIS_PASSWORD = '';

  @IsString()
  JWT_ACCESS_SECRET!: string;

  @IsString()
  @IsOptional()
  JWT_ACCESS_EXPIRES_IN = '15m';

  @IsString()
  JWT_REFRESH_SECRET!: string;

  @IsString()
  @IsOptional()
  JWT_REFRESH_EXPIRES_IN = '7d';

  @IsString()
  @IsOptional()
  RESEND_API_KEY = '';

  @IsString()
  @IsOptional()
  EMAIL_FROM = 'Schedule Teacher <no-reply@example.com>';
}

export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(
      `Invalid environment configuration:\n${errors
        .map((e) => `  - ${e.property}: ${Object.values(e.constraints ?? {}).join(', ')}`)
        .join('\n')}`,
    );
  }

  return validatedConfig;
}
