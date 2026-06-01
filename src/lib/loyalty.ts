import { db } from './db';

export async function awardPoints(userId: string, points: number, description: string): Promise<void> {
  // Upsert loyalty points
  const existing = await db.loyaltyPoints.findUnique({ where: { userId } });

  if (existing) {
    await db.loyaltyPoints.update({
      where: { userId },
      data: {
        points: { increment: points },
        lifetime: { increment: Math.abs(points) },
      },
    });
  } else {
    await db.loyaltyPoints.create({
      data: {
        userId,
        points,
        lifetime: Math.abs(points),
      },
    });
  }

  // Create point transaction record
  await db.pointTransaction.create({
    data: {
      userId,
      points,
      type: points > 0 ? 'earn' : 'redeem',
      description,
    },
  });
}

export async function getUserPoints(userId: string): Promise<number> {
  const lp = await db.loyaltyPoints.findUnique({ where: { userId } });
  return lp?.points ?? 0;
}

export async function deductPoints(userId: string, points: number, description: string): Promise<boolean> {
  const lp = await db.loyaltyPoints.findUnique({ where: { userId } });

  if (!lp || lp.points < points) return false;

  await db.loyaltyPoints.update({
    where: { userId },
    data: { points: { decrement: points } },
  });

  await db.pointTransaction.create({
    data: {
      userId,
      points: -points,
      type: 'redeem',
      description,
    },
  });

  return true;
}
