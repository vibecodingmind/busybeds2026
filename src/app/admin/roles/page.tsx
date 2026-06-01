'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Shield, Plus, Trash2, Loader2, Users } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  permissions: string[];
  createdAt: string;
}

const AVAILABLE_PERMISSIONS = [
  'dashboard:view', 'users:view', 'users:edit', 'users:delete',
  'hotels:view', 'hotels:edit', 'hotels:delete', 'hotels:import',
  'coupons:view', 'coupons:edit', 'coupons:delete',
  'subscriptions:view', 'subscriptions:edit',
  'revenue:view', 'flash-deals:view', 'flash-deals:edit',
  'gift-cards:view', 'gift-cards:edit',
  'emails:view', 'emails:send',
  'sms:view', 'sms:send',
  'blogs:view', 'blogs:edit',
  'broadcast:view', 'broadcast:send',
  'settings:view', 'settings:edit',
  'fraud:view', 'audit-log:view',
  'reviews:view', 'reviews:edit',
  'analytics:view', 'roles:view', 'roles:edit',
];

const DEFAULT_ROLES: Role[] = [
  { id: 'super_admin', name: 'Super Admin', permissions: AVAILABLE_PERMISSIONS, createdAt: new Date().toISOString() },
  { id: 'content_manager', name: 'Content Manager', permissions: ['dashboard:view', 'hotels:view', 'hotels:edit', 'blogs:view', 'blogs:edit', 'reviews:view', 'reviews:edit'], createdAt: new Date().toISOString() },
  { id: 'finance', name: 'Finance', permissions: ['dashboard:view', 'revenue:view', 'subscriptions:view', 'gift-cards:view', 'analytics:view'], createdAt: new Date().toISOString() },
  { id: 'support', name: 'Support', permissions: ['dashboard:view', 'users:view', 'coupons:view', 'reviews:view', 'reviews:edit', 'fraud:view'], createdAt: new Date().toISOString() },
];

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>(DEFAULT_ROLES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production, this would fetch from API
    setLoading(false);
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-[#ea4d60]" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="h-6 w-6 text-[#ea4d60]" /> Role Management</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {roles.map(role => (
          <Card key={role.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#ea4d60]" /> {role.name}
                </CardTitle>
                <Badge variant="outline">{role.permissions.length} permissions</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {role.permissions.slice(0, 8).map(p => (
                  <Badge key={p} className="bg-gray-100 dark:bg-gray-800 text-[10px]">{p}</Badge>
                ))}
                {role.permissions.length > 8 && (
                  <Badge className="bg-gray-100 dark:bg-gray-800 text-[10px]">+{role.permissions.length - 8} more</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="font-semibold mb-3">Available Permissions ({AVAILABLE_PERMISSIONS.length})</h3>
        <div className="flex flex-wrap gap-1.5">
          {AVAILABLE_PERMISSIONS.map(p => (
            <Badge key={p} variant="outline" className="text-[10px]">{p}</Badge>
          ))}
        </div>
      </Card>
    </div>
  );
}
