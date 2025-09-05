import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

export interface AwardConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  category?: string;
}

export class AwardsService {
  
  /**
   * Get award configurations for a specific league
   * Falls back to default names if no customization exists
   */
  async getAwardConfigsForLeague(leagueId: string): Promise<Record<string, AwardConfig>> {
    // Get all award types with their customizations for this league
    const awardTypes = await prisma.awardType.findMany({
      include: {
        customizations: {
          where: {
            leagueId,
            isActive: true
          }
        }
      }
    });

    // Build the config object
    const configs: Record<string, AwardConfig> = {};
    
    for (const awardType of awardTypes) {
      const customization = awardType.customizations[0]; // There should only be one per league
      
      configs[awardType.id] = {
        id: awardType.id,
        name: customization?.customName || awardType.name,
        description: awardType.description,
        icon: customization?.customIcon || awardType.icon,
        category: awardType.category || undefined
      };
    }

    return configs;
  }

  /**
   * Get default award configurations (without league-specific customizations)
   */
  async getDefaultAwardConfigs(): Promise<Record<string, AwardConfig>> {
    const awardTypes = await prisma.awardType.findMany();
    
    const configs: Record<string, AwardConfig> = {};
    
    for (const awardType of awardTypes) {
      configs[awardType.id] = {
        id: awardType.id,
        name: awardType.name,
        description: awardType.description,
        icon: awardType.icon,
        category: awardType.category || undefined
      };
    }

    return configs;
  }

  /**
   * Create or update a league's award customization
   */
  async customizeAwardForLeague(
    leagueId: string, 
    awardTypeId: string, 
    customName: string, 
    customIcon?: string
  ) {
    return await prisma.awardCustomization.upsert({
      where: {
        leagueId_awardTypeId: {
          leagueId,
          awardTypeId
        }
      },
      create: {
        leagueId,
        awardTypeId,
        customName,
        customIcon,
        isActive: true
      },
      update: {
        customName,
        customIcon,
        isActive: true
      }
    });
  }

  /**
   * Disable an award for a league
   */
  async disableAwardForLeague(leagueId: string, awardTypeId: string) {
    return await prisma.awardCustomization.upsert({
      where: {
        leagueId_awardTypeId: {
          leagueId,
          awardTypeId
        }
      },
      create: {
        leagueId,
        awardTypeId,
        customName: '', // Required field, but won't be used when isActive is false
        isActive: false
      },
      update: {
        isActive: false
      }
    });
  }

  /**
   * Get all customizations for a league
   */
  async getLeagueCustomizations(leagueId: string) {
    return await prisma.awardCustomization.findMany({
      where: { leagueId },
      include: {
        awardType: true
      }
    });
  }
}

export const awardsService = new AwardsService();