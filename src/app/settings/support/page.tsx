'use client';

import { Card, CardContent } from '@/components/ui/card';
import { HelpCircle, Mail, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function SupportSettingsPage() {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><HelpCircle className="h-5 w-5" /> Support</h2>
      <div className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <h3 className="font-medium mb-2">Need help?</h3>
          <p className="text-sm text-muted-foreground mb-2">Our team is here to assist you.</p>
          <a href="mailto:support@busybeds.com" className="text-sm text-[#0E5C3B] dark:text-[#10b981] hover:underline flex items-center gap-1"><Mail className="h-3 w-3" /> support@busybeds.com</a>
        </div>
      </div>
    </Card>
  );
}
