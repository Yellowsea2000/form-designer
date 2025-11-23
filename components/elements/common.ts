import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: (string | undefined | null | false)[]) => twMerge(clsx(inputs));

export const baseLabelClass =
  'block text-sm font-medium text-slate-700 mb-1 pointer-events-none';

export const baseInputClass =
  'block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-white pointer-events-none';
