import { ConflictException } from '@nestjs/common';
import { SessionConflictService } from './session-conflict.service';
import { SessionRepository } from './session.repository';

describe('SessionConflictService', () => {
  let repo: jest.Mocked<Pick<SessionRepository, 'findInstructorOverlaps'>>;
  let service: SessionConflictService;

  beforeEach(() => {
    repo = { findInstructorOverlaps: jest.fn().mockResolvedValue([]) };
    service = new SessionConflictService(repo as unknown as SessionRepository);
  });

  const d = (s: string) => new Date(s);

  it('passes when there are no overlaps', async () => {
    await expect(
      service.assertNoConflicts({
        instructorId: 'i1',
        start: d('2026-07-01T10:00:00Z'),
        end: d('2026-07-01T11:00:00Z'),
      }),
    ).resolves.toBeUndefined();
  });

  it('rejects when end is not after start', async () => {
    await expect(
      service.assertNoConflicts({
        instructorId: 'i1',
        start: d('2026-07-01T11:00:00Z'),
        end: d('2026-07-01T10:00:00Z'),
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects on an instructor overlap', async () => {
    repo.findInstructorOverlaps.mockResolvedValue([
      { id: 'x', startTime: d('2026-07-01T10:30:00Z'), endTime: d('2026-07-01T11:30:00Z') },
    ]);
    await expect(
      service.assertNoConflicts({
        instructorId: 'i1',
        start: d('2026-07-01T10:00:00Z'),
        end: d('2026-07-01T11:00:00Z'),
      }),
    ).rejects.toThrow(/already has a session/);
  });

  it('detects internal overlaps within a bulk batch', async () => {
    await expect(
      service.assertNoConflictsBatch('i1', [
        { start: d('2026-07-01T10:00:00Z'), end: d('2026-07-01T11:00:00Z') },
        { start: d('2026-07-01T10:30:00Z'), end: d('2026-07-01T11:30:00Z') },
      ]),
    ).rejects.toThrow(/overlap each other/);
  });
});
