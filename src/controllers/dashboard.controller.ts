import { Response } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { AuthenticatedRequest } from '../types';

const dashboardService = new DashboardService();

export class DashboardController {
  async getDashboard(req: AuthenticatedRequest, res: Response) {
    try {
      // Get user_id from query parameter or from authenticated user
      const userId = (req.query.user_id as string) || req.userId;
      
      if (!userId) {
        return res.status(400).json({ 
          success: false,
          message: 'user_id is required' 
        });
      }
      
      console.log('Fetching dashboard data for user:', userId);
      
      const dashboardData = await dashboardService.getDashboardData(userId);
      
      return res.status(200).json({
        success: true,
        ...dashboardData
      });
    } catch (error: any) {
      console.error('Get dashboard error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      // Handle Prisma-specific errors
      if (error.code === 'P2025') {
        return res.status(404).json({ 
          success: false,
          message: 'User not found' 
        });
      }
      
      if (error.code === 'P1001' || error.code === 'P1017') {
        return res.status(503).json({ 
          success: false,
          message: 'Database connection error'
        });
      }
      
      if (error.message === 'User not found') {
        return res.status(404).json({ 
          success: false,
          message: 'User not found' 
        });
      }
      
      return res.status(500).json({ 
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

