const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createManager() {
  try {
    // Find manager role
    const managerRole = await prisma.role.findUnique({
      where: { name: 'MANAGER' }
    });

    if (!managerRole) {
      console.log('Manager role not found. Running seed first...');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Admin@1234', 10);

    // Create or update manager user
    const managerUser = await prisma.user.upsert({
      where: { email: 'manager@example.com' },
      update: {
        password: hashedPassword,
        passwordSet: true
      },
      create: {
        email: 'manager@example.com',
        password: hashedPassword,
        name: 'Manager',
        firstName: 'Manager',
        lastName: 'User',
        active: true,
        passwordSet: true,
        roles: {
          create: {
            roleId: managerRole.id
          }
        }
      },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    console.log('✓ Manager user created/updated:');
    console.log(`  Email: ${managerUser.email}`);
    console.log(`  Name: ${managerUser.name}`);
    console.log(`  Password Set: ${managerUser.passwordSet}`);
    console.log(`  Roles: ${managerUser.roles.map(r => r.role.name).join(', ')}`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createManager();

