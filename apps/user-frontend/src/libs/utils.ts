import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// `cn` combines Tailwind classes intelligently
export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}
