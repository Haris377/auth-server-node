import { Request, Response } from 'express';
import { TaskService } from '../services/task.service';

const taskService = new TaskService();

export class TaskController {
  async getTasksByUserEmail(req: Request, res: Response) {
    try {
      const { email } = req.params;
      
      if (!email) {
        return res.status(400).json({ message: 'Email parameter is required' });
      }

      console.log('Fetching tasks for user email:', email);
      
      const tasks = await taskService.getTasksByUserEmail(email);
      
      return res.status(200).json({
        success: true,
        message: 'Tasks retrieved successfully',
        data: tasks,
        count: tasks.length
      });
    } catch (error: any) {
      console.error('Get tasks by email error:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async getTaskById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const task = await taskService.getTaskById(id);
      
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      
      return res.status(200).json({
        message: 'Task retrieved successfully',
        data: task
      });
    } catch (error: any) {
      console.error('Get task by id error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async createTask(req: Request, res: Response) {
    try {
      const { task_id, project_id, task_name, description, assigned_to, priority, status, due_date, estimated_hours, tags } = req.body;
      
      if (!task_id || !task_name) {
        return res.status(400).json({ message: 'Task ID and task name are required' });
      }
      
      const task = await taskService.createTask({
        task_id,
        project_id,
        task_name,
        description,
        assigned_to,
        priority,
        status,
        due_date: due_date ? new Date(due_date) : undefined,
        estimated_hours,
        tags
      });
      
      return res.status(201).json({
        message: 'Task created successfully',
        data: task
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(409).json({ message: 'Task with this ID already exists' });
      }
      console.error('Create task error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { task_name, description, assigned_to, priority, status, due_date, estimated_hours, actual_hours, tags, completed_at } = req.body;
      
      const updateData: any = {};
      if (task_name !== undefined) updateData.task_name = task_name;
      if (description !== undefined) updateData.description = description;
      if (assigned_to !== undefined) updateData.assigned_to = assigned_to;
      if (priority !== undefined) updateData.priority = priority;
      if (status !== undefined) updateData.status = status;
      if (due_date !== undefined) updateData.due_date = new Date(due_date);
      if (estimated_hours !== undefined) updateData.estimated_hours = estimated_hours;
      if (actual_hours !== undefined) updateData.actual_hours = actual_hours;
      if (tags !== undefined) updateData.tags = tags;
      if (completed_at !== undefined) updateData.completed_at = completed_at ? new Date(completed_at) : null;
      
      const task = await taskService.updateTask(id, updateData);
      
      return res.status(200).json({
        message: 'Task updated successfully',
        data: task
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Task not found' });
      }
      console.error('Update task error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async deleteTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      await taskService.deleteTask(id);
      
      return res.status(200).json({
        message: 'Task deleted successfully'
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Task not found' });
      }
      console.error('Delete task error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}

