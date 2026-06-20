import { SetMetadata } from '@nestjs/common';

export const SKIP_TRANSFORM_KEY = 'skipTransform';

/**
 * Marks a route whose response must NOT be wrapped in the standard
 * { success, data } envelope (e.g. file/stream/binary downloads).
 */
export const SkipTransform = () => SetMetadata(SKIP_TRANSFORM_KEY, true);
