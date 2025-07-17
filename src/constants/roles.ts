export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  GUEST: 'GUEST',
  MODERATOR: 'MODERATOR',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];