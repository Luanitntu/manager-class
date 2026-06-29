import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  /**
   * Connects with retries. Serverless Postgres (e.g. Neon free tier) suspends
   * when idle and can be slow to cold-start, so the first connect may fail —
   * we retry instead of crashing the whole app.
   */
  async onModuleInit(): Promise<void> {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        await this.$connect();
        this.logger.log('Connected to database');
        return;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.warn(
          `DB connect attempt ${attempt}/${MAX_RETRIES} failed: ${msg.split('\n')[0]}`,
        );
        if (attempt === MAX_RETRIES) {
          this.logger.error(
            'Could not reach the database. If using Neon, the compute may be ' +
              'suspended — open the Neon dashboard to wake it, then restart.',
          );
          throw err;
        }
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      }
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Disconnected from database');
  }
}
