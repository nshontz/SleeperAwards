import { NextResponse } from 'next/server';
import { PrismaClient } from '../generated/prisma';
import { SLEEPER_API, HTTP_STATUS } from '@/constants/api';

// Common Prisma client instance
export const prisma = new PrismaClient();

// Standard API error responses
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number = HTTP_STATUS.INTERNAL_SERVER_ERROR
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Common error handler for API routes
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      { error: error.message },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }

  return NextResponse.json(
    { error: 'An unexpected error occurred' },
    { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
  );
}

// Common success response
export function createSuccessResponse<T>(data: T): NextResponse {
  return NextResponse.json({
    success: true,
    data
  });
}

// Sleeper API utility functions
export class SleeperApi {
  static async fetchLeague(leagueId: string) {
    const response = await fetch(SLEEPER_API.LEAGUE(leagueId));
    if (!response.ok) {
      throw new ApiError('League not found on Sleeper', HTTP_STATUS.NOT_FOUND);
    }
    return response.json();
  }

  static async fetchRosters(leagueId: string) {
    const response = await fetch(SLEEPER_API.ROSTERS(leagueId));
    if (!response.ok) {
      throw new ApiError('Failed to fetch league rosters', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
    return response.json();
  }

  static async fetchUsers(leagueId: string) {
    const response = await fetch(SLEEPER_API.USERS(leagueId));
    if (!response.ok) {
      throw new ApiError('Failed to fetch league users', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
    return response.json();
  }
}

// Database cleanup utility
export async function withPrismaCleanup<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    return await operation();
  } finally {
    await prisma.$disconnect();
  }
}

// Validation utilities
export function validateRequired(
  data: Record<string, unknown>,
  requiredFields: string[]
): void {
  const missingFields = requiredFields.filter(field => !data[field]);
  if (missingFields.length > 0) {
    throw new ApiError(
      `Missing required fields: ${missingFields.join(', ')}`,
      HTTP_STATUS.BAD_REQUEST
    );
  }
}

// Auth check wrapper
export function requireAuth<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      // Auth check can be added here if needed
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}