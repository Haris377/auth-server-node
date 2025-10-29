const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing PostgreSQL connection...\n');
    
    // Test connection
    await prisma.$connect();
    console.log('✓ Connected to PostgreSQL\n');
    
    // Check if tables exist
    const userCount = await prisma.user.count();
    const roleCount = await prisma.role.count();
    
    console.log(`Users in database: ${userCount}`);
    console.log(`Roles in database: ${roleCount}\n`);
    
    // Try to find manager user
    const managerUser = await prisma.user.findUnique({
      where: { email: 'manager@example.com' },
      include: { roles: { include: { role: true } } }
    });
    
    if (managerUser) {
      console.log('✓ Manager user found:');
      console.log(`  Email: ${managerUser.email}`);
      console.log(`  Name: ${managerUser.name || 'N/A'}`);
      console.log(`  Has Password: ${!!managerUser.password}`);
      console.log(`  Roles: ${managerUser.roles.map(r => r.role.name).join(', ')}`);
    } else {
      console.log('✗ Manager user not found');
      console.log('  You may need to seed the database or create the user.');
    }
    
  } catch (error) {
    console.error('✗ Connection Error:', error.message);
    if (error.message.includes('auth_db')) {
      console.log('\nTip: The database "auth_db" might not exist.');
      console.log('Try creating it: CREATE DATABASE auth_db;');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

