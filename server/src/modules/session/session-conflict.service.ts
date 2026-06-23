import { ConflictException, Injectable } from '@nestjs/common';
import { SessionRepository } from './session.repository';

export interface ConflictCheck {
  instructorId: string;
  start: Date;
  end: Date;
  excludeId?: string;
}

/**
 * Enforces the scheduling invariant from the product spec:
 *   - The assigned instructor (teacher or assistant) cannot teach two
 *     sessions at the same time.
 * Validation always runs before a write.
 */
@Injectable()
export class SessionConflictService {
  constructor(private readonly repo: SessionRepository) {}

  async assertNoConflicts(check: ConflictCheck): Promise<void> {
    const { instructorId, start, end, excludeId } = check;

    if (end <= start) {
      throw new ConflictException('End time must be after start time');
    }

    const overlaps = await this.repo.findInstructorOverlaps(instructorId, start, end, excludeId);
    if (overlaps.length > 0) {
      throw new ConflictException(
        'The assigned instructor already has a session in this time slot',
      );
    }
  }

  /**
   * Validates a batch of proposed slots against existing data AND against
   * each other (so a bulk request can't internally conflict).
   */
  async assertNoConflictsBatch(
    instructorId: string,
    slots: Array<{ start: Date; end: Date }>,
  ): Promise<void> {
    const sorted = [...slots].sort((a, b) => a.start.getTime() - b.start.getTime());
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].start < sorted[i - 1].end) {
        throw new ConflictException('Generated sessions overlap each other');
      }
    }

    for (const slot of slots) {
      await this.assertNoConflicts({
        instructorId,
        start: slot.start,
        end: slot.end,
      });
    }
  }
}
