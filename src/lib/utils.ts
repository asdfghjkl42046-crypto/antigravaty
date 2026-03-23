import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Tailwind 類合建工具 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
