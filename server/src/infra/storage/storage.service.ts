import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { Readable } from 'stream';

@Injectable()
export class StorageService {
  private readonly s3Client: S3Client | null = null;
  private readonly bucketName: string;
  private readonly logger = new Logger(StorageService.name);

  constructor(private configService: ConfigService) {
    const accountId = this.configService.get<string>('R2_ACCOUNT_ID');
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('R2_SECRET_ACCESS_KEY');

    this.bucketName = this.configService.get<string>('R2_BUCKET') || '';

    if (accountId && accessKeyId && secretAccessKey) {
      this.s3Client = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
      this.logger.log('S3 Storage Client initialized for Cloudflare R2.');
    } else {
      this.logger.warn('R2 Storage credentials are not fully configured. File uploads will fail.');
    }
  }

  async putObject(buffer: Buffer, originalname: string): Promise<{ key: string }> {
    const extension = originalname.split('.').pop() || 'bin';
    const key = `${uuidv4()}.${extension}`;

    if (!this.s3Client) {
      throw new Error('Storage service is not configured');
    }

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
    });

    await this.s3Client.send(command);
    return { key };
  }

  async deleteObject(key: string): Promise<void> {
    if (!this.s3Client) return;

    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.s3Client.send(command);
  }

  async getObjectStream(key: string): Promise<Readable> {
    if (!this.s3Client) {
      throw new Error('Storage service is not configured');
    }

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    const response = await this.s3Client.send(command);
    return response.Body as Readable;
  }
}
