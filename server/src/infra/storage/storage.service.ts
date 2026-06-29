import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { createReadStream, existsSync, mkdirSync } from 'fs';
import { writeFile, unlink } from 'fs/promises';
import { join, extname } from 'path';
import { Readable } from 'stream';
import { PrismaService } from '../prisma/prisma.service';

interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
}

interface StorageConfig {
  driver: 'local' | 'r2';
  r2: R2Config | null;
}

/**
 * File storage with two backends, chosen at RUNTIME:
 *   - "local": ./uploads on disk (default; great for dev or as an R2 fallback)
 *   - "r2": Cloudflare R2 (S3-compatible)
 * The driver + R2 credentials come from System Settings (DB), falling back to
 * env vars. Switching the driver in Settings takes effect on the next request,
 * so you can flip to local if R2 has issues — without redeploying.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly uploadsDir: string;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.uploadsDir = process.env.UPLOADS_DIR ?? join(process.cwd(), 'uploads');
    if (!existsSync(this.uploadsDir)) {
      mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  private async resolveConfig(): Promise<StorageConfig> {
    const s = await this.prisma.systemSetting
      .findUnique({ where: { id: 'singleton' } })
      .catch(() => null);

    const accountId = s?.r2AccountId || this.config.get<string>('R2_ACCOUNT_ID') || '';
    const accessKeyId = s?.r2AccessKeyId || this.config.get<string>('R2_ACCESS_KEY_ID') || '';
    const secretAccessKey =
      s?.r2SecretAccessKey || this.config.get<string>('R2_SECRET_ACCESS_KEY') || '';
    const bucket = s?.r2Bucket || this.config.get<string>('R2_BUCKET') || '';

    const r2: R2Config | null =
      accountId && accessKeyId && secretAccessKey && bucket
        ? { accountId, accessKeyId, secretAccessKey, bucket }
        : null;

    // Driver from settings, but fall back to local if R2 isn't fully configured.
    const requested = (s?.storageDriver as 'local' | 'r2') ?? 'local';
    const driver: 'local' | 'r2' = requested === 'r2' && r2 ? 'r2' : 'local';
    return { driver, r2 };
  }

  private r2Client(r2: R2Config): S3Client {
    return new S3Client({
      region: 'auto',
      endpoint: `https://${r2.accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: r2.accessKeyId, secretAccessKey: r2.secretAccessKey },
    });
  }

  async putObject(buffer: Buffer, originalName: string): Promise<{ key: string }> {
    const key = `${uuidv4()}${extname(originalName)}`;
    const cfg = await this.resolveConfig();

    if (cfg.driver === 'r2' && cfg.r2) {
      await this.r2Client(cfg.r2).send(
        new PutObjectCommand({ Bucket: cfg.r2.bucket, Key: key, Body: buffer }),
      );
    } else {
      await writeFile(join(this.uploadsDir, key), buffer);
    }
    return { key };
  }

  async getObjectStream(key: string): Promise<Readable> {
    // Prefer a local copy if it exists (handles files saved before switching
    // to R2); otherwise stream from R2.
    const localPath = join(this.uploadsDir, key);
    if (existsSync(localPath)) {
      return createReadStream(localPath);
    }
    const cfg = await this.resolveConfig();
    if (cfg.r2) {
      const res = await this.r2Client(cfg.r2)
        .send(new GetObjectCommand({ Bucket: cfg.r2.bucket, Key: key }))
        .catch((error: unknown) => {
          if (this.isObjectMissing(error)) {
            throw new NotFoundException('File not found in storage');
          }
          throw error;
        });
      if (!res.Body) {
        throw new NotFoundException('File not found in storage');
      }
      return res.Body as Readable;
    }
    throw new NotFoundException('File not found in storage');
  }

  async deleteObject(key: string): Promise<void> {
    const localPath = join(this.uploadsDir, key);
    if (existsSync(localPath)) {
      await unlink(localPath).catch(() => undefined);
    }
    const cfg = await this.resolveConfig();
    if (cfg.r2) {
      await this.r2Client(cfg.r2)
        .send(new DeleteObjectCommand({ Bucket: cfg.r2.bucket, Key: key }))
        .catch(() => undefined);
    }
  }

  private isObjectMissing(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) return false;
    const named = error as {
      name?: string;
      Code?: string;
      $metadata?: { httpStatusCode?: number };
    };
    return (
      named.name === 'NoSuchKey' ||
      named.name === 'NotFound' ||
      named.Code === 'NoSuchKey' ||
      named.$metadata?.httpStatusCode === 404
    );
  }
}
