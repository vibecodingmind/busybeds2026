'use client';
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

const terms = [
  { title: '1. Acceptance of Terms', content: 'By accessing or using BusyBeds (the "Service"), you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our Service. These terms apply to all visitors, users, and others who access or use the Service. We reserve the right to update or modify these terms at any time without prior notice, and your continued use of the Service after any changes constitutes acceptance of the new terms.' },
  { title: '2. Account Registration', content: 'To access certain features, you must create an account. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You must provide accurate, current, and complete information during registration and update it as necessary. You must be at least 18 years old to create an account. You agree to notify us immediately of any unauthorized use of your account.' },
  { title: '3. Subscription Plans & Billing', content: 'BusyBeds offers multiple subscription tiers: Explorer (free), Starter, Pro, and Premium. Each plan provides different coupon limits and hotel access levels. Subscriptions are billed monthly or annually as selected. Prices are subject to change with 30 days notice. Your subscription automatically renews at the end of each billing period unless you cancel before the renewal date. No partial refunds are provided for unused periods.' },
  { title: '4. Coupons & Discount Codes', content: 'Coupons are digital vouchers that provide discounts at partner hotels. Each coupon has a unique code, QR code, discount percentage, and expiration date. Coupons are non-transferable and may only be used by the subscriber who generated them. BusyBeds does not guarantee hotel availability or that a specific coupon will be accepted by a hotel at any given time. Expired coupons cannot be reactivated or refunded.' },
  { title: '5. Hotel Bookings & Stay Requests', content: 'BusyBeds facilitates connections between travelers and hotels through coupons and stay requests but does not directly operate or manage any hotel. Hotel availability, pricing, and terms are set by individual hotel partners. We are not responsible for the quality of hotel services, overbooking, or any disputes between you and a hotel. Stay requests are subject to hotel approval and may be declined at the hotel\'s discretion.' },
  { title: '6. Payment Terms', content: 'Payments are processed through Stripe (Visa, Mastercard), Pesapal (M-Pesa, Tigo Pesa, Airtel Money), or PayPal. All transactions are in the currency displayed at checkout. You authorize us to charge your selected payment method for subscription fees and any other purchases made through the Service. Failed payments may result in subscription suspension. Applicable taxes are included in the displayed price where required by law.' },
  { title: '7. Refund Policy', content: 'Subscription fees are non-refundable once the billing period has begun. Coupon purchases are non-refundable after generation. If you believe you were charged incorrectly, you may request a review within 14 days of the charge by contacting support@busybeds.com. Refunds, if approved, will be processed to the original payment method within 10 business days. We reserve the right to refuse refund requests that are made outside this window or are determined to be fraudulent.' },
  { title: '8. Intellectual Property', content: 'All content on the Service, including text, graphics, logos, icons, images, and software, is the property of BusyBeds or its content suppliers and is protected by international copyright, trademark, and intellectual property laws. You may not reproduce, distribute, modify, or create derivative works from any content without our express written permission. The BusyBeds name, logo, and all related marks are trademarks of BusyBeds Limited.' },
  { title: '9. User Conduct', content: 'You agree not to misuse the Service, including but not limited to: generating coupons for resale, creating multiple accounts to circumvent limits, submitting false reviews, attempting to hack or disrupt the platform, impersonating other users, or using automated tools to access the Service. Violations may result in account suspension, coupon cancellation, or permanent ban without refund.' },
  { title: '10. Limitation of Liability', content: 'BusyBeds provides the Service "as is" without warranties of any kind. We shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service, including but not limited to loss of profits, data, or goodwill. Our total liability to you for any claim shall not exceed the amount you paid to us in the 12 months preceding the claim. This limitation applies to the fullest extent permitted by law.' },
  { title: '11. Indemnification', content: 'You agree to indemnify and hold harmless BusyBeds, its officers, directors, employees, and agents from any claims, damages, losses, or expenses (including reasonable attorney fees) arising from your use of the Service, your violation of these Terms, or your violation of any rights of another party.' },
  { title: '12. Governing Law', content: 'These Terms shall be governed by and construed in accordance with the laws of the United Republic of Tanzania, without regard to its conflict of law provisions. Any disputes arising from these Terms or the Service shall be resolved in the courts of Dar es Salaam, Tanzania. You consent to the personal jurisdiction and venue of such courts.' },
  { title: '13. Contact Information', content: 'For questions about these Terms of Service, please contact us at legal@busybeds.com or write to: BusyBeds Limited, Ohio Street, Dar es Salaam, Tanzania. Our support team is available Monday through Friday, 9:00 AM to 6:00 PM East Africa Time.' },
];

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen">
      <section className="bg-muted/30 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: June 2026</p>
        </div>
      </section>
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl space-y-4">
          <p className="text-muted-foreground leading-relaxed mb-6">Welcome to BusyBeds. These Terms of Service govern your use of our website, mobile applications, and related services. By using BusyBeds, you agree to comply with and be bound by the following terms and conditions.</p>
          {terms.map(t => (
            <Card key={t.title} className="p-6">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#ea4d60] shrink-0" />
                {t.title}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{t.content}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
