import { Request, Response } from 'express';
import { DepartmentService } from '../services/department.service';

const departmentService = new DepartmentService();

export class DepartmentController {
  async create(req: Request, res: Response) {
    try {
      const result = await departmentService.create(req.body);
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    const departments = await departmentService.getAll();
    return res.json(departments);
  }

  async getById(req: Request, res: Response) {
    const id = Number(req.params.id);
    const department = await departmentService.getById(id);
    return res.json(department);
  }

  async update(req: Request, res: Response) {
    const id = Number(req.params.id);

    try {
      const updated = await departmentService.update(id, req.body);
      return res.json(updated);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    const id = Number(req.params.id);

    try {
      await departmentService.delete(id);
      return res.json({ message: "Department deleted successfully" });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}
