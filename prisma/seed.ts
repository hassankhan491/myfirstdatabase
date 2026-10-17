import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Create Roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: { name: 'Admin', description: 'Full system access' },
  });
  
  const managerRole = await prisma.role.upsert({
    where: { name: 'Manager' },
    update: {},
    create: { name: 'Manager', description: 'Manage orders, products, and inventory' },
  });

  const accountantRole = await prisma.role.upsert({
    where: { name: 'Accountant' },
    update: {},
    create: { name: 'Accountant', description: 'View finance and reports' },
  });

  const viewerRole = await prisma.role.upsert({
    where: { name: 'Viewer' },
    update: {},
    create: { name: 'Viewer', description: 'Read-only access' },
  });

  // 2. Create a Default Client
  const clientName = 'Shariq Enterprises';
  let client = await prisma.client.findFirst({ where: { name: clientName } });
  if (!client) {
    client = await prisma.client.create({ data: { name: clientName } });
    console.log(`Created client: ${clientName}`);
  }

  // 3. Create Admin User
  const adminEmail = 'admin@shariq.com';
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  let adminUser = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'System Admin',
        password: hashedPassword,
        clientId: client.id,
        roleId: adminRole.id,
      },
    });
    console.log(`Created admin user: ${adminEmail}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });