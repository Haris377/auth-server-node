import { Request, Response } from 'express';
import { RoleService } from '../services/role.service';
import { AuthenticatedRequest } from '../types';

const roleService = new RoleService();

export class RoleController {
  async getAllRoles(req: Request, res: Response) {
    try {
      const roles = await roleService.getAllRoles();
      
      return res.status(200).json({
        message: 'Roles retrieved successfully',
        data: roles
      });
    } catch (error) {
      console.error('Get all roles error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getRoleById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const role = await roleService.getRoleById(id);
      
      if (!role) {
        return res.status(404).json({ message: 'Role not found' });
      }
      
      return res.status(200).json({
        message: 'Role retrieved successfully',
        data: role
      });
    } catch (error) {
      console.error('Get role by id error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async createRole(req: Request, res: Response) {
    try {
      const { name, description } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: 'Role name is required' });
      }
      
      const role = await roleService.createRole(name, description);
      
      return res.status(201).json({
        message: 'Role created successfully',
        data: role
      });
    } catch (error) {
      console.error('Create role error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      
      const role = await roleService.updateRole(id, name, description);
      
      return res.status(200).json({
        message: 'Role updated successfully',
        data: role
      });
    } catch (error) {
      console.error('Update role error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async deleteRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      await roleService.deleteRole(id);
      
      return res.status(200).json({
        message: 'Role deleted successfully'
      });
    } catch (error) {
      console.error('Delete role error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async assignPermissionToRole(req: Request, res: Response) {
    try {
      const { roleId, permissionId } = req.body;
      
      if (!roleId || !permissionId) {
        return res.status(400).json({ message: 'Role ID and Permission ID are required' });
      }
      
      const rolePermission = await roleService.assignPermissionToRole(roleId, permissionId);
      
      return res.status(201).json({
        message: 'Permission assigned to role successfully',
        data: rolePermission
      });
    } catch (error) {
      console.error('Assign permission to role error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async removePermissionFromRole(req: Request, res: Response) {
    try {
      const { roleId, permissionId } = req.params;
      
      await roleService.removePermissionFromRole(roleId, permissionId);
      
      return res.status(200).json({
        message: 'Permission removed from role successfully'
      });
    } catch (error) {
      console.error('Remove permission from role error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async assignRoleToUser(req: Request, res: Response) {
    try {
      const { userId, roleId } = req.body;
      
      if (!userId || !roleId) {
        return res.status(400).json({ message: 'User ID and Role ID are required' });
      }
      
      const userRole = await roleService.assignRoleToUser(userId, roleId);
      
      return res.status(201).json({
        message: 'Role assigned to user successfully',
        data: userRole
      });
    } catch (error) {
      console.error('Assign role to user error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async removeRoleFromUser(req: Request, res: Response) {
    try {
      const { userId, roleId } = req.params;
      
      await roleService.removeRoleFromUser(userId, roleId);
      
      return res.status(200).json({
        message: 'Role removed from user successfully'
      });
    } catch (error) {
      console.error('Remove role from user error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getUserRoles(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const userRoles = await roleService.getUserRoles(req.user.id);
      
      return res.status(200).json({
        message: 'User roles retrieved successfully',
        data: userRoles
      });
    } catch (error) {
      console.error('Get user roles error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}
