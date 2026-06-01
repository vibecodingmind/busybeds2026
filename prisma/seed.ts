import { db } from '../src/lib/db';
import { hashPassword } from '../src/lib/auth';

async function seed() {
  console.log('🌱 Seeding database...');

  // Create subscription packages
  const packages = await Promise.all([
    db.subscriptionPackage.create({ data: { name: 'Explorer', priceMonthly: 0, priceAnnual: 0, durationDays: 30, couponLimitPerPeriod: 1, tier: 'explorer', canBookStandard: true, canBookPremium: false, canBookLuxury: false, maxPremiumPerPeriod: 0, maxLuxuryPerPeriod: 0 } }),
    db.subscriptionPackage.create({ data: { name: 'Starter', priceMonthly: 9.99, priceAnnual: 99, durationDays: 30, couponLimitPerPeriod: 5, tier: 'starter', canBookStandard: true, canBookPremium: true, canBookLuxury: false, maxPremiumPerPeriod: 3, maxLuxuryPerPeriod: 0 } }),
    db.subscriptionPackage.create({ data: { name: 'Pro', priceMonthly: 19.99, priceAnnual: 199, durationDays: 30, couponLimitPerPeriod: 15, tier: 'pro', canBookStandard: true, canBookPremium: true, canBookLuxury: true, maxPremiumPerPeriod: 10, maxLuxuryPerPeriod: 5 } }),
    db.subscriptionPackage.create({ data: { name: 'Premium', priceMonthly: 34.99, priceAnnual: 349, durationDays: 30, couponLimitPerPeriod: 999, tier: 'premium', canBookStandard: true, canBookPremium: true, canBookLuxury: true, maxPremiumPerPeriod: 999, maxLuxuryPerPeriod: 999 } }),
  ]);
  console.log(`✅ Created ${packages.length} subscription packages`);

  // Create admin user
  const adminHash = await hashPassword('Admin123!');
  const admin = await db.user.create({
    data: { email: 'admin@busybeds.com', passwordHash: adminHash, fullName: 'Admin User', role: 'admin', emailVerified: true, referralCode: 'REF-ADMIN01' },
  });
  console.log('✅ Created admin user');

  // Create travelers
  const travelerNames = ['Amina Hassan', 'John Mwangi', 'Sarah Kimani', 'David Ochieng', 'Fatma Said', 'Michael Joseph', 'Grace Wanjiku', 'Peter Lekan', 'Zainab Mohammed', 'James Otieno', 'Maria Santos', 'Ahmed Nasser', 'Lucy Wangari', 'Hassan Ali', 'Eve Mrema', 'Frank Mushi', 'Rose Mbeki', 'Thomas Mwenda', 'Ann Wambui', 'Omar Juma', 'Catherine Okafor', 'Ibrahim Musa', 'Diana Rweyemamu', 'Samuel Asante', 'Helen Cherono', 'Yusuf Khamis', 'Agnes Nyirenda', 'Robert Banda', 'Rachel Mwangi', 'George Odhiambo', 'Tabitha Wairimu', 'Daniel Kiprop', 'Marianne Uwimana', 'Ernest Ndayisaba', 'Patience Mugisha', 'Vincent Habimana', 'Claudine Niyonzima', 'Felix Bizimana', 'Immaculée Mukamana', 'Jean-Pierre Mutabazi'];
  const travelers = [];
  for (const name of travelerNames.slice(0, 50)) {
    const hash = await hashPassword('Password123!');
    const t = await db.user.create({
      data: { email: name.toLowerCase().replace(/\s+/g, '.') + '@example.com', passwordHash: hash, fullName: name, role: 'traveler', emailVerified: true, referralCode: 'REF-' + name.replace(/\s+/g, '').toUpperCase().slice(0, 4) + Math.floor(Math.random() * 100) },
    });
    travelers.push(t);
  }
  console.log(`✅ Created ${travelers.length} travelers`);

  // Create hotels
  const hotelData = [
    { name: 'Serengeti Grand Hotel', city: 'Dar es Salaam', country: 'Tanzania', tier: 'luxury', starRating: 5, discountPercent: 20, category: 'Hotel' },
    { name: 'Zanzibar Beach Resort', city: 'Zanzibar City', country: 'Zanzibar', tier: 'luxury', starRating: 5, discountPercent: 25, category: 'Resort' },
    { name: 'Kilimanjaro View Lodge', city: 'Arusha', country: 'Tanzania', tier: 'premium', starRating: 4, discountPercent: 18, category: 'Lodge' },
    { name: 'Nairobi Skyline Hotel', city: 'Nairobi', country: 'Kenya', tier: 'premium', starRating: 4, discountPercent: 15, category: 'Hotel' },
    { name: 'Mombasa Coral Inn', city: 'Mombasa', country: 'Kenya', tier: 'standard', starRating: 3, discountPercent: 12, category: 'Hotel' },
    { name: 'Stone Town Heritage', city: 'Stone Town', country: 'Zanzibar', tier: 'premium', starRating: 4, discountPercent: 20, category: 'BnB' },
    { name: 'Nungwi Beach Villa', city: 'Nungwi', country: 'Zanzibar', tier: 'luxury', starRating: 5, discountPercent: 22, category: 'Villa' },
    { name: 'Lake Victoria Lodge', city: 'Mwanza', country: 'Tanzania', tier: 'standard', starRating: 3, discountPercent: 10, category: 'Lodge' },
    { name: 'Kampala Central Hotel', city: 'Kampala', country: 'Uganda', tier: 'standard', starRating: 3, discountPercent: 12, category: 'Hotel' },
    { name: 'Kigali Serena Hotel', city: 'Kigali', country: 'Rwanda', tier: 'premium', starRating: 4, discountPercent: 15, category: 'Hotel' },
    { name: 'Diani Ocean Resort', city: 'Diani', country: 'Kenya', tier: 'premium', starRating: 4, discountPercent: 18, category: 'Resort' },
    { name: 'Kendwa Sunset Lodge', city: 'Kendwa', country: 'Zanzibar', tier: 'standard', starRating: 3, discountPercent: 14, category: 'Lodge' },
    { name: 'Dar Business Hotel', city: 'Dar es Salaam', country: 'Tanzania', tier: 'standard', starRating: 3, discountPercent: 10, category: 'Hotel' },
    { name: 'Arusha Safari Lodge', city: 'Arusha', country: 'Tanzania', tier: 'premium', starRating: 4, discountPercent: 16, category: 'Lodge' },
    { name: 'Entebbe Lakeside Hotel', city: 'Entebbe', country: 'Uganda', tier: 'standard', starRating: 3, discountPercent: 12, category: 'Hotel' },
    { name: 'Nakuru Flamingo Lodge', city: 'Nakuru', country: 'Kenya', tier: 'standard', starRating: 3, discountPercent: 11, category: 'Lodge' },
    { name: 'Paje Kite Resort', city: 'Paje', country: 'Zanzibar', tier: 'premium', starRating: 4, discountPercent: 17, category: 'Resort' },
    { name: 'Dodoma Central Inn', city: 'Dodoma', country: 'Tanzania', tier: 'standard', starRating: 2, discountPercent: 8, category: 'Hotel' },
    { name: 'Kisumu Lakeview Hotel', city: 'Kisumu', country: 'Kenya', tier: 'standard', starRating: 3, discountPercent: 10, category: 'Hotel' },
    { name: 'Jinja Nile Resort', city: 'Jinja', country: 'Uganda', tier: 'premium', starRating: 4, discountPercent: 15, category: 'Resort' },
  ];

  const hotels = [];
  for (const h of hotelData) {
    const slug = h.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).slice(2, 6);
    const hotel = await db.hotel.create({
      data: {
        name: h.name, slug, city: h.city, country: h.country, category: h.category,
        descriptionShort: `Welcome to ${h.name}, a beautiful ${h.category.toLowerCase()} in ${h.city}.`,
        descriptionLong: `${h.name} offers an exceptional stay in ${h.city}, ${h.country}. Enjoy world-class amenities, stunning views, and warm hospitality. Our dedicated staff ensures every guest has a memorable experience. Whether you are visiting for business or leisure, we provide the perfect base for your adventures.`,
        starRating: h.starRating, discountPercent: h.discountPercent, tier: h.tier,
        amenities: JSON.stringify(['WiFi', 'Pool', 'Restaurant', 'Parking']),
        vibeTags: JSON.stringify(['Romantic', 'Family-friendly']),
        partnershipStatus: 'ACTIVE', status: 'active',
        geoLat: -6.8 + Math.random() * 2, geoLng: 39.2 + Math.random() * 2,
      },
    });
    hotels.push(hotel);

    // Create room types for each hotel
    const roomNames = ['Standard Room', 'Deluxe Room', 'Suite'];
    for (const roomName of roomNames) {
      await db.roomType.create({
        data: { hotelId: hotel.id, name: roomName, bedType: roomName === 'Suite' ? 'King' : 'Queen', sizeSqm: roomName === 'Suite' ? 50 : roomName === 'Deluxe Room' ? 35 : 25, pricePerNight: roomName === 'Suite' ? 200 : roomName === 'Deluxe Room' ? 120 : 70, maxGuests: roomName === 'Suite' ? 4 : 2, description: `Beautiful ${roomName.toLowerCase()}` },
      });
    }
  }
  console.log(`✅ Created ${hotels.length} hotels with rooms`);

  // Create some owner
  const ownerHash = await hashPassword('Owner123!');
  const owner = await db.user.create({ data: { email: 'owner@busybeds.com', passwordHash: ownerHash, fullName: 'Hotel Owner', role: 'owner', emailVerified: true, referralCode: 'REF-OWNER1' } });
  await db.hotelOwner.create({ data: { userId: owner.id, hotelId: hotels[0].id, kycStatus: 'approved' } });
  console.log('✅ Created hotel owner');

  // Create coupons
  let couponCount = 0;
  for (let i = 0; i < 100; i++) {
    const traveler = travelers[i % travelers.length];
    const hotel = hotels[i % hotels.length];
    const statuses = ['active', 'redeemed', 'expired'];
    const status = i < 50 ? statuses[i % 3] : 'active';
    const code = 'BB-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    await db.coupon.create({
      data: {
        code, userId: traveler.id, hotelId: hotel.id, subscriptionId: 'seed',
        discountPercent: hotel.discountPercent, status,
        generatedAt: new Date(Date.now() - Math.random() * 30 * 86400000),
        expiresAt: new Date(Date.now() + Math.random() * 30 * 86400000),
        redeemedAt: status === 'redeemed' ? new Date(Date.now() - Math.random() * 15 * 86400000) : null,
        priceUsd: 70 + Math.random() * 130,
        priceTzs: (70 + Math.random() * 130) * 2750,
        exchangeRate: 2750,
      },
    });
    couponCount++;
  }
  console.log(`✅ Created ${couponCount} coupons`);

  // Create reviews
  for (const hotel of hotels) {
    const reviewCount = 3 + Math.floor(Math.random() * 6);
    for (let r = 0; r < reviewCount; r++) {
      const traveler = travelers[Math.floor(Math.random() * travelers.length)];
      await db.review.create({
        data: { hotelId: hotel.id, userId: traveler.id, rating: 3 + Math.floor(Math.random() * 3), title: 'Great experience!', body: `We had a wonderful stay at ${hotel.name}. The staff was friendly, the room was clean, and the location was perfect. Would definitely recommend to other travelers.`, isVerified: true, isApproved: true },
      });
    }
  }
  console.log('✅ Created reviews');

  // Create amenities
  const amenities = ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Parking', 'Spa', 'Airport Shuttle', 'Bar', 'Room Service', 'Conference Room', 'Garden', 'Laundry', 'AC', 'TV', 'Minibar'];
  for (const a of amenities) {
    await db.amenity.create({ data: { name: a, icon: a.toLowerCase().replace(/\s+/g, '-'), category: 'general' } }).catch(() => {});
  }
  console.log('✅ Created amenities');

  // Create FAQs
  const faqs = [
    { question: 'How does BusyBeds work?', answer: 'Subscribe to a plan, browse hotels, and generate discount coupons. Show the QR code at check-in to save up to 50% on your hotel stay.', category: 'general' },
    { question: 'What payment methods are supported?', answer: 'We accept Visa/Mastercard via Stripe, and M-Pesa, Tigo Pesa, and Airtel Money via Pesapal.', category: 'payments' },
    { question: 'Can I cancel my subscription?', answer: 'Yes, you can cancel anytime from your settings page. Your coupons remain valid until their expiry date.', category: 'subscription' },
    { question: 'How do I use my coupon?', answer: 'Simply show the QR code or coupon code at hotel reception during check-in. The discount is applied automatically.', category: 'coupons' },
    { question: 'What is the referral program?', answer: 'Share your referral link with friends. When they subscribe, you earn 100 loyalty points and a cash commission.', category: 'referrals' },
  ];
  for (const faq of faqs) {
    await db.fAQ.create({ data: faq });
  }
  console.log('✅ Created FAQs');

  // Create blog posts
  const blogPosts = [
    { slug: 'top-5-hotels-zanzibar', title: 'Top 5 Hotels in Zanzibar for Your Next Vacation', excerpt: 'Discover the best hotels in Zanzibar with exclusive BusyBeds discounts.', content: '<p>Zanzibar is a tropical paradise with pristine beaches and rich culture. Here are our top 5 hotel picks...</p>' },
    { slug: 'save-money-africa-travel', title: 'How to Save Money While Traveling in Africa', excerpt: 'Smart tips for budget-conscious travelers exploring the continent.', content: '<p>Traveling in Africa does not have to break the bank. Here are our best tips...</p>' },
    { slug: 'busybeds-launch', title: 'Welcome to BusyBeds: Premium Hotel Discounts in Africa', excerpt: 'We are excited to launch BusyBeds, your gateway to exclusive hotel discounts.', content: '<p>BusyBeds is here to transform how you book hotels in Africa...</p>' },
  ];
  for (const post of blogPosts) {
    await db.blogPost.create({ data: { ...post, authorId: admin.id, status: 'published', publishedAt: new Date() } });
  }
  console.log('✅ Created blog posts');

  // Create flash deals
  await db.flashDeal.create({ data: { hotelId: hotels[1].id, title: 'Zanzibar Summer Special', discountPercent: 30, startsAt: new Date(), endsAt: new Date(Date.now() + 7 * 86400000), isActive: true } });
  await db.flashDeal.create({ data: { hotelId: hotels[3].id, title: 'Nairobi Weekend Deal', discountPercent: 25, startsAt: new Date(), endsAt: new Date(Date.now() + 3 * 86400000), isActive: true } });
  console.log('✅ Created flash deals');

  // Create site settings
  await db.siteSettings.create({ data: { key: 'currency_rates', value: JSON.stringify({ USD: 1, TZS: 2750, KES: 155 }) } });
  console.log('✅ Created site settings');

  console.log('\n🎉 Seeding complete!');
  console.log('Admin login: admin@busybeds.com / Admin123!');
  console.log('Owner login: owner@busybeds.com / Owner123!');
}

seed().catch(e => { console.error('Seed error:', e); process.exit(1); });
