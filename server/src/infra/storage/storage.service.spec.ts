import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let uploadsDir: string;
  let originalUploadsDir: string | undefined;

  beforeEach(() => {
    originalUploadsDir = process.env.UPLOADS_DIR;
    uploadsDir = mkdtempSync(join(tmpdir(), 'schedule-teacher-storage-'));
    process.env.UPLOADS_DIR = uploadsDir;
  });

  afterEach(() => {
    if (originalUploadsDir === undefined) {
      delete process.env.UPLOADS_DIR;
    } else {
      process.env.UPLOADS_DIR = originalUploadsDir;
    }
    rmSync(uploadsDir, { recursive: true, force: true });
  });

  it('returns 404-safe errors when a local object is missing', async () => {
    const prisma = {
      systemSetting: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    };
    const storage = new StorageService(new ConfigService(), prisma as never);

    await expect(storage.getObjectStream('missing-avatar.png')).rejects.toThrow(NotFoundException);
  });
});
