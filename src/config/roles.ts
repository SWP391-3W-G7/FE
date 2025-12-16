export const ROLES = {
  STUDENT: 'STUDENT',
  STAFF: 'STAFF',       
  SECURITY: 'SECURITY',
  ADMIN: 'ADMIN',
} as const;

export type RoleType = typeof ROLES[keyof typeof ROLES];