import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

const prisma = new PrismaClient();

export class DashboardService {
  async getDashboardData(userId: string) {
    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, username: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get projects created by user
    const projects = await prisma.project.findMany({
      where: {
        created_by: userId
      },
      include: {
        tasks: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Get all tasks created by user
    const allTasks = await prisma.task.findMany({
      where: {
        created_by: userId
      },
      include: {
        project: {
          select: {
            project_id: true,
            project_name: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Get project IDs for activity logs
    const projectIds = projects.map(p => p.project_id);
    const taskIds = allTasks.map(t => t.task_id);

    // Get activity logs related to user's projects and tasks
    const activityLogs = await (prisma as any).activityLog.findMany({
      where: {
        OR: [
          { project_id: { in: projectIds } },
          { task_id: { in: taskIds } },
          { user_email: user.email }
        ]
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 20 // Limit to recent 20 activities
    });

    // Format projects
    const formattedProjects = projects.map(project => {
      const projectTasks = allTasks.filter(t => t.project_id === project.project_id);
      const completedTasks = projectTasks.filter(t => 
        t.status?.toLowerCase() === 'completed' || 
        t.status?.toLowerCase() === 'done'
      ).length;
      const totalTasks = projectTasks.length;
      const completion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Get unique team members from tasks
      const teamEmails = [...new Set(projectTasks.map(t => t.assigned_to).filter(Boolean))];
      const teamSize = teamEmails.length;

      // Determine status based on completion and dates
      let status: 'on-track' | 'at-risk' | 'completed' = 'on-track';
      if (completion === 100) {
        status = 'completed';
      } else if (project.end_date) {
        const endDate = new Date(project.end_date);
        const today = new Date();
        const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysRemaining < 7 && completion < 80) {
          status = 'at-risk';
        }
      }

      // Format due date
      const dueDate = project.end_date 
        ? new Date(project.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : 'N/A';

      return {
        name: project.project_name,
        description: project.description || '',
        completion,
        teamSize,
        dueDate,
        status,
        tasksCompleted: completedTasks,
        totalTasks
      };
    });

    // Format tasks by status
    const todoTasks = allTasks
      .filter(task => {
        const status = task.status?.toLowerCase() || '';
        return !status || status === 'todo' || status === 'backlog' || status === '';
      })
      .map(task => this.formatTask(task, user.email))
      .slice(0, 10); // Limit to 10

    const inProgressTasks = allTasks
      .filter(task => {
        const status = task.status?.toLowerCase() || '';
        return status === 'in_progress' || status === 'in progress' || status === 'in-progress';
      })
      .map(task => this.formatTask(task, user.email))
      .slice(0, 10); // Limit to 10

    const doneTasks = allTasks
      .filter(task => {
        const status = task.status?.toLowerCase() || '';
        return status === 'completed' || status === 'done';
      })
      .map(task => this.formatTask(task, user.email))
      .slice(0, 10); // Limit to 10

    // Format activities
    const activities = activityLogs.map((log: any) => {
      // Get user info from email
      const userEmail = log.user_email || '';
      const userName = userEmail.split('@')[0];
      const initials = userName.substring(0, 2).toUpperCase();

      // Determine activity type and action
      let action = '';
      let type: 'task-complete' | 'file-upload' | 'comment' | 'user-added' = 'comment';
      
      if (log.activity_type?.toLowerCase().includes('complete')) {
        action = 'completed';
        type = 'task-complete';
      } else if (log.activity_type?.toLowerCase().includes('upload')) {
        action = 'uploaded';
        type = 'file-upload';
      } else if (log.activity_type?.toLowerCase().includes('comment')) {
        action = 'commented on';
        type = 'comment';
      } else if (log.activity_type?.toLowerCase().includes('add')) {
        action = 'added';
        type = 'user-added';
      } else {
        action = log.activity_type || 'updated';
      }

      // Format time ago
      const timeAgo = this.getTimeAgo(log.created_at);

      return {
        user: {
          name: userName.split('.').map((n: string) => n.charAt(0).toUpperCase() + n.slice(1)).join(' '),
          initials
        },
        action,
        target: log.description || log.task_id || log.project_id || 'item',
        time: timeAgo,
        type
      };
    });

    // Calculate dashboard summary stats
    const totalProjects = projects.length;
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(t => 
      t.status?.toLowerCase() === 'completed' || t.status?.toLowerCase() === 'done'
    ).length;
    const inProgressTasksCount = allTasks.filter(t => {
      const status = t.status?.toLowerCase() || '';
      return status === 'in_progress' || status === 'in progress' || status === 'in-progress';
    }).length;

    const dashboardData = {
      totalProjects,
      totalTasks,
      completedTasks,
      inProgressTasks: inProgressTasksCount,
      overdueTasks: allTasks.filter(t => {
        if (!t.due_date) return false;
        const dueDate = new Date(t.due_date);
        const today = new Date();
        const status = t.status?.toLowerCase() || '';
        return dueDate < today && status !== 'completed' && status !== 'done';
      }).length
    };

    return {
      dashboardData,
      projects: formattedProjects,
      todoTasks,
      inProgressTasks,
      doneTasks,
      activities
    };
  }

  private formatTask(task: any, userEmail: string) {
    // Get assignee info
    const assigneeEmail = task.assigned_to || userEmail;
    const assigneeName = assigneeEmail.split('@')[0];
    const assigneeInitials = assigneeName.substring(0, 2).toUpperCase();

    // Determine priority
    const priority = (task.priority?.toLowerCase() || 'medium') as 'high' | 'medium' | 'low';

    // Determine status
    const status = task.status?.toLowerCase() || 'todo';
    let taskStatus: 'todo' | 'in-progress' | 'done' = 'todo';
    if (status === 'completed' || status === 'done') {
      taskStatus = 'done';
    } else if (status === 'in_progress' || status === 'in progress' || status === 'in-progress') {
      taskStatus = 'in-progress';
    }

    return {
      title: task.task_name,
      priority,
      assignee: {
        name: assigneeName.split('.').map((n: string) => n.charAt(0).toUpperCase() + n.slice(1)).join(' '),
        initials: assigneeInitials
      },
      timeLogged: task.actual_hours ? parseFloat(task.actual_hours.toString()).toFixed(0) : '0',
      timeEstimated: task.estimated_hours ? parseFloat(task.estimated_hours.toString()).toFixed(0) : '0',
      comments: 0, // TODO: Add comments count when comments table is available
      status: taskStatus
    };
  }

  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
      const diffWeeks = Math.floor(diffDays / 7);
      return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
    }
  }
}

