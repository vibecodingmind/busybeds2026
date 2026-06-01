export const COUNTRIES = [
  'Tanzania',
  'Kenya',
  'Uganda',
  'Rwanda',
  'Burundi',
  'Ethiopia',
  'Ghana',
  'Nigeria',
  'South Africa',
  'Zanzibar',
] as const;

export const CITIES: Record<string, string[]> = {
  Tanzania: ['Dar es Salaam', 'Arusha', 'Dodoma', 'Mwanza', 'Zanzibar City'],
  Kenya: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Diani'],
  Uganda: ['Kampala', 'Entebbe', 'Jinja'],
  Rwanda: ['Kigali'],
  Burundi: ['Bujumbura', 'Gitega'],
  Ethiopia: ['Addis Ababa', 'Lalibela', 'Bahir Dar'],
  Ghana: ['Accra', 'Kumasi', 'Cape Coast'],
  Nigeria: ['Lagos', 'Abuja', 'Port Harcourt'],
  'South Africa': ['Cape Town', 'Johannesburg', 'Durban', 'Pretoria'],
  Zanzibar: ['Stone Town', 'Nungwi', 'Kendwa', 'Paje'],
};

export const VIBE_TAGS = [
  'Romantic',
  'Family-friendly',
  'Business',
  'Budget-friendly',
  'Beachfront',
  'Mountain view',
  'Adventure',
  'Cultural',
  'Eco-friendly',
  'Luxury',
  'Wellness',
  'Party',
] as const;

export const HOTEL_TYPES = [
  'Hotel',
  'Villa',
  'BnB',
  'Apartment',
  'Lodge',
  'Resort',
] as const;
