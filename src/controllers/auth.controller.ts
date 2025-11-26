import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthenticatedRequest, RegisterUserPayload } from '../types';

const authService = new AuthService();

export class AuthController {
  async logout(req: Request, res: Response) {
    // Since JWT is stateless, we don't need to do anything server-side
    // The client should remove the token from storage
    return res.status(200).json({
      message: 'Logout successful'
    });
  }
  
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
      
      const result = await authService.login({ email, password });
      
      return res.status(200).json({
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid credentials') {
        return res.status(401).json({ message: error.message });
      }
      
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const user = await authService.getProfile(req.user.id);
      
      return res.status(200).json({
        message: 'Profile retrieved successfully',
        data: user
      });
    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async register(req: AuthenticatedRequest, res: Response) {
    try {
      const payload: RegisterUserPayload = req.body;
      const { username, email, role, role_id, status, phone, department_id, location, password } = payload;
      
      if (!username || !email || !status) {
        return res.status(400).json({ 
          message: 'Username, email, and status are required' 
        });
      }
      
      // Validate that role_id is provided
      if (!role_id) {
        return res.status(400).json({ 
          message: 'role_id is required' 
        });
      }
      
      // Fetch role name by ID
      let roleName;
      try {
        const roleData = await authService.getRoleById(role_id);
        roleName = roleData.name;
      } catch (error) {
        return res.status(404).json({ 
          message: `Role with ID ${role_id} not found` 
        });
      }
      
      // Use the register method
      const user = await authService.register({
        username,
        email,
        role: roleName,
        status,
        phone,
        department_id,
        location,
        password,
        created_by: req.userId
      });
      
      return res.status(201).json({
        message: 'User registered successfully. An email has been sent to set up the password.',
        data: user
      });
    } catch (error: any) {
      if (error instanceof Error) {
        if (error.message === 'User with this email already exists') {
          return res.status(409).json({ message: error.message });
        }
        if (error.message === 'User with this username already exists') {
          return res.status(409).json({ message: error.message });
        }
        if (error.message.includes('not found')) {
          return res.status(404).json({ message: error.message });
        }
      }
      
      // Handle Prisma unique constraint errors (P2002)
      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0] || 'field';
        if (field === 'username') {
          return res.status(409).json({ message: 'Username is already taken' });
        } else if (field === 'email') {
          return res.status(409).json({ message: 'Email is already taken' });
        }
        return res.status(409).json({ message: `${field} is already taken` });
      }
      
      console.error('Registration error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async setPassword(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ 
          message: 'Email and password are required' 
        });
      }
      
      if (password.length < 6) {
        return res.status(400).json({ 
          message: 'Password must be at least 6 characters long' 
        });
      }
      
      const user = await authService.setPassword(email, password);
      
      return res.status(200).json({
        message: 'Password set successfully. You can now log in.',
        data: user
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Invalid or expired') || error.message.includes('expired')) {
          return res.status(400).json({ message: error.message });
        }
        if (error.message.includes('already been set')) {
          return res.status(400).json({ message: error.message });
        }
      }
      
      console.error('Set password error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async forgotPassword(req: Request, res: Response){
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        message: 'Email is required' 
      });
    }

    const response = await authService.forgotPassword(email);
    return res.status(200).json({
      message: 'Email send successfully!',
    });
  }
}
