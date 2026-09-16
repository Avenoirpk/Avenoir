type ClassValue = string | number | null | boolean | undefined | ClassValue[];

function toVal(mix: ClassValue): string {
  if (typeof mix === "string" || typeof mix === "number") return String(mix);
  if (Array.isArray(mix)) return mix.map(toVal).filter(Boolean).join(" ");
  return "";
}

/**
 * Lightweight className combiner (no extra deps).
 * Joins truthy string/array class values with a single space.
 */
export function cn(...inputs: ClassValue[]): string {
  return inputs.map(toVal).filter(Boolean).join(" ");
}
