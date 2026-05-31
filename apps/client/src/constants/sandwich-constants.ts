/*
 * CLIENT-ONLY sandwich constants: cache TTL, image path, empty-builder seed and
 * the pending-auth localStorage key. Shared validation limits (MAX_NAME_LENGTH,
 * MAX_COMMENT_LENGTH, MAX_COMMENT_LINES, MAX_INGREDIENTS_COUNT) live in
 * @sandwicheck/shared — import them from there directly.
 */
import type { BuilderSandwich } from '@/types/domain';

export const SANDWICH_IMAGES_PATH = 'uploads/sandwiches/';

export const SANDWICH_CACHE_TIME_OUT_DAYS = 7;

export const EMPTY_SANDWICH: BuilderSandwich = {
  name: '',
  ingredients: [],
  comment: '',
};

export const PENDING_SANDWICH_LOCALSTORAGE_KEY = 'sandwich-pending-auth';
