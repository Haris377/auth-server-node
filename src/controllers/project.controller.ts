import { Request, Response } from 'express';
import { ProjectService } from '../services/project.service';

const projectService = new ProjectService();

export class ProjectController {
  async getProjectById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      console.log('Fetching project with ID:', id);
      
      const project = await projectService.getProjectById(id);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      return res.status(200).json({
        message: 'Project retrieved successfully',
        data: project
      });
    } catch (error: any) {
      console.error('Get project by id error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        meta: error.meta,
        stack: error.stack
      });
      
      // Handle Prisma-specific errors
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      if (error.code === 'P2002') {
        return res.status(409).json({ message: 'Duplicate entry' });
      }
      
      // Handle invalid UUID format
      if (error.message && error.message.includes('Invalid')) {
        return res.status(400).json({ 
          message: 'Invalid project ID format',
          error: error.message 
        });
      }
      
      // Handle database connection errors
      if (error.code === 'P1001' || error.code === 'P1017') {
        return res.status(503).json({ 
          message: 'Database connection error',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
      
      // Return detailed error in development, generic in production
      return res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        code: error.code || undefined
      });
    }
  }

  async getAllProjects(req: Request, res: Response) {
    try {
      const projects = await projectService.getAllProjects();
      
      return res.status(200).json({
        message: 'Projects retrieved successfully',
        data: projects
      });
    } catch (error) {
      console.error('Get all projects error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async createProject(req: Request, res: Response) {
    try {
      const { project_id, project_name, description, status } = req.body;
      
      if (!project_id) {
        return res.status(400).json({ message: 'Project ID is required' });
      }
      
      if (!project_name) {
        return res.status(400).json({ message: 'Project name is required' });
      }
      
      const project = await projectService.createProject(project_id, project_name, description, status);
      
      return res.status(201).json({
        message: 'Project created successfully',
        data: project
      });
    } catch (error) {
      console.error('Create project error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateProject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { project_name, description, status } = req.body;
      
      const project = await projectService.updateProject(id, project_name, description, status);
      
      return res.status(200).json({
        message: 'Project updated successfully',
        data: project
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Project not found' });
      }
      console.error('Update project error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async deleteProject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      await projectService.deleteProject(id);
      
      return res.status(200).json({
        message: 'Project deleted successfully'
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Project not found' });
      }
      console.error('Delete project error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getProjectDetails(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      console.log('Fetching project details for ID:', id);
      
      const projectDetails = await projectService.getProjectDetails(id);
      
      return res.status(200).json(projectDetails);
    } catch (error: any) {
      console.error('Get project details error:', error);
      
      if (error.message === 'Project not found') {
        return res.status(404).json({ 
          success: false,
          message: 'Project not found' 
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

