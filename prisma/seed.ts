import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Administrator with full access'
    }
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: {
      name: 'USER',
      description: 'Regular user with limited access'
    }
  });

  const managerRole = await prisma.role.upsert({
    where: { name: 'MANAGER' },
    update: {},
    create: {
      name: 'MANAGER',
      description: 'Manager with department access'
    }
  });

  // Create permissions
  const createUserPerm = await prisma.permission.upsert({
    where: { name: 'CREATE_USER' },
    update: {},
    create: {
      name: 'CREATE_USER',
      description: 'Can create new users'
    }
  });

  const readUserPerm = await prisma.permission.upsert({
    where: { name: 'READ_USER' },
    update: {},
    create: {
      name: 'READ_USER',
      description: 'Can view user details'
    }
  });

  const updateUserPerm = await prisma.permission.upsert({
    where: { name: 'UPDATE_USER' },
    update: {},
    create: {
      name: 'UPDATE_USER',
      description: 'Can update user details'
    }
  });

  const deleteUserPerm = await prisma.permission.upsert({
    where: { name: 'DELETE_USER' },
    update: {},
    create: {
      name: 'DELETE_USER',
      description: 'Can delete users'
    }
  });

  const manageRolesPerm = await prisma.permission.upsert({
    where: { name: 'MANAGE_ROLES' },
    update: {},
    create: {
      name: 'MANAGE_ROLES',
      description: 'Can manage roles'
    }
  });

  const managePermissionsPerm = await prisma.permission.upsert({
    where: { name: 'MANAGE_PERMISSIONS' },
    update: {},
    create: {
      name: 'MANAGE_PERMISSIONS',
      description: 'Can manage permissions'
    }
  });

  // Assign permissions to roles
  // Admin role gets all permissions
  for (const permId of [
    createUserPerm.id,
    readUserPerm.id,
    updateUserPerm.id,
    deleteUserPerm.id,
    manageRolesPerm.id,
    managePermissionsPerm.id
  ]) {
    await prisma.rolePermission.create({
      data: {
        roleId: adminRole.id,
        permissionId: permId
      }
    });
  }

  // Manager role gets some permissions
  for (const permId of [
    createUserPerm.id,
    readUserPerm.id,
    updateUserPerm.id
  ]) {
    await prisma.rolePermission.create({
      data: {
        roleId: managerRole.id,
        permissionId: permId
      }
    });
  }

  // User role gets minimal permissions
  await prisma.rolePermission.create({
    data: {
      roleId: userRole.id,
      permissionId: readUserPerm.id
    }
  });

  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User'
    }
  });

  // Assign admin role to admin user
  await prisma.userRole.create({
    data: {
      userId: adminUser.id,
      roleId: adminRole.id
    }
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
