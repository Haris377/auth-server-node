import { PrismaClient, Department } from '@prisma/client';

export class DepartmentService {
  private prisma = new PrismaClient();

  async create(data: { name: string; description?: string }) {
    return await this.prisma.department.create({
      data,
    });
  }

  async getAll() {
    return await this.prisma.department.findMany();
  }

  async getById(id: number) {
    return await this.prisma.department.findUnique({
      where: { id },
    });
  }

  async update(id: number, data: { name?: string; description?: string }) {
    return await this.prisma.department.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return await this.prisma.department.delete({
      where: { id },
    });
  }
}
