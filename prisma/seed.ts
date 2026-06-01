import { db } from '../src/lib/db';
import { hashPassword } from '../src/lib/auth';

async function seed() {
  console.log('🌱 Seeding database...');

  // Create subscription packages
  await db.subscriptionPackage.createMany({ data: [
    { name: 'Explorer', priceMonthly: 0, priceAnnual: 0, durationDays: 30, couponLimitPerPeriod: 1, tier: 'explorer', canBookStandard: true, canBookPremium: false, canBookLuxury: false, maxPremiumPerPeriod: 0, maxLuxuryPerPeriod: 0 },
    { name: 'Starter', priceMonthly: 9.99, priceAnnual: 99, durationDays: 30, couponLimitPerPeriod: 5, tier: 'starter', canBookStandard: true, canBookPremium: true, canBookLuxury: false, maxPremiumPerPeriod: 3, maxLuxuryPerPeriod: 0 },
    { name: 'Pro', priceMonthly: 19.99, priceAnnual: 199, durationDays: 30, couponLimitPerPeriod: 15, tier: 'pro', canBookStandard: true, canBookPremium: true, canBookLuxury: true, maxPremiumPerPeriod: 10, maxLuxuryPerPeriod: 5 },
    { name: 'Premium', priceMonthly: 34.99, priceAnnual: 349, durationDays: 30, couponLimitPerPeriod: 999, tier: 'premium', canBookStandard: true, canBookPremium: true, canBookLuxury: true, maxPremiumPerPeriod: 999, maxLuxuryPerPeriod: 999 },
  ] });
  console.log('✅ Created 4 subscription packages');

  const adminHash = await hashPassword('Admin123!');
  const admin = await db.user.create({ data: { email: 'admin@busybeds.com', passwordHash: adminHash, fullName: 'Admin User', role: 'admin', emailVerified: true, referralCode: 'REF-ADM01' } });
  console.log('✅ Created admin user');

  const ownerHash = await hashPassword('Owner123!');
  const owner = await db.user.create({ data: { email: 'owner@busybeds.com', passwordHash: ownerHash, fullName: 'Hotel Owner', role: 'owner', emailVerified: true, referralCode: 'REF-OWN01' } });
  console.log('✅ Created owner user');

  // Create 20 travelers in batch
  const names = ['Amina Hassan','John Mwangi','Sarah Kimani','David Ochieng','Fatma Said','Michael Joseph','Grace Wanjiku','Peter Lekan','Zainab Mohammed','James Otieno','Maria Santos','Ahmed Nasser','Lucy Wangari','Hassan Ali','Eve Mrema','Frank Mushi','Rose Mbeki','Thomas Mwenda','Ann Wambui','Omar Juma'];
  const hash = await hashPassword('Password123!');
  const travelers = [];
  for (let i = 0; i < names.length; i++) {
    const t = await db.user.create({ data: { email: names[i].toLowerCase().replace(/\s+/g, '.') + '@example.com', passwordHash: hash, fullName: names[i], role: 'traveler', emailVerified: true, referralCode: `REF-T${String(i+1).padStart(2,'0')}` } });
    travelers.push(t);
  }
  console.log(`✅ Created ${travelers.length} travelers`);

  // Create 20 hotels
  const hotelData = [
    // Partner hotels (ACTIVE) - have discount coupons
    { name: 'Serengeti Grand Hotel', city: 'Dar es Salaam', country: 'Tanzania', tier: 'luxury', starRating: 5, discountPercent: 20, category: 'Hotel', partnership: 'ACTIVE' },
    { name: 'Zanzibar Beach Resort', city: 'Zanzibar City', country: 'Zanzibar', tier: 'luxury', starRating: 5, discountPercent: 25, category: 'Resort', partnership: 'ACTIVE' },
    { name: 'Kilimanjaro View Lodge', city: 'Arusha', country: 'Tanzania', tier: 'premium', starRating: 4, discountPercent: 18, category: 'Lodge', partnership: 'ACTIVE' },
    { name: 'Nairobi Skyline Hotel', city: 'Nairobi', country: 'Kenya', tier: 'premium', starRating: 4, discountPercent: 15, category: 'Hotel', partnership: 'ACTIVE' },
    { name: 'Mombasa Coral Inn', city: 'Mombasa', country: 'Kenya', tier: 'standard', starRating: 3, discountPercent: 12, category: 'Hotel', partnership: 'ACTIVE' },
    { name: 'Stone Town Heritage', city: 'Stone Town', country: 'Zanzibar', tier: 'premium', starRating: 4, discountPercent: 20, category: 'BnB', partnership: 'ACTIVE' },
    { name: 'Nungwi Beach Villa', city: 'Nungwi', country: 'Zanzibar', tier: 'luxury', starRating: 5, discountPercent: 22, category: 'Villa', partnership: 'ACTIVE' },
    { name: 'Diani Ocean Resort', city: 'Diani', country: 'Kenya', tier: 'premium', starRating: 4, discountPercent: 18, category: 'Resort', partnership: 'ACTIVE' },
    { name: 'Arusha Safari Lodge', city: 'Arusha', country: 'Tanzania', tier: 'premium', starRating: 4, discountPercent: 16, category: 'Lodge', partnership: 'ACTIVE' },
    { name: 'Paje Kite Resort', city: 'Paje', country: 'Zanzibar', tier: 'premium', starRating: 4, discountPercent: 17, category: 'Resort', partnership: 'ACTIVE' },
    // Non-partner hotels (LISTING_ONLY) - show contacts, no coupons
    { name: 'Lake Victoria Lodge', city: 'Mwanza', country: 'Tanzania', tier: 'standard', starRating: 3, discountPercent: 0, category: 'Lodge', partnership: 'LISTING_ONLY' },
    { name: 'Kampala Central Hotel', city: 'Kampala', country: 'Uganda', tier: 'standard', starRating: 3, discountPercent: 0, category: 'Hotel', partnership: 'LISTING_ONLY' },
    { name: 'Kigali Serena Hotel', city: 'Kigali', country: 'Rwanda', tier: 'premium', starRating: 4, discountPercent: 0, category: 'Hotel', partnership: 'LISTING_ONLY' },
    { name: 'Kendwa Sunset Lodge', city: 'Kendwa', country: 'Zanzibar', tier: 'standard', starRating: 3, discountPercent: 0, category: 'Lodge', partnership: 'LISTING_ONLY' },
    { name: 'Dar Business Hotel', city: 'Dar es Salaam', country: 'Tanzania', tier: 'standard', starRating: 3, discountPercent: 0, category: 'Hotel', partnership: 'LISTING_ONLY' },
    { name: 'Entebbe Lakeside Hotel', city: 'Entebbe', country: 'Uganda', tier: 'standard', starRating: 3, discountPercent: 0, category: 'Hotel', partnership: 'LISTING_ONLY' },
    { name: 'Nakuru Flamingo Lodge', city: 'Nakuru', country: 'Kenya', tier: 'standard', starRating: 3, discountPercent: 0, category: 'Lodge', partnership: 'LISTING_ONLY' },
    { name: 'Dodoma Central Inn', city: 'Dodoma', country: 'Tanzania', tier: 'standard', starRating: 2, discountPercent: 0, category: 'Hotel', partnership: 'LISTING_ONLY' },
    { name: 'Kisumu Lakeview Hotel', city: 'Kisumu', country: 'Kenya', tier: 'standard', starRating: 3, discountPercent: 0, category: 'Hotel', partnership: 'LISTING_ONLY' },
    { name: 'Jinja Nile Resort', city: 'Jinja', country: 'Uganda', tier: 'premium', starRating: 4, discountPercent: 0, category: 'Resort', partnership: 'LISTING_ONLY' },
    // More hotels with geo data
    { name: 'Tanzanite Hotel', city: 'Arusha', country: 'Tanzania', tier: 'luxury', starRating: 5, discountPercent: 20, category: 'Hotel', partnership: 'ACTIVE', lat: -3.3869, lng: 36.6830 },
    { name: 'Coral Beach Club', city: 'Dar es Salaam', country: 'Tanzania', tier: 'premium', starRating: 4, discountPercent: 15, category: 'Resort', partnership: 'ACTIVE', lat: -6.7924, lng: 39.2083 },
    { name: 'Maru Maru Hotel', city: 'Stone Town', country: 'Zanzibar', tier: 'premium', starRating: 4, discountPercent: 14, category: 'Hotel', partnership: 'ACTIVE', lat: -6.1647, lng: 39.1989 },
    { name: 'Flamingo Beach Resort', city: 'Mombasa', country: 'Kenya', tier: 'luxury', starRating: 5, discountPercent: 22, category: 'Resort', partnership: 'ACTIVE', lat: -4.0500, lng: 39.6672 },
    { name: 'Sarova Stanley', city: 'Nairobi', country: 'Kenya', tier: 'luxury', starRating: 5, discountPercent: 18, category: 'Hotel', partnership: 'ACTIVE', lat: -1.2864, lng: 36.8172 },
    { name: 'Bwejuu Beach Lodge', city: 'Bwejuu', country: 'Zanzibar', tier: 'standard', starRating: 3, discountPercent: 0, category: 'Lodge', partnership: 'LISTING_ONLY', lat: -6.3433, lng: 39.5589 },
    { name: 'Kilindi Resort', city: 'Kendwa', country: 'Zanzibar', tier: 'luxury', starRating: 5, discountPercent: 0, category: 'Resort', partnership: 'LISTING_ONLY', lat: -5.9575, lng: 39.5578 },
    { name: 'Masai Mara Lodge', city: 'Narok', country: 'Kenya', tier: 'luxury', starRating: 5, discountPercent: 0, category: 'Lodge', partnership: 'LISTING_ONLY', lat: -1.4833, lng: 35.0167 },
    { name: 'Usambara Mountain Lodge', city: 'Lushoto', country: 'Tanzania', tier: 'standard', starRating: 3, discountPercent: 0, category: 'Lodge', partnership: 'LISTING_ONLY', lat: -4.7833, lng: 38.2833 },
    { name: 'Mikumi Safari Lodge', city: 'Mikumi', country: 'Tanzania', tier: 'premium', starRating: 4, discountPercent: 0, category: 'Lodge', partnership: 'LISTING_ONLY', lat: -7.3333, lng: 36.9833 },
  ];

  const hotels = [];
  for (const h of hotelData) {
    const slug = h.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).slice(2, 6);
    const hotel = await db.hotel.create({ data: {
      name: h.name, slug, city: h.city, country: h.country, category: h.category,
      descriptionShort: `Welcome to ${h.name}, a beautiful ${h.category.toLowerCase()} in ${h.city}.`,
      descriptionLong: `${h.name} offers an exceptional stay in ${h.city}, ${h.country}. Enjoy world-class amenities, stunning views, and warm hospitality.`,
      starRating: h.starRating, discountPercent: h.discountPercent, tier: h.tier,
      amenities: JSON.stringify(['WiFi','Pool','Restaurant','Parking']),
      vibeTags: JSON.stringify(['Romantic','Family-friendly']),
      partnershipStatus: h.partnership || 'ACTIVE', status: 'active',
      geoLat: (h as any).lat || null, geoLng: (h as any).lng || null,
      phone: h.partnership === 'LISTING_ONLY' ? '+255 ' + Math.floor(700000000 + Math.random() * 99999999) : null,
      address: `${h.city}, ${h.country}`,
    } });
    hotels.push(hotel);

    // Room types
    for (const [ri, rn] of ['Standard Room','Deluxe Room','Suite'].entries()) {
      await db.roomType.create({ data: { hotelId: hotel.id, name: rn, bedType: ri === 2 ? 'King' : 'Queen', sizeSqm: 25 + ri * 10, pricePerNight: 70 + ri * 50, maxGuests: ri === 2 ? 4 : 2 } });
    }
  }
  await db.hotelOwner.create({ data: { userId: owner.id, hotelId: hotels[0].id, kycStatus: 'approved' } });
  console.log(`✅ Created ${hotels.length} hotels with rooms`);

  // Create subscriptions for travelers
  const packages = await db.subscriptionPackage.findMany();
  const subscriptions = [];
  for (let i = 0; i < travelers.length; i++) {
    const pkg = packages[i % packages.length];
    const sub = await db.subscription.create({ data: {
      userId: travelers[i].id, packageId: pkg.id,
      status: 'active', billingCycle: 'monthly',
      startsAt: new Date(), expiresAt: new Date(Date.now() + 30*86400000),
    }});
    subscriptions.push(sub);
  }
  console.log(`✅ Created ${subscriptions.length} subscriptions`);

  // Coupons
  for (let i = 0; i < 80; i++) {
    const statuses = ['active','redeemed','expired'];
    const status = statuses[i % 3];
    const code = 'BB-' + Math.random().toString(36).substring(2,6).toUpperCase() + '-' + Math.random().toString(36).substring(2,6).toUpperCase();
    await db.coupon.create({ data: {
      code, userId: travelers[i % travelers.length].id, hotelId: hotels[i % hotels.length].id, subscriptionId: subscriptions[i % subscriptions.length].id,
      discountPercent: hotels[i % hotels.length].discountPercent, status,
      generatedAt: new Date(Date.now() - Math.random() * 30*86400000),
      expiresAt: new Date(Date.now() + Math.random() * 30*86400000),
      redeemedAt: status === 'redeemed' ? new Date() : null,
      priceUsd: 70 + Math.random() * 130, priceTzs: (70 + Math.random() * 130) * 2750, exchangeRate: 2750,
    } });
  }
  console.log('✅ Created 80 coupons');

  // Reviews
  for (const hotel of hotels) {
    for (let r = 0; r < 3 + Math.floor(Math.random() * 5); r++) {
      await db.review.create({ data: { hotelId: hotel.id, userId: travelers[Math.floor(Math.random() * travelers.length)].id, rating: 3 + Math.floor(Math.random() * 3), title: 'Great experience!', body: `Wonderful stay at ${hotel.name}. The staff was friendly and the location perfect.`, isVerified: true, isApproved: true } });
    }
  }
  console.log('✅ Created reviews');

  // FAQs
  await db.fAQ.createMany({ data: [
    { question: 'How does BusyBeds work?', answer: 'Subscribe to a plan, browse hotels, and generate discount coupons. Show the QR code at check-in to save up to 50%.', category: 'general', sortOrder: 1 },
    { question: 'What payment methods are supported?', answer: 'We accept Visa/Mastercard via Stripe, and M-Pesa, Tigo Pesa, Airtel Money via Pesapal.', category: 'payments', sortOrder: 2 },
    { question: 'Can I cancel my subscription?', answer: 'Yes, cancel anytime from settings. Your coupons remain valid until expiry.', category: 'subscription', sortOrder: 3 },
    { question: 'How do I use my coupon?', answer: 'Show the QR code or coupon code at hotel reception during check-in.', category: 'coupons', sortOrder: 4 },
    { question: 'What is the referral program?', answer: 'Share your referral link. When friends subscribe, you earn 100 loyalty points + cash commission.', category: 'referrals', sortOrder: 5 },
  ] });

  // Blog posts
  for (const p of [
    { slug: 'top-5-hotels-zanzibar', title: 'Top 5 Hotels in Zanzibar', excerpt: 'Discover the best hotels in Zanzibar with exclusive discounts.', content: '<p>Zanzibar is a tropical paradise with pristine beaches and rich culture.</p>' },
    { slug: 'save-money-africa-travel', title: 'How to Save Money Traveling in Africa', excerpt: 'Smart tips for budget-conscious travelers.', content: '<p>Traveling in Africa does not have to break the bank.</p>' },
    { slug: 'busybeds-launch', title: 'Welcome to BusyBeds', excerpt: 'Your gateway to exclusive hotel discounts in Africa.', content: '<p>BusyBeds is here to transform how you book hotels.</p>' },
  ]) {
    await db.blogPost.create({ data: { ...p, authorId: admin.id, status: 'published', publishedAt: new Date() } });
  }

  // Flash deals
  await db.flashDeal.createMany({ data: [
    { hotelId: hotels[1].id, title: 'Zanzibar Summer Special', discountPercent: 30, startsAt: new Date(), endsAt: new Date(Date.now() + 7*86400000), isActive: true },
    { hotelId: hotels[3].id, title: 'Nairobi Weekend Deal', discountPercent: 25, startsAt: new Date(), endsAt: new Date(Date.now() + 3*86400000), isActive: true },
  ] });

  // Site settings
  await db.siteSettings.create({ data: { key: 'currency_rates', value: '{"USD":1,"TZS":2750,"KES":155}' } });

  console.log('\n🎉 Seeding complete!');
  console.log('Admin: admin@busybeds.com / Admin123!');
  console.log('Owner: owner@busybeds.com / Owner123!');
}

seed().catch(e => { console.error('Seed error:', e); process.exit(1); });
