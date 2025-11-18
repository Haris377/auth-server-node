import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

const prisma = new PrismaClient();

export class TaskService {
  async getTasksByUserEmail(email: string) {
    // Get all tasks assigned to this user email
    const tasks = await prisma.task.findMany({
      where: {
        assigned_to: email
      },
      include: {
        project: {
          select: {
            project_id: true,
            project_name: true,
            status: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return tasks;
  }

  async getTaskById(taskId: string) {
    return prisma.task.findUnique({
      where: { task_id: taskId },
      include: {
        project: {
          select: {
            project_id: true,
            project_name: true,
            status: true
          }
        }
      }
    });
  }

  async createTask(taskData: {
    task_id: string;
    project_id?: string;
    task_name: string;
    description?: string;
    assigned_to?: string;
    priority?: string;
    status?: string;
    due_date?: Date;
    estimated_hours?: number;
    tags?: string;
  }) {
    return prisma.task.create({
      data: taskData
    });
  }

  async updateTask(taskId: string, updateData: {
    task_name?: string;
    description?: string;
    assigned_to?: string;
    priority?: string;
    status?: string;
    due_date?: Date;
    estimated_hours?: number;
    actual_hours?: number;
    tags?: string;
    completed_at?: Date;
  }) {
    return prisma.task.update({
      where: { task_id: taskId },
      data: updateData
    });
  }

  async deleteTask(taskId: string) {
    return prisma.task.delete({
      where: { task_id: taskId }
    });
  }

  async getAllTasks(projectId?: string, userId?: string) {
    // Get all tasks, optionally filtered by project and created_by
    const where: any = {};
    if (projectId) {
      where.project_id = projectId;
    }
    if (userId) {
      where.created_by = userId;
    }
    
    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: {
          select: {
            project_id: true,
            project_name: true,
            project_manager: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Calculate additional fields for each task
    const today = new Date();
    const enhancedTasks = tasks.map(task => {
      // Calculate if task is overdue
      const dueDate = task.due_date ? new Date(task.due_date) : null;
      const isOverdue = dueDate ? dueDate < today && task.status !== 'Completed' : false;
      
      // Calculate days until due
      const daysUntilDue = dueDate ? Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;
      
      // Calculate progress percentage
      const estimatedHours = task.estimated_hours ? parseFloat(task.estimated_hours.toString()) : 0;
      const actualHours = task.actual_hours ? parseFloat(task.actual_hours.toString()) : 0;
      const progressPercentage = estimatedHours > 0 ? Math.round((actualHours / estimatedHours) * 100) : 0;
      
      // Calculate if over estimated
      const isOverEstimated = task.status === 'Completed' && actualHours > estimatedHours;
      
      // Calculate hours remaining
      const hoursRemaining = task.status === 'Completed' ? 0 : estimatedHours - actualHours;

      return {
        id: task.id,
        task_id: task.task_id,
        project_id: task.project_id,
        task_name: task.task_name,
        description: task.description,
        assigned_to: task.assigned_to,
        priority: task.priority,
        status: task.status,
        due_date: task.due_date?.toISOString(),
        estimated_hours: task.estimated_hours?.toFixed(2),
        actual_hours: task.actual_hours?.toFixed(2) || "0.00",
        tags: task.tags,
        created_at: task.created_at.toISOString(),
        updated_at: task.updated_at.toISOString(),
        completed_at: task.completed_at?.toISOString() || null,
        project_name: task.project?.project_name,
        project_manager: task.project?.project_manager,
        comment_count: "0", // You can implement this later with a comments table
        is_overdue: isOverdue,
        days_until_due: daysUntilDue,
        progress_percentage: progressPercentage,
        is_over_estimated: isOverEstimated,
        hours_remaining: hoursRemaining
      };
    });

    // Calculate summary statistics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'Completed').length;
    const overdueTasks = enhancedTasks.filter(task => task.is_overdue).length;
    const highPriorityTasks = tasks.filter(task => 
      task.priority?.toLowerCase() === 'high' || task.priority?.toLowerCase() === 'urgent'
    ).length;
    
    const totalEstimatedHours = tasks.reduce((sum, task) => 
      sum + (task.estimated_hours ? parseFloat(task.estimated_hours.toString()) : 0), 0);
    
    const totalActualHours = tasks.reduce((sum, task) => 
      sum + (task.actual_hours ? parseFloat(task.actual_hours.toString()) : 0), 0);

    return {
      success: true,
      project_id: projectId || "",
      summary: {
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        overdue_tasks: overdueTasks,
        high_priority_tasks: highPriorityTasks,
        total_estimated_hours: totalEstimatedHours,
        total_actual_hours: totalActualHours
      },
      tasks: enhancedTasks
    };
  }

  async getAssignedTasks(userId: string) {
    // Get all tasks where assigned_to matches the userId
    const tasks = await prisma.task.findMany({
      where: {
        assigned_to: userId
      },
      include: {
        project: {
          select: {
            project_id: true,
            project_name: true,
            status: true,
            project_manager: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return tasks;
  }
}

