import { NextResponse } from 'next/server';

// Force dynamic rendering — never cache this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const faqs = [
  {
    id: '1',
    question: 'What is BusyBeds and how does it work?',
    answer:
      'BusyBeds is a hotel discount coupon marketplace that connects travelers with exclusive savings on premium accommodations across Africa. You subscribe to a monthly or annual plan, and in return you receive discount coupons that can be redeemed at any of our partner hotels for up to 50% off. Simply browse available hotels, generate a coupon, present it at check-in, and enjoy your discounted stay. It is that straightforward — no complicated booking processes, no hidden conditions, just real savings on real hotel stays across the continent.',
    category: 'general',
    sortOrder: 1,
    isActive: true,
  },
  {
    id: '2',
    question: 'Which countries does BusyBeds operate in?',
    answer:
      'BusyBeds currently operates in Tanzania, Kenya, Zanzibar, Uganda, Rwanda, Ethiopia, and South Africa. We are actively expanding our network and plan to add more countries across East and Southern Africa in the coming months. Each market features a curated selection of partner hotels that have been personally verified by our partnerships team to ensure consistent quality and reliability. Whether you are looking for a beach resort in Zanzibar or a city hotel in Nairobi, we have options for you.',
    category: 'general',
    sortOrder: 2,
    isActive: true,
  },
  {
    id: '12',
    question: 'How do I become a hotel partner?',
    answer:
      'If you own or manage a hotel and would like to join the BusyBeds network, you can apply through our "Become a Host" page. Our partnerships team will review your application, verify your property, and schedule an onboarding call. We look for hotels that meet our quality standards for guest experience, cleanliness, and safety. Once approved, you will gain access to our partner dashboard where you can manage your listings, set discount rates, and track performance metrics in real time.',
    category: 'general',
    sortOrder: 12,
    isActive: true,
  },
  {
    id: '3',
    question: 'How do I redeem a discount coupon?',
    answer:
      'Redeeming a coupon is simple. After generating a coupon from your dashboard, you will receive a digital coupon with a unique QR code. When you arrive at your hotel, present the coupon (either on your phone or printed) at the front desk. The hotel staff will scan the QR code to verify its authenticity and apply the discount to your booking. Make sure to check the coupon validity dates and any specific terms before your visit to ensure a smooth check-in experience.',
    category: 'coupons',
    sortOrder: 3,
    isActive: true,
  },
  {
    id: '4',
    question: 'Can I use a coupon for multiple nights?',
    answer:
      'Yes, most coupons apply to your entire stay, not just a single night. However, the specific terms may vary by hotel. Some partner hotels offer discounts on the first night only, while others extend the discount across consecutive nights booked under the same reservation. Always check the coupon details for the exact terms, including any minimum stay requirements or blackout dates that might apply to your chosen dates and destination.',
    category: 'coupons',
    sortOrder: 4,
    isActive: true,
  },
  {
    id: '9',
    question: 'What happens if a hotel does not honor my coupon?',
    answer:
      'In the rare event that a partner hotel does not honor a valid BusyBeds coupon, please contact our support team immediately. We take these matters very seriously and will work directly with the hotel to resolve the issue. If we cannot resolve it, we will issue you a replacement coupon or a full refund for the affected booking. Your satisfaction is our top priority and we stand behind every coupon we issue with our full guarantee.',
    category: 'coupons',
    sortOrder: 9,
    isActive: true,
  },
  {
    id: '10',
    question: 'Are there any blackout dates for coupons?',
    answer:
      'Some hotels may have blackout dates during peak seasons, holidays, or special events. These blackout dates are clearly listed on each coupon before you generate it, so there are no surprises at check-in. We always recommend checking the coupon terms carefully before booking your stay. Hotels that impose blackout dates typically offer higher discounts during off-peak periods to compensate, so you can often find even better deals by traveling during quieter times.',
    category: 'coupons',
    sortOrder: 10,
    isActive: true,
  },
  {
    id: '5',
    question: 'What payment methods do you accept?',
    answer:
      'BusyBeds accepts a variety of payment methods to accommodate travelers across Africa. These include major credit and debit cards (Visa, Mastercard), mobile money (M-Pesa, Tigo Pesa, Airtel Money), PayPal, and bank transfers for annual subscriptions. All transactions are processed through secure, PCI-compliant payment gateways. We also support local currencies in each of our operating countries, so you can pay in the currency that is most convenient for you.',
    category: 'payments',
    sortOrder: 5,
    isActive: true,
  },
  {
    id: '11',
    question: 'Is my payment information secure?',
    answer:
      'Yes, absolutely. BusyBeds uses industry-standard encryption and PCI-compliant payment processors to handle all financial transactions. We never store your full credit card details on our servers. All sensitive payment data is tokenized and processed through secure payment gateways like Stripe and Pesapal. Additionally, our platform undergoes regular security audits to ensure your data remains protected at all times. Your financial security is non-negotiable for us.',
    category: 'payments',
    sortOrder: 11,
    isActive: true,
  },
  {
    id: '13',
    question: 'How do refunds work for subscription payments?',
    answer:
      'If you are unsatisfied with your BusyBeds subscription, you can request a refund within 14 days of your initial purchase. After the 14-day window, subscriptions are non-refundable but you can cancel at any time and continue using the service until the end of your current billing period. Unused coupons remain valid until their individual expiration dates regardless of your subscription status. Contact our support team for any billing concerns.',
    category: 'payments',
    sortOrder: 13,
    isActive: true,
  },
  {
    id: '6',
    question: 'How does the subscription model work?',
    answer:
      'BusyBeds offers three subscription tiers: Basic, Premium, and Luxury. Each tier provides a set number of discount coupons per billing period, with higher tiers offering more coupons and access to premium hotel categories. Subscriptions can be billed monthly or annually (with a discount for annual billing). Your subscription auto-renews, but you can cancel anytime from your account settings without penalty. Every tier includes access to flash deals, referral rewards, and our loyalty points program.',
    category: 'subscription',
    sortOrder: 6,
    isActive: true,
  },
  {
    id: '7',
    question: 'Can I cancel my subscription at any time?',
    answer:
      'Absolutely. You can cancel your BusyBeds subscription at any time from your account settings. Your subscription will remain active until the end of your current billing period, and any unused coupons will still be valid until their individual expiration dates. There are no cancellation fees or penalties whatsoever. If you change your mind, you can always resubscribe and pick up right where you left off — your account and preferences are always saved.',
    category: 'subscription',
    sortOrder: 7,
    isActive: true,
  },
  {
    id: '14',
    question: 'Can I upgrade or downgrade my subscription plan?',
    answer:
      'Yes, you can change your subscription tier at any time from your account settings. When upgrading, the price difference is prorated for the remainder of your current billing period, and you immediately gain access to the higher tier benefits. When downgrading, the change takes effect at the start of your next billing cycle, so you keep your current tier benefits until then. There are no fees for changing your plan.',
    category: 'subscription',
    sortOrder: 14,
    isActive: true,
  },
  {
    id: '8',
    question: 'How does the referral program work?',
    answer:
      'When you refer a friend to BusyBeds using your unique referral code, both you and your friend receive rewards. Your friend gets a discount on their first subscription, and you earn loyalty points or a referral bonus that can be applied toward future subscriptions. There is no limit to the number of people you can refer — the more friends you invite, the more you earn. Referral earnings are tracked in your dashboard and can be redeemed at any time for account credits or additional coupons.',
    category: 'referrals',
    sortOrder: 8,
    isActive: true,
  },
  {
    id: '15',
    question: 'Is there a limit to how many people I can refer?',
    answer:
      'No, there is absolutely no limit on referrals. You can invite as many friends, family members, and colleagues as you like. Each successful referral earns you the standard referral bonus, and these bonuses stack without any cap. Some of our most active referrers have earned enough loyalty points to cover their subscription costs entirely. Share your referral code on social media, messaging apps, or in person — the more the merrier.',
    category: 'referrals',
    sortOrder: 15,
    isActive: true,
  },
];

export async function GET() {
  try {
    // First try to fetch from database
    try {
      const { db } = await import('@/lib/db');
      const dbFaqs = await db.fAQ.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      });
      if (dbFaqs.length > 0) {
        return NextResponse.json({ success: true, data: dbFaqs });
      }
    } catch {
      // Database not available, use static data
    }

    // Fallback to static data
    return NextResponse.json({ success: true, data: faqs });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch FAQs' },
      { status: 500 }
    );
  }
}
