interface DiscountRule {
  type: string;
  name: string;
  bonusPercent?: number;
  startMonth?: number;
  endMonth?: number;
  daysInAdvance?: number;
  active?: boolean;
}

interface DiscountContext {
  isNewUser?: boolean;
  daysInAdvance?: number;
}

interface EffectiveDiscount {
  discountPercent: number;
  ruleName?: string;
}

export function getEffectiveDiscount(
  rules: DiscountRule[],
  basePercent: number,
  now: Date,
  context?: DiscountContext
): EffectiveDiscount {
  let bestDiscount = basePercent;
  let bestRuleName: string | undefined;

  const currentMonth = now.getMonth() + 1; // 1-12
  const currentDay = now.getDay(); // 0=Sunday, 6=Saturday

  for (const rule of rules) {
    if (rule.active === false) continue;

    let applicable = false;

    switch (rule.type) {
      case 'new_user_bonus': {
        applicable = context?.isNewUser === true;
        break;
      }
      case 'weekend': {
        applicable = currentDay === 0 || currentDay === 6;
        break;
      }
      case 'seasonal': {
        if (rule.startMonth != null && rule.endMonth != null) {
          if (rule.startMonth <= rule.endMonth) {
            // Normal range, e.g. June-August (6-8)
            applicable =
              currentMonth >= rule.startMonth && currentMonth <= rule.endMonth;
          } else {
            // Wrapping range, e.g. November-February (11-2)
            applicable =
              currentMonth >= rule.startMonth || currentMonth <= rule.endMonth;
          }
        }
        break;
      }
      case 'early_bird': {
        if (rule.daysInAdvance != null && context?.daysInAdvance != null) {
          applicable = context.daysInAdvance >= rule.daysInAdvance;
        }
        break;
      }
      default:
        break;
    }

    if (applicable && rule.bonusPercent != null) {
      const totalDiscount = basePercent + rule.bonusPercent;
      if (totalDiscount > bestDiscount) {
        bestDiscount = totalDiscount;
        bestRuleName = rule.name;
      }
    }
  }

  return {
    discountPercent: bestDiscount,
    ruleName: bestRuleName,
  };
}
