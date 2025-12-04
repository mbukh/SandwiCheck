import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names using clsx and tailwind-merge
 * @param {...import('clsx').ClassValue} classes - Class values to merge
 * @returns {string} Merged class string
 */
export const cn = (...classes) => {
  return twMerge(clsx(classes));
};
