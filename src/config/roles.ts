export const ROLES = {
  STUDENT: 'STUDENT',
  STAFF: 'STAFF',       
  SECURITY: 'SECURITY', 
} as const;

export type RoleType = keyof typeof ROLES;