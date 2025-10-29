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
      const { email, username, is_active } = req.body;
      
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id }
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
      
      // Update user
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          email: email || undefined,
          username: username || undefined,
          is_active: is_active !== undefined ? is_active : undefined
        } as any,
        select: {
          id: true,
          username: true,
          email: true,
          created_at: true,
          updated_at: true,
          is_active: true
        } as any
      });
      
      return res.status(200).json({
        message: 'User updated successfully',
        data: updatedUser
      });
    } catch (error) {
      console.error('Update user error:', error);
      return res.status(500).json({ message: 'Internal server error' });
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
