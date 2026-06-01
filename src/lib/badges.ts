import { db } from './db';

interface BadgeCheck {
  type: string;
  condition: (userId: string) => Promise<boolean>;
}

const BADGE_CHECKS: BadgeCheck[] = [
  {
    type: 'first_coupon',
    condition: async (userId: string) => {
      const count = await db.coupon.count({ where: { userId } });
      return count >= 1;
    },
  },
  {
    type: 'coupon_collector',
    condition: async (userId: string) => {
      const count = await db.coupon.count({ where: { userId } });
      return count >= 10;
    },
  },
  {
    type: 'coupon_master',
    condition: async (userId: string) => {
      const count = await db.coupon.count({ where: { userId } });
      return count >= 50;
    },
  },
  {
    type: 'loyalty_100',
    condition: async (userId: string) => {
      const lp = await db.loyaltyPoints.findUnique({ where: { userId } });
      return (lp?.lifetime ?? 0) >= 100;
    },
  },
  {
    type: 'loyalty_500',
    condition: async (userId: string) => {
      const lp = await db.loyaltyPoints.findUnique({ where: { userId } });
      return (lp?.lifetime ?? 0) >= 500;
    },
  },
  {
    type: 'early_adopter',
    condition: async (userId: string) => {
      const user = await db.user.findUnique({ where: { id: userId } });
      if (!user) return false;
      return user.createdAt < new Date('2025-12-31');
    },
  },
];

export async function checkAndAwardBadges(userId: string): Promise<string[]> {
  const awarded: string[] = [];

  for (const check of BADGE_CHECKS) {
    try {
      const alreadyHas = await db.badge.findFirst({
        where: { userId, type: check.type },
      });

      if (!alreadyHas) {
        const earned = await check.condition(userId);
        if (earned) {
          await db.badge.create({
            data: { userId, type: check.type },
          });
          awarded.push(check.type);
        }
      }
    } catch {
      // Skip badge check on error
    }
  }

  return awarded;
}
