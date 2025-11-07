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
}

