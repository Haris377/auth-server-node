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

  async register(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
      
      const user = await authService.register({
        email,
        password,
        firstName,
        lastName
      });
      
      return res.status(201).json({
        message: 'User registered successfully',
        data: user
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'User with this email already exists') {
        return res.status(409).json({ message: error.message });
      }
      
      console.error('Registration error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
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

  async registerUser(req: Request, res: Response) {
    try {
      const payload: RegisterUserPayload = req.body;
      const { username, name, email, role, role_id, status, phone, department, location } = payload;
      
      // Support both 'name' and 'username' fields
      const userName = username || name;
      
      if (!userName || !email || !status) {
        return res.status(400).json({ 
          message: 'Username/name, email, and status are required' 
        });
      }
      
      // Validate that either role_id or role is provided
      if (!role_id && !role) {
        return res.status(400).json({ 
          message: 'role_id or role is required' 
        });
      }
      
      // If role_id is provided, fetch role name by ID, otherwise use role name directly
      let roleName = role;
      if (role_id) {
        try {
          const roleData = await authService.getRoleById(role_id);
          roleName = roleData.name;
        } catch (error) {
          return res.status(404).json({ 
            message: `Role with ID ${role_id} not found` 
          });
        }
      }
      
      if (!roleName && !role_id) {
        return res.status(400).json({ 
          message: 'Valid role_id or role name is required' 
        });
      }
      
      const user = await authService.registerUser({
        username: userName,
        email,
        role: roleName!,
        status,
        phone,
        department,
        location
      });
      
      return res.status(201).json({
        message: 'User registered successfully. An email has been sent to set up the password.',
        data: user
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'User with this email already exists') {
          return res.status(409).json({ message: error.message });
        }
        if (error.message.includes('not found')) {
          return res.status(404).json({ message: error.message });
        }
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
}
