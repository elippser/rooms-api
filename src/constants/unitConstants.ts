export const UNIT_STATUSES = [
  "available",
  "occupied",
  "cleaning",
  "maintenance",
  "blocked",
  "checkout-pending",
] as const;

export type UnitStatus = (typeof UNIT_STATUSES)[number];

/**
 * Matriz de transiciones de estado válidas.
 * Key = estado actual. Value = array de estados a los que puede pasar.
 */
export const VALID_TRANSITIONS: Record<UnitStatus, UnitStatus[]> = {
  available: ["occupied", "cleaning", "maintenance", "blocked"],
  occupied: ["checkout-pending"],
  "checkout-pending": ["available", "cleaning", "maintenance", "blocked"],
  cleaning: ["available", "maintenance", "blocked"],
  maintenance: ["available", "cleaning", "blocked"],
  blocked: ["available", "occupied", "cleaning", "maintenance"],
};

export const isValidTransition = (
  from: UnitStatus,
  to: UnitStatus
): boolean => {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
};
