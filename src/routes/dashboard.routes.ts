import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const dashboardController = new DashboardController();

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Get dashboard data for a user
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID to get dashboard data (optional - uses authenticated user if not provided)
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 dashboardData:
 *                   type: object
 *                   properties:
 *                     totalProjects:
 *                       type: integer
 *                     totalTasks:
 *                       type: integer
 *                     completedTasks:
 *                       type: integer
 *                     inProgressTasks:
 *                       type: integer
 *                     overdueTasks:
 *                       type: integer
 *                 projects:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       completion:
 *                         type: integer
 *                       teamSize:
 *                         type: integer
 *                       dueDate:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [on-track, at-risk, completed]
 *                       tasksCompleted:
 *                         type: integer
 *                       totalTasks:
 *                         type: integer
 *                 todoTasks:
 *                   type: array
 *                   items:
 *                     type: object
 *                 inProgressTasks:
 *                   type: array
 *                   items:
 *                     type: object
 *                 doneTasks:
 *                   type: array
 *                   items:
 *                     type: object
 *                 activities:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Bad request - user_id is required
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticate, dashboardController.getDashboard);

export default router;

