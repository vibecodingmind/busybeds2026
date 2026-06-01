'use client';

import { Card, CardContent } from '@/components/ui/card';
import { HelpCircle, Mail, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function HelpSettingsPage() {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><HelpCircle className="h-5 w-5" /> Help & Support</h2>
      <div className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <h3 className="font-medium mb-2">Frequently Asked Questions</h3>
          <p className="text-sm text-muted-foreground mb-2">Find answers to common questions about BusyBeds.</p>
          <Link href="/faq" className="text-sm text-[#0E5C3B] dark:text-[#10b981] hover:underline">View FAQ</Link>
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <h3 className="font-medium mb-2">Contact Support</h3>
          <p className="text-sm text-muted-foreground mb-2">Get help from our support team.</p>
          <a href="mailto:support@busybeds.com" className="text-sm text-[#0E5C3B] dark:text-[#10b981] hover:underline flex items-center gap-1"><Mail className="h-3 w-3" /> support@busybeds.com</a>
        </div>
      </div>
    </Card>
  );
}
