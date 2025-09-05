import { PrismaClient } from '../src/generated/prisma';
import { seedLeagues } from './seeders/leagues';
import { seedUsers } from './seeders/users';
import { seedTeams } from './seeders/teams';
import { seedAwardTypes } from './seeders/award-types';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Seed in order: award types → leagues → users → teams
    await seedAwardTypes();
    await seedLeagues();
    await seedUsers();
    await seedTeams();

    console.log('🎉 All seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });