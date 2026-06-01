import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merges class names using clsx and tailwind-merge. */
export const cn = (...classes: ClassValue[]): string => {
  return twMerge(clsx(classes));
};
