export const APP_NAME = "elippser-pms-rooms";
export const API_VERSION = "v1";

export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MANAGER: "manager",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
