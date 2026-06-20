import { ConflictException } from '@nestjs/common';
import { SessionConflictService } from './session-conflict.service';
import { SessionRepository } from './session.repository';

describe('SessionConflictService', () => {
  let repo: jest.Mocked<Pick<SessionRepository, 'findTeacherOverlaps' | 'findAssistantOverlaps'>>;
  let service: SessionConflictService;

  beforeEach(() => {
    repo = {
      findTeacherOverlaps: jest.fn().mockResolvedValue([]),
      findAssistantOverlaps: jest.fn().mockResolvedValue([]),
    };
    service = new SessionConflictService(repo as unknown as SessionRepository);
  });

  const d = (s: string) => new Date(s);

  it('passes when there are no overlaps', async () => {
    await expect(
      service.assertNoConflicts({
        teacherId: 't1',
        start: d('2026-07-01T10:00:00Z'),
        end: d('2026-07-01T11:00:00Z'),
        assistantIds: [],
      }),
    ).resolves.toBeUndefined();
  });

  it('rejects when end is not after start', async () => {
    await expect(
      service.assertNoConflicts({
        teacherId: 't1',
        start: d('2026-07-01T11:00:00Z'),
        end: d('2026-07-01T10:00:00Z'),
        assistantIds: [],
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects on a teacher overlap', async () => {
    repo.findTeacherOverlaps.mockResolvedValue([
      { id: 'x', startTime: d('2026-07-01T10:30:00Z'), endTime: d('2026-07-01T11:30:00Z') },
    ]);
    await expect(
      service.assertNoConflicts({
        teacherId: 't1',
        start: d('2026-07-01T10:00:00Z'),
        end: d('2026-07-01T11:00:00Z'),
        assistantIds: [],
      }),
    ).rejects.toThrow(/Teacher already has a session/);
  });

  it('rejects an assistant overlap', async () => {
    repo.findAssistantOverlaps.mockResolvedValue([
      {
        id: 'x',
        startTime: d('2026-07-01T10:30:00Z'),
        endTime: d('2026-07-01T11:30:00Z'),
        assistants: [{ assistantId: 'a1' }],
      },
    ]);
    await expect(
      service.assertNoConflicts({
        teacherId: 't1',
        start: d('2026-07-01T10:00:00Z'),
        end: d('2026-07-01T11:00:00Z'),
        assistantIds: ['a1'],
      }),
    ).rejects.toThrow(/assistant/i);
  });

  it('detects internal overlaps within a bulk batch', async () => {
    await expect(
      service.assertNoConflictsBatch(
        't1',
        [
          { start: d('2026-07-01T10:00:00Z'), end: d('2026-07-01T11:00:00Z') },
          { start: d('2026-07-01T10:30:00Z'), end: d('2026-07-01T11:30:00Z') },
        ],
        [],
      ),
    ).rejects.toThrow(/overlap each other/);
  });
});
