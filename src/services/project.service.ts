import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

const prisma = new PrismaClient();

export class ProjectService {
  async getProjectById(projectId: string) {
    try {
      return await prisma.project.findUnique({
        where: { project_id: projectId },
        include: {
          tasks: {
            orderBy: {
              created_at: 'desc'
            }
          }
        }
      });
    } catch (error: any) {
      // If tasks table doesn't exist, try without include
      if (error.code === 'P2021' || error.message?.includes('does not exist')) {
        console.warn('Tasks table not found, returning project without tasks');
        return await prisma.project.findUnique({
          where: { project_id: projectId }
        });
      }
      throw error;
    }
  }

  async getAllProjects() {
    return prisma.project.findMany({
      orderBy: {
        created_at: 'desc'
      }
    });
  }

  async createProject(projectId: string, projectName: string, description?: string, status?: string) {
    return prisma.project.create({
      data: {
        project_id: projectId,
        project_name: projectName,
        description,
        status: status || 'active'
      }
    });
  }

  async updateProject(projectId: string, projectName?: string, description?: string, status?: string) {
    const updateData: any = {};
    if (projectName !== undefined) updateData.project_name = projectName;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    
    return prisma.project.update({
      where: { project_id: projectId },
      data: updateData
    });
  }

  async deleteProject(projectId: string) {
    return prisma.project.delete({
      where: { project_id: projectId }
    });
  }

  async getProjectDetails(projectId: string) {
    // Get project details
    const project = await prisma.project.findUnique({
      where: { project_id: projectId }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // Get all tasks for this project
    const tasks = await prisma.task.findMany({
      where: { project_id: projectId }
    });

    // Get unique assigned emails from tasks (filter out null values)
    const assignedEmails = [...new Set(tasks.map(t => t.assigned_to).filter((email): email is string => email !== null && email !== undefined))];

    // Get users by email (join with users table) including roles
    const users = await prisma.user.findMany({
      where: {
        email: { in: assignedEmails }
      },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    // Create a map of email to user for quick lookup
    const userMap = new Map(users.map(u => [u.email, u as any]));

    // Group tasks by assigned_to and calculate counts by status
    const memberTaskMap = new Map<string, any[]>();
    
    tasks.forEach(task => {
      if (task.assigned_to) {
        if (!memberTaskMap.has(task.assigned_to)) {
          memberTaskMap.set(task.assigned_to, []);
        }
        memberTaskMap.get(task.assigned_to)!.push(task);
      }
    });

    // Build members array with task counts
    const members = Array.from(memberTaskMap.entries()).map(([email, userTasks], index) => {
      const user = userMap.get(email);
      const taskCounts: any = {
        completed: 0,
        In_Progress: 0,
        testing: 0,
        backlog: 0,
        todo: 0
      };

      userTasks.forEach(task => {
        const status = task.status?.toLowerCase() || '';
        if (status === 'completed' || status === 'done') {
          taskCounts.completed++;
        } else if (status === 'in_progress' || status === 'in progress') {
          taskCounts.In_Progress++;
        } else if (status === 'testing' || status === 'test') {
          taskCounts.testing++;
        } else if (status === 'backlog') {
          // Only explicitly marked "backlog" tasks go here
          taskCounts.backlog++;
        } else {
          // Everything else (todo, empty, null, unrecognized) goes to todo
          taskCounts.todo++;
        }
      });

      // Get the earliest task creation date as added_at
      const addedAt = userTasks.length > 0 
        ? userTasks.reduce((earliest, task) => 
            !earliest || task.created_at < earliest ? task.created_at : earliest, 
            null as Date | null
          )
        : new Date();

      return {
        id: index + 1,
        name: user?.username || email.split('@')[0],
        project_id: projectId,
        member_email: email,
        role: user?.roles && user.roles.length > 0 ? user.roles[0].role.name : 'Member',
        added_at: addedAt?.toISOString() || new Date().toISOString(),
        task_counts: taskCounts
      };
    });

    // Calculate total task counts
    const todoCount = tasks.filter(t => {
      const status = t.status?.toLowerCase() || '';
      return !t.status || 
             status === 'todo' || 
             status === 'backlog' || 
             status === '' ||
             (status !== 'completed' && 
              status !== 'done' && 
              status !== 'in_progress' && 
              status !== 'in progress' && 
              status !== 'testing' && 
              status !== 'test' && 
              status !== 'blocked');
    }).length;

    const inProgressCount = tasks.filter(t => {
      const status = t.status?.toLowerCase() || '';
      return status === 'in_progress' || status === 'in progress';
    }).length;

    const completedCount = tasks.filter(t => {
      const status = t.status?.toLowerCase() || '';
      return status === 'completed' || status === 'done';
    }).length;

    const blockedCount = tasks.filter(t => {
      const status = t.status?.toLowerCase() || '';
      return status === 'blocked';
    }).length;

    const overdueCount = tasks.filter(t => {
      if (!t.due_date) return false;
      const status = t.status?.toLowerCase() || '';
      return new Date(t.due_date) < new Date() && 
             status !== 'completed' && 
             status !== 'done';
    }).length;

    const totalTasksCounts = {
      total: tasks.length.toString(),
      todo: todoCount.toString(),
      in_progress: inProgressCount.toString(),
      completed: completedCount.toString(),
      blocked: blockedCount.toString(),
      overdue: overdueCount.toString()
    };

    // Calculate hours
    const estimatedHours = tasks.reduce((sum, task) => 
      sum + (task.estimated_hours ? Number(task.estimated_hours) : 0), 0
    );
    const actualHours = tasks.reduce((sum, task) => 
      sum + (task.actual_hours ? Number(task.actual_hours) : 0), 0
    );
    const remainingHours = estimatedHours - actualHours;

    const hours = {
      estimated: estimatedHours.toString(),
      actual: actualHours.toString(),
      remaining: remainingHours
    };

    // Get most recent task activity (or you can create a separate activity table)
    const recentTask = tasks
      .filter(t => t.completed_at || t.updated_at)
      .sort((a, b) => {
        const dateA = a.completed_at || a.updated_at;
        const dateB = b.completed_at || b.updated_at;
        return dateB.getTime() - dateA.getTime();
      })[0];

    const recent_activity = recentTask ? {
      id: 1,
      activity_id: `act-${recentTask.id}`,
      project_id: projectId,
      task_id: recentTask.task_id,
      activity_type: recentTask.completed_at ? 'task_completed' : 'task_updated',
      description: recentTask.completed_at 
        ? `Completed ${recentTask.task_name}`
        : `Updated ${recentTask.task_name}`,
      user_email: recentTask.assigned_to || '',
      created_at: (recentTask.completed_at || recentTask.updated_at).toISOString()
    } : {
      id: 0,
      activity_id: 'none',
      project_id: projectId,
      task_id: '',
      activity_type: 'no_activity',
      description: 'No recent activity',
      user_email: '',
      created_at: new Date().toISOString()
    };

    // Format project data
    const projectData = {
      project_id: project.project_id,
      project_name: project.project_name,
      description: project.description || '',
      start_date: project.start_date?.toISOString() || null,
      end_date: project.end_date?.toISOString() || null,
      priority: project.priority || '',
      status: project.status || '',
      budget: project.budget ? project.budget.toString() : null,
      client_name: project.client_name || '',
      project_manager: project.project_manager || '',
      completion_percentage: project.completion_percentage || 0,
      created_at: project.created_at.toISOString(),
      updated_at: project.updated_at.toISOString(),
      health_score: project.completion_percentage || 0, // You can calculate this based on your logic
      project_status: project.status || 'Active',
      members: members
    };

    return {
      success: true,
      project: projectData,
      totaltasksCounts: totalTasksCounts,
      hours: hours,
      files: {
        total_files: "0", // You can add a files table later
        total_size_bytes: "0",
        total_size_mb: 0
      },
      recent_activity: recent_activity
    };
  }
}

