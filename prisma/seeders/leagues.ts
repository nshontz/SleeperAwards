import { PrismaClient } from '../../src/generated/prisma';

const prisma = new PrismaClient();

export async function seedLeagues() {
  console.log('🏆 Seeding leagues...');

  const leagues = [
    {
      sleeperLeagueId: '1262129908398694400',
      name: 'Bine to Shrine Fantasy League 2024',
      description: 'Yakima Chief Hops Fantasy League - 2024 Season',
    },
    {
      sleeperLeagueId: '1263887047232331776',
      name: 'Sandbox League 2025',
      description: 'Sandbox - 2025 Season',
    },
  ];

  const createdLeagues = [];

  for (const leagueData of leagues) {
    const league = await prisma.league.upsert({
      where: { sleeperLeagueId: leagueData.sleeperLeagueId },
      update: {
        name: leagueData.name,
        description: leagueData.description,
      },
      create: {
        name: leagueData.name,
        description: leagueData.description,
        sleeperLeagueId: leagueData.sleeperLeagueId,
      },
    });

    createdLeagues.push(league);
    console.log(`✅ Created/Updated league: ${league.name} (ID: ${league.sleeperLeagueId})`);
  }

  console.log(`🎉 Successfully seeded ${createdLeagues.length} leagues\n`);
  return createdLeagues;
}

// Allow running this seeder individually
if (require.main === module) {
  seedLeagues()
    .catch((e) => {
      console.error('❌ Error seeding leagues:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}