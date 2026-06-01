export function generateCouponCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Omit I, O, 0, 1 to avoid confusion
  const segment = (length: number): string => {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };
  return `BB-${segment(4)}-${segment(4)}`;
}

export function isCouponExpired(expiresAt: Date): boolean {
  return new Date() > new Date(expiresAt);
}

export function isWithinDateRange(
  startTime?: Date,
  endTime?: Date
): boolean {
  const now = new Date();

  if (startTime && now < new Date(startTime)) {
    return false;
  }

  if (endTime && now > new Date(endTime)) {
    return false;
  }

  return true;
}
