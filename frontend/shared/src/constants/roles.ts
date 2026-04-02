import type { UserRole } from '../types';

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  guest: 0,
  user: 1,
  moderator: 2,
  admin: 3,
  superadmin: 4,
};

export const ALL_ROLES: UserRole[] = ['guest', 'user', 'moderator', 'admin', 'superadmin'];

export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
