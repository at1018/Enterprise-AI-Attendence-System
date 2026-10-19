import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Query all users
  const users = await prisma.user.findMany({
    include: {
      tenant: true
    },
    orderBy: { createdAt: 'desc' }
  });

  console.log('=== Registered Users ===');
  console.log(JSON.stringify(users, null, 2));
  console.log(`\nTotal users: ${users.length}`);

  // Query all tenants
  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: 'desc' }
  });

  console.log('\n=== Tenants ===');
  console.log(JSON.stringify(tenants, null, 2));
  console.log(`\nTotal tenants: ${tenants.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
