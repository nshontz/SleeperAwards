import { PrismaClient } from '../../src/generated/prisma';

const prisma = new PrismaClient();

const defaultAwardTypes = [
  {
    id: "fewestPointsAgainst",
    name: "The Easy Day",
    description: "Endured fewest points against",
    icon: "🛡️",
    category: "Defense"
  },
  {
    id: "mostPointsAgainst", 
    name: "That Bitter Taste",
    description: "Endured most points against",
    icon: "😤",
    category: "Defense"
  },
  {
    id: "mostPredictable",
    name: "The Noble Hop Award", 
    description: "Most predictable - closest to projections",
    icon: "🎯",
    category: "Consistency"
  },
  {
    id: "mostConsistent",
    name: "The Pilsner Prize",
    description: "Most consistent - lowest standard deviation", 
    icon: "📊",
    category: "Consistency"
  },
  {
    id: "boomOrBustPlayer",
    name: "The Bull Shoot",
    description: "Most boom or bust player",
    icon: "🎲",
    category: "Performance"
  },
  {
    id: "boomOrBustTeam",
    name: "The IPA Rollercoaster", 
    description: "Boom or bust team - greatest standard deviation",
    icon: "🎢",
    category: "Performance"
  },
  {
    id: "bestSingleGame",
    name: "The Golden Cone",
    description: "Best single game score",
    icon: "🏆",
    category: "Performance"
  },
  {
    id: "bestGameAboveProjections",
    name: "The Mosaic Masterpiece", 
    description: "Try Hard - Best game above projections",
    icon: "💪",
    category: "Performance"
  },
  {
    id: "biggestBlowout",
    name: "The Hop Bomb Award",
    description: "Biggest blowout victory",
    icon: "💥",
    category: "Performance"
  },
  {
    id: "benchOutscoredStarters",
    name: "The Dry Hop Disaster",
    description: "Bench scored more than starters", 
    icon: "🪑",
    category: "Management"
  },
  {
    id: "startersOutplayedBench",
    name: "The Perfect Brew",
    description: "Starters outplayed bench by widest margin",
    icon: "🍺",
    category: "Management"
  },
  {
    id: "highestScoringLoss",
    name: "The Centennial Curse",
    description: "Lost while scoring the most points",
    icon: "😭",
    category: "Luck"
  },
  {
    id: "mostInjuries",
    name: "The Wilted Bine Award", 
    description: "Most injuries in a week",
    icon: "🏥",
    category: "Luck"
  }
];

export async function seedAwardTypes() {
  console.log('Seeding award types...');
  
  for (const awardType of defaultAwardTypes) {
    await prisma.awardType.upsert({
      where: { id: awardType.id },
      update: awardType,
      create: awardType,
    });
  }
  
  console.log(`✅ Seeded ${defaultAwardTypes.length} award types`);
}

// Run directly if this file is executed
if (require.main === module) {
  seedAwardTypes()
    .catch((e) => {
      console.error('Error seeding award types:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}