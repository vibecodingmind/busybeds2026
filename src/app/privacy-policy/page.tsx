'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Lock, Eye, Database, Cookie, Globe, Users, FileText, Bell } from 'lucide-react';
import Link from 'next/link';

const sections = [
  { icon: Eye, title: '1. Information We Collect', content: 'We collect information you provide directly, such as your name, email address, phone number, and payment information when you register, subscribe, or make a purchase. We also automatically collect usage data including your IP address, browser type, pages visited, and time spent on our platform through cookies and similar technologies. Location data may be collected with your consent to show nearby hotels and deals.' },
  { icon: Database, title: '2. How We Use Your Information', content: 'Your information is used to provide and improve our services, process transactions, send coupons and booking confirmations, personalize your experience with relevant hotel recommendations, communicate about your account or subscriptions, and prevent fraud or unauthorized access. We never sell your personal data to third parties. Anonymous, aggregated data may be used for analytics and platform improvement.' },
  { icon: Lock, title: '3. Data Storage & Security', content: 'All personal data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption. Our servers are hosted in secure data centers with strict access controls, regular security audits, and 24/7 monitoring. Payment data is processed by PCI-DSS compliant providers (Stripe, Pesapal) and never stored on our servers. We retain your data only as long as necessary for the purposes described in this policy.' },
  { icon: Cookie, title: '4. Cookies & Tracking', content: 'We use essential cookies to maintain your session and authentication, analytics cookies (such as Google Analytics) to understand how users interact with our platform, and functional cookies to remember your preferences such as currency and language. You can manage cookie preferences through your browser settings at any time. Disabling certain cookies may affect site functionality.' },
  { icon: Globe, title: '5. Third-Party Services', content: 'We integrate with trusted third-party services: Stripe and Pesapal for payment processing, Google Maps for location services, and analytics providers for site improvement. Each service has its own privacy policy governing data they collect. We only share the minimum information required for these services to function and do not grant them the right to use your data for their own marketing purposes.' },
  { icon: Users, title: '6. Your Rights', content: 'You have the right to access, correct, or delete your personal data at any time through your account settings. You can request a copy of your data in a portable format, opt out of marketing communications, and restrict or object to certain data processing activities. To exercise these rights, contact us at privacy@busybeds.com or use the privacy settings in your account dashboard.' },
  { icon: Shield, title: '7. Children\'s Privacy', content: 'BusyBeds is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal data, we will take steps to delete such information promptly. Parents or guardians who believe their child has used our platform should contact us immediately.' },
  { icon: Bell, title: '8. Changes to This Policy', content: 'We may update this privacy policy from time to time to reflect changes in our practices, technology, or legal requirements. We will notify you of significant changes via email or a prominent notice on our website. Your continued use of BusyBeds after any changes constitutes your acceptance of the updated policy. We encourage you to review this page periodically.' },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-muted/30 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: June 2026</p>
        </div>
      </section>
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl space-y-6">
          <p className="text-muted-foreground leading-relaxed">At BusyBeds, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our mobile applications. Please read this policy carefully to understand our practices regarding your personal data.</p>
          {sections.map(s => (
            <Card key={s.title} className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#ea4d60]/10 flex items-center justify-center shrink-0">
                  <s.icon className="h-5 w-5 text-[#ea4d60]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-2">{s.title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.content}</p>
                </div>
              </div>
            </Card>
          ))}
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#ea4d60]/10 flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-[#ea4d60]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-2">9. Contact Us</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at <span className="text-[#ea4d60]">privacy@busybeds.com</span> or write to us at: BusyBeds Limited, Ohio Street, Dar es Salaam, Tanzania.</p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
