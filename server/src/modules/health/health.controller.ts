import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import Redis from 'ioredis';
import * as os from 'os';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RedisConfig } from '../../config/configuration';
import { NotificationService } from '../notification/notification.service';

interface CheckResult {
  ok: boolean;
  latencyMs?: number;
  message?: string;
}

function pkgVersion(name: string): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require(`${name}/package.json`).version as string;
  } catch {
    return 'unknown';
  }
}

const MB = 1024 * 1024;

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly notifications: NotificationService,
  ) {}

  @Public()
  @Get()
  async check(): Promise<{ status: string; db: string; timestamp: string }> {
    const db = await this.checkDb();
    return {
      status: db.ok ? 'ok' : 'degraded',
      db: db.ok ? 'up' : 'down',
      timestamp: new Date().toISOString(),
    };
  }

  // Detailed system health for the Super Admin console. Reads runtime metrics
  // via `os`, so it reflects whatever environment the app runs on (local/VPS/cloud).
  @ApiBearerAuth()
  @Roles(Role.SUPER_ADMIN)
  @Get('system')
  async system() {
    const [db, redis] = await Promise.all([this.checkDb(), this.checkRedis()]);

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const cpus = os.cpus();
    const procMem = process.memoryUsage();

    return {
      status: db.ok && redis.ok ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      env: this.config.get<string>('app.nodeEnv'),
      versions: {
        node: process.version,
        nestjs: pkgVersion('@nestjs/core'),
        prisma: pkgVersion('@prisma/client'),
      },
      database: { provider: 'PostgreSQL', ...db },
      redis,
      system: {
        platform: os.platform(),
        arch: os.arch(),
        hostname: os.hostname(),
        cpuModel: cpus[0]?.model?.trim() ?? 'unknown',
        cpuCores: cpus.length,
        loadAvg1m: Number(os.loadavg()[0]?.toFixed(2) ?? 0),
        memTotalMb: Math.round(totalMem / MB),
        memUsedMb: Math.round((totalMem - freeMem) / MB),
        memUsedPct: Math.round(((totalMem - freeMem) / totalMem) * 100),
      },
      process: {
        rssMb: Math.round(procMem.rss / MB),
        heapUsedMb: Math.round(procMem.heapUsed / MB),
      },
    };
  }

  @ApiBearerAuth()
  @Roles(Role.SUPER_ADMIN)
  @Get('queue')
  queue() {
    return this.notifications.getStats();
  }

  private async checkDb(): Promise<CheckResult> {
    const t = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { ok: true, latencyMs: Date.now() - t };
    } catch (e) {
      return { ok: false, message: (e as Error).message.split('\n')[0] };
    }
  }

  private async checkRedis(): Promise<CheckResult> {
    const cfg = this.config.getOrThrow<RedisConfig>('redis');
    const client = new Redis({
      host: cfg.host,
      port: cfg.port,
      password: cfg.password || undefined,
      lazyConnect: true,
      connectTimeout: 3000,
      maxRetriesPerRequest: 1,
      retryStrategy: () => null,
    });
    const t = Date.now();
    try {
      await client.connect();
      await client.ping();
      return { ok: true, latencyMs: Date.now() - t };
    } catch (e) {
      return { ok: false, message: (e as Error).message.split('\n')[0] };
    } finally {
      client.disconnect();
    }
  }
}
