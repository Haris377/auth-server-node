import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types';
import bcrypt from 'bcrypt';
import { hasPermission } from '../middlewares/permission.middleware';

const prisma = new PrismaClient();

export class UserController {
  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          email: true,
          created_at: true,
          updated_at: true,
          is_active: true,
          roles: {
            include: {
              role: true
            }
          }
        } as any
      });
      
      return res.status(200).json({
        message: 'Users retrieved successfully',
        data: users
      });
    } catch (error) {
      console.error('Get all users error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          username: true,
          email: true,
          created_at: true,
          updated_at: true,
          is_active: true,
          roles: {
            include: {
              role: true
            }
          }
        } as any
      });
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      return res.status(200).json({
        message: 'User retrieved successfully',
        data: user
      });
    } catch (error) {
      console.error('Get user by id error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { email, username, status, role_id } = req.body;
      
      console.log('Update user request:', { id, body: req.body });
      
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id },
        include: {
          roles: true
        }
      });
      
      if (!existingUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Check if email is already taken by another user
      if (email && email !== existingUser.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email }
        });
        
        if (emailExists) {
          return res.status(409).json({ message: 'Email is already taken' });
        }
      }
      
      // Prepare update data - only include fields that are actually provided
      const updateData: any = {};
      
      // Remove id from body if present (should only be in URL)
      const { id: bodyId, ...bodyWithoutId } = req.body;
      
      if (email !== undefined && email !== null) updateData.email = email;
      if (username !== undefined && username !== null) updateData.username = username;
      
      // Handle status field - map to is_active
      if (status !== undefined && status !== null) {
        // Map status string to boolean
        if (typeof status === 'string') {
          updateData.is_active = status.toLowerCase() === 'active';
        } else {
          updateData.is_active = status === true;
        }
      } else if (req.body.is_active !== undefined && req.body.is_active !== null) {
        updateData.is_active = req.body.is_active;
      }
      
      console.log('Update data prepared:', updateData);
      
      // Only update if there's data to update
      if (Object.keys(updateData).length === 0 && !role_id) {
        // No fields to update, just return the existing user
        const user = await prisma.user.findUnique({
          where: { id },
          include: {
            roles: {
              include: {
                role: true
              }
            }
          }
        });
        
        return res.status(200).json({
          message: 'No changes to update',
          data: user
        });
      }
      
      // Update user - try to update only fields that exist
      // First, let's try to get the current user to see what fields are available
      try {
        const updatedUser = await prisma.user.update({
          where: { id },
          data: updateData as any,
          include: {
            roles: {
              include: {
                role: true
              }
            }
          }
        });
        
        // If role update is needed, handle it after user update
        if (role_id) {
          // Check if role exists
          const role = await prisma.role.findUnique({
            where: { id: role_id }
          });
          
          if (!role) {
            return res.status(404).json({ message: 'Role not found' });
          }
          
          // Delete existing user roles
          await prisma.userRole.deleteMany({
            where: { 
              user_id: id 
            } as any
          });
          
          // Create new user role
          await prisma.userRole.create({
            data: {
              user_id: id,
              role_id: role_id
            } as any
          });
          
          // Fetch updated user with new role
          const userWithRole = await prisma.user.findUnique({
            where: { id },
            include: {
              roles: {
                include: {
                  role: true
                }
              }
            }
          });
          
          return res.status(200).json({
            message: 'User updated successfully',
            data: userWithRole
          });
        }
        
        return res.status(200).json({
          message: 'User updated successfully',
          data: updatedUser
        });
      } catch (prismaError: any) {
        // If it's a field error, try to identify which field
        if (prismaError.message && (prismaError.message.includes('Unknown argument') || prismaError.message.includes('Unknown field'))) {
          console.error('Prisma field error - unknown field detected');
          console.error('Attempted update data:', updateData);
          console.error('Prisma error:', prismaError.message);
          
          // Extract which fields are problematic from the error message
          const errorMessage = prismaError.message;
          const missingFields: string[] = [];
          
          // Check each field we tried to update
          const attemptedFields = ['username'];
          attemptedFields.forEach(field => {
            if (updateData[field] !== undefined && errorMessage.toLowerCase().includes(field.toLowerCase())) {
              missingFields.push(field);
            }
          });
          
          // Try to update without the problematic fields - start with basic fields only
          const safeUpdateData: any = {};
          if (email !== undefined && email !== null) safeUpdateData.email = email;
          if (status !== undefined && status !== null) {
            safeUpdateData.is_active = typeof status === 'string' ? status.toLowerCase() === 'active' : status === true;
          }
          
          // Try basic update first
          try {
            const basicUpdate = await prisma.user.update({
              where: { id },
              data: safeUpdateData as any,
              include: {
                roles: {
                  include: {
                    role: true
                  }
                }
              }
            });
            
            // Determine which fields failed
            const failedFields = Object.keys(updateData).filter(key => 
              key !== 'email' && key !== 'is_active' && updateData[key] !== undefined
            );
            
            return res.status(200).json({
              message: 'User partially updated (some fields may not exist in database)',
              data: basicUpdate,
              warning: 'Some fields in your request may not exist in the database schema.',
              failedFields: failedFields.length > 0 ? failedFields : [],
              solution: 'Please run: npm run prisma:generate (to regenerate Prisma client) and npm run prisma:migrate (if database columns are missing)'
            });
          } catch (basicError: any) {
            throw prismaError; // Re-throw original error
          }
        }
        throw prismaError; // Re-throw if not a field error
      }
    } catch (error: any) {
      console.error('Update user error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        meta: error.meta,
        stack: error.stack
      });
      
      // Handle Prisma-specific errors
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'User not found' });
      }
      
      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0] || 'field';
        return res.status(409).json({ 
          message: `${field} is already taken`,
          field: field
        });
      }
      
      // Handle invalid field errors
      if (error.message && (error.message.includes('Unknown argument') || error.message.includes('Unknown field'))) {
        return res.status(400).json({ 
          message: 'Invalid field in update request',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
      
      // Return detailed error in development
      return res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        code: error.code || undefined,
        details: process.env.NODE_ENV === 'development' ? {
          meta: error.meta,
          stack: error.stack?.split('\n').slice(0, 5)
        } : undefined
      });
    }
  }

  async deactivateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id }
      });
      
      if (!existingUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Deactivate user
      await prisma.user.update({
        where: { id },
        data: {
          is_active: false
        } as any
      });
      
      return res.status(200).json({
        message: 'User deactivated successfully'
      });
    } catch (error) {
      console.error('Deactivate user error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async changePassword(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current password and new password are required' });
      }
      
      // Check if current password is correct
      const user = await prisma.user.findUnique({
        where: { id: req.user.id }
      });
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      if (!user.password_hash) {
        return res.status(400).json({ message: 'No password set for this account' });
      }
      
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
      
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      // Update password
      await prisma.user.update({
        where: { id: req.user.id },
        data: {
          password_hash: hashedPassword
        } as any
      });
      
      return res.status(200).json({
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}
