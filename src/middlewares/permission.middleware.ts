import { Response, NextFunction } from 'express';
import { RoleService } from '../services/role.service';
import { AuthenticatedRequest } from '../types';

const roleService = new RoleService();

export const hasPermission = (permissionName: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const hasPermission = await roleService.hasPermission(req.user.id, permissionName);

      if (!hasPermission) {
        return res.status(403).json({ 
          message: 'Forbidden: You do not have the required permission'
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};
