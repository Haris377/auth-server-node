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
        return res.status(400).json({ message: 'user_id is required' });
      }
      
      const dashboardData = await dashboardService.getDashboardData(userId);
      
      return res.status(200).json({
        success: true,
        ...dashboardData
      });
    } catch (error: any) {
      console.error('Get dashboard error:', error);
      
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

