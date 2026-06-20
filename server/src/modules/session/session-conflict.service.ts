import { ConflictException, Injectable } from '@nestjs/common';
import { SessionRepository } from './session.repository';

export interface ConflictCheck {
  teacherId: string;
  start: Date;
  end: Date;
  assistantIds: string[];
  excludeId?: string;
}

/**
 * Enforces the scheduling invariants from the product spec:
 *   - A teacher cannot teach two sessions at the same time.
 *   - An assistant cannot be assigned to overlapping sessions.
 * Validation always runs before a write.
 */
@Injectable()
export class SessionConflictService {
  constructor(private readonly repo: SessionRepository) {}

  async assertNoConflicts(check: ConflictCheck): Promise<void> {
    const { teacherId, start, end, assistantIds, excludeId } = check;

    if (end <= start) {
      throw new ConflictException('End time must be after start time');
    }

    const teacherOverlaps = await this.repo.findTeacherOverlaps(teacherId, start, end, excludeId);
    if (teacherOverlaps.length > 0) {
      throw new ConflictException('Teacher already has a session in this time slot');
    }

    if (assistantIds.length > 0) {
      const assistantOverlaps = await this.repo.findAssistantOverlaps(
        assistantIds,
        start,
        end,
        excludeId,
      );
      if (assistantOverlaps.length > 0) {
        throw new ConflictException('An assistant is already assigned to an overlapping session');
      }
    }
  }

  /**
   * Validates a batch of proposed slots against existing data AND against
   * each other (so a bulk request can't internally conflict).
   */
  async assertNoConflictsBatch(
    teacherId: string,
    slots: Array<{ start: Date; end: Date }>,
    assistantIds: string[],
  ): Promise<void> {
    // Internal overlap check within the batch.
    const sorted = [...slots].sort((a, b) => a.start.getTime() - b.start.getTime());
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].start < sorted[i - 1].end) {
        throw new ConflictException('Generated sessions overlap each other');
      }
    }

    // Each slot vs existing sessions.
    for (const slot of slots) {
      await this.assertNoConflicts({
        teacherId,
        start: slot.start,
        end: slot.end,
        assistantIds,
      });
    }
  }
}
