import { Request, Response, NextFunction } from 'express';
import { hasRole } from '@webdoctruyen/shared-be';
import type { UserRole } from '@webdoctruyen/shared-be';

export function requireRole(minRole: UserRole) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    if (!hasRole(req.user.role as UserRole, minRole)) {
      res.status(403).json({ success: false, error: 'Insufficient permissions' });
      return;
    }

    next();
  };
}
