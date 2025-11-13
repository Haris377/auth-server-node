import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const taskController = new TaskController();

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the task
 *         task_id:
 *           type: string
 *           description: Unique task identifier
 *         project_id:
 *           type: string
 *           description: ID of the project this task belongs to
 *         task_name:
 *           type: string
 *           description: Task name
 *         description:
 *           type: string
 *           description: Task description
 *         assigned_to:
 *           type: string
 *           format: email
 *           description: Email of the user assigned to this task
 *         priority:
 *           type: string
 *           description: Task priority (e.g., low, medium, high)
 *         status:
 *           type: string
 *           description: Task status (e.g., todo, in_progress, completed)
 *         due_date:
 *           type: string
 *           format: date
 *           description: Task due date
 *         estimated_hours:
 *           type: number
 *           description: Estimated hours to complete the task
 *         actual_hours:
 *           type: number
 *           description: Actual hours spent on the task
 *         tags:
 *           type: string
 *           description: Task tags
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: When the task was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: When the task was last updated
 *         completed_at:
 *           type: string
 *           format: date-time
 *           description: When the task was completed
 */

/**
 * @swagger
 * /api/tasks/user/{email}:
 *   get:
 *     summary: Get all tasks assigned to a user by email
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: User email address
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *                 count:
 *                   type: integer
 *       400:
 *         description: Bad request - email parameter missing
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/user/:email', authenticate, taskController.getTasksByUserEmail);

/**
 * @swagger
 * /api/tasks/get-tasks:
 *   get:
 *     summary: Get all tasks with detailed statistics (optionally filtered by project)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: project_id
 *         required: false
 *         schema:
 *           type: string
 *         description: Optional project ID to filter tasks
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 project_id:
 *                   type: string
 *                 summary:
 *                   type: object
 *                   properties:
 *                     total_tasks:
 *                       type: integer
 *                     completed_tasks:
 *                       type: integer
 *                     overdue_tasks:
 *                       type: integer
 *                     high_priority_tasks:
 *                       type: integer
 *                     total_estimated_hours:
 *                       type: number
 *                     total_actual_hours:
 *                       type: number
 *                 tasks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *       400:
 *         description: Bad request - project_id parameter missing
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/get-tasks', authenticate, taskController.getAllTasks);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task retrieved successfully
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authenticate, taskController.getTaskById);

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - task_id
 *               - task_name
 *             properties:
 *               task_id:
 *                 type: string
 *               project_id:
 *                 type: string
 *               task_name:
 *                 type: string
 *               description:
 *                 type: string
 *               assigned_to:
 *                 type: string
 *                 format: email
 *               priority:
 *                 type: string
 *               status:
 *                 type: string
 *               due_date:
 *                 type: string
 *                 format: date
 *               estimated_hours:
 *                 type: number
 *               tags:
 *                 type: string
 *     responses:
 *       201:
 *         description: Task created successfully
 *       409:
 *         description: Task ID already exists
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticate, taskController.createTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               task_name:
 *                 type: string
 *               description:
 *                 type: string
 *               assigned_to:
 *                 type: string
 *                 format: email
 *               priority:
 *                 type: string
 *               status:
 *                 type: string
 *               due_date:
 *                 type: string
 *                 format: date
 *               estimated_hours:
 *                 type: number
 *               actual_hours:
 *                 type: number
 *               tags:
 *                 type: string
 *               completed_at:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authenticate, taskController.updateTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticate, taskController.deleteTask);


export default router;

