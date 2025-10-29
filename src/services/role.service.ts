import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

const prisma = new PrismaClient();

export class RoleService {
  async getAllRoles() {
    return prisma.role.findMany();
  }

  async getRoleById(id: string) {
    return prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });
  }

  async createRole(name: string, description?: string) {
    return prisma.role.create({
      data: {
        name,
        description
      }
    });
  }

  async updateRole(id: string, name?: string, description?: string) {
    return prisma.role.update({
      where: { id },
      data: {
        name,
        description
      }
    });
  }

  async deleteRole(id: string) {
    return prisma.role.delete({
      where: { id }
    });
  }

  async assignPermissionToRole(roleId: string, permissionId: string) {
    return prisma.rolePermission.create({
      data: {
        role_id: roleId,
        permission_id: permissionId
      } as any
    });
  }

  async removePermissionFromRole(roleId: string, permissionId: string) {
    // Find the RolePermission record first
    const rolePermission = await prisma.rolePermission.findFirst({
      where: {
        role_id: roleId,
        permission_id: permissionId
      }
    });

    if (!rolePermission) {
      throw new Error('Role permission not found');
    }

    // Delete by id
    return prisma.rolePermission.delete({
      where: {
        id: rolePermission.id
      }
    });
  }

  async assignRoleToUser(userId: string, roleId: string) {
    return prisma.userRole.create({
      data: {
        user_id: userId,
        role_id: roleId
      } as any
    });
  }

  async removeRoleFromUser(userId: string, roleId: string) {
    // Find the UserRole record first
    const userRole = await prisma.userRole.findFirst({
      where: {
        user_id: userId,
        role_id: roleId
      }
    });

    if (!userRole) {
      throw new Error('User role not found');
    }

    // Delete by id
    return prisma.userRole.delete({
      where: {
        id: userRole.id
      }
    });
  }

  async getUserRoles(userId: string) {
    return prisma.userRole.findMany({
      where: { user_id: userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    });
  }

  async hasPermission(userId: string, permissionName: string): Promise<boolean> {
    const userRoles = await prisma.userRole.findMany({
      where: { user_id: userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    });

    for (const userRole of userRoles) {
      for (const rolePermission of userRole.role.permissions) {
        if (rolePermission.permission.name === permissionName) {
          return true;
        }
      }
    }

    return false;
  }
}
