const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:sa123@localhost:5432/auth_db?schema=public'
    }
  }
});

async function testAuthDb() {
  try {
    console.log('Testing connection to auth_db...\n');
    
    await prisma.$connect();
    console.log('✓ Connected to auth_db database\n');
    
    // Try to query
    const userCount = await prisma.user.count();
    const roleCount = await prisma.role.count();
    
    console.log(`Users in auth_db: ${userCount}`);
    console.log(`Roles in auth_db: ${roleCount}\n`);
    
    if (roleCount === 0) {
      console.log('⚠ Database is empty. You may need to:');
      console.log('  1. Run: npm run prisma:seed');
      console.log('  2. Create manager user');
    }
    
  } catch (error) {
    console.error('✗ Connection Error:', error.message);
    
    if (error.message.includes('does not exist') || error.message.includes('auth_db')) {
      console.log('\n⚠ The database "auth_db" does not exist.');
      console.log('\nTo create it, run in PostgreSQL:');
      console.log('  CREATE DATABASE auth_db;');
      console.log('\nOr update .env to use an existing database.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testAuthDb();

