import { PrismaClient } from '../../src/generated/prisma';

const prisma = new PrismaClient();

export async function seedUsers() {
  console.log('👤 Seeding users...');

  const users = [
    {
      email: 'nickshontz@gmail.com',
      name: 'Nick Shontz',
    },
  ];

  const createdUsers = [];

  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        name: userData.name,
      },
      create: {
        email: userData.email,
        name: userData.name,
      },
    });

    createdUsers.push(user);
    console.log(`✅ Created/Updated user: ${user.name} (${user.email})`);
  }

  console.log(`🎉 Successfully seeded ${createdUsers.length} users\n`);
  return createdUsers;
}

// Allow running this seeder individually
if (require.main === module) {
  seedUsers()
    .catch((e) => {
      console.error('❌ Error seeding users:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}