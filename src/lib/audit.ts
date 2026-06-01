import { db } from '@/lib/db';

interface AuditLogParams {
  userId?: string;
  action: string;
  target?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
}

export async function logAudit({ userId, action, target, metadata, ip }: AuditLogParams) {
  try {
    await db.auditLog.create({
      data: {
        userId,
        action,
        target,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
        ip,
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}
