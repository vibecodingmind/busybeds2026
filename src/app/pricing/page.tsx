'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Crown, ArrowRight, Ticket, Shield, Users } from 'lucide-react';

const PLANS = [
  {
    name: 'Explorer',
    price: 'Free',
    period: '',
    desc: 'Get started with basic hotel discovery and limited coupons',
    features: [
      'Browse all verified hotels',
      '2 coupons per month',
      'Basic search & filters',
      'Community reviews access',
    ],
    cta: 'Get Started',
    href: '/signup',
    popular: false,
    icon: Star,
    color: 'gray',
  },
  {
    name: 'Traveler',
    price: '$4.99',
    period: '/month',
    desc: 'Unlock unlimited coupons and exclusive partner discounts',
    features: [
      'Unlimited coupon generation',
      'Up to 50% member discounts',
      'Priority flash deal access',
      'Loyalty points rewards',
      'Price drop alerts',
      'Early access to new hotels',
    ],
    cta: 'Subscribe Now',
    href: '/subscribe',
    popular: true,
    icon: Zap,
    color: 'emerald',
  },
  {
    name: 'VIP',
    price: '$9.99',
    period: '/month',
    desc: 'Maximum savings with VIP perks and concierge support',
    features: [
      'Everything in Traveler',
      '60% max discount cap',
      'VIP concierge support',
      'Free room upgrades*',
      'Airport transfer deals',
      'Exclusive VIP events',
      'Gift card bonuses monthly',
    ],
    cta: 'Go VIP',
    href: '/subscribe',
    popular: false,
    icon: Crown,
    color: 'amber',
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0F1117]">
      {/* Header */}
      <div className="bg-white dark:bg-[#0F1117] border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-[1120px] mx-auto px-6 md:px-10 pt-12 pb-10 text-center">
          <Badge className="bg-[#0E5C3B]/10 text-[#0E5C3B] dark:bg-[#10b981]/10 dark:text-[#10b981] border-0 mb-4">Simple Pricing</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">Choose your savings plan</h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto text-lg">From free discovery to VIP perks — pick the plan that matches your travel style and start saving.</p>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-[1120px] mx-auto px-6 md:px-10 py-12 md:py-16">
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {PLANS.map(plan => (
            <div key={plan.name} className={`relative rounded-2xl border-2 p-8 transition-all duration-300 hover:shadow-xl ${
              plan.popular
                ? 'border-[#0E5C3B] dark:border-[#10b981] shadow-lg scale-[1.02]'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-[#0E5C3B] dark:bg-[#10b981] text-white px-4 py-1 text-xs font-semibold shadow-md">Most Popular</Badge>
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  plan.color === 'emerald' ? 'bg-[#0E5C3B]/10 dark:bg-[#10b981]/10' :
                  plan.color === 'amber' ? 'bg-amber-100 dark:bg-amber-900/30' :
                  'bg-gray-100 dark:bg-gray-800'
                }`}>
                  <plan.icon className={`h-5 w-5 ${
                    plan.color === 'emerald' ? 'text-[#0E5C3B] dark:text-[#10b981]' :
                    plan.color === 'amber' ? 'text-amber-600 dark:text-amber-400' :
                    'text-gray-500'
                  }`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
              </div>

              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                {plan.period && <span className="text-gray-400 text-sm">{plan.period}</span>}
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">{plan.desc}</p>

              <ul className="space-y-3 mb-8">
                {plan.features.map(feature => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                    <Check className={`h-4 w-4 shrink-0 mt-0.5 ${
                      plan.color === 'emerald' ? 'text-[#0E5C3B] dark:text-[#10b981]' :
                      plan.color === 'amber' ? 'text-amber-600 dark:text-amber-400' :
                      'text-gray-400'
                    }`} />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link href={plan.href}>
                <Button className={`w-full rounded-xl h-12 text-base font-semibold transition-all ${
                  plan.popular
                    ? 'bg-[#0E5C3B] hover:bg-[#0a4d31] dark:bg-[#10b981] dark:hover:bg-[#059669] text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}>
                  {plan.cta} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ section */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">Frequently asked questions</h2>
          <div className="space-y-5">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1.5">Can I cancel anytime?</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Yes, you can cancel your subscription at any time. Your benefits will continue until the end of your current billing period.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1.5">How do coupons work?</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Generate a coupon code from any partner hotel page, then present it at check-in. The discount is applied directly to your stay — no hidden fees or complicated redemption.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1.5">What payment methods do you accept?</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">We accept M-Pesa, Tigo Pesa, Stripe (Visa/Mastercard), and PayPal. All payments are secured with bank-level encryption.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
