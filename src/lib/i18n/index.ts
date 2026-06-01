export type Locale = 'en' | 'sw';

export const translations: Record<Locale, Record<string, string>> = {
  en: {
    'nav.home': 'Home',
    'nav.hotels': 'Hotels',
    'nav.coupons': 'Coupons',
    'nav.packages': 'Packages',
    'nav.login': 'Log In',
    'nav.register': 'Sign Up',
    'nav.dashboard': 'Dashboard',
    'nav.profile': 'Profile',
    'nav.logout': 'Log Out',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.search': 'Search',
    'common.loading': 'Loading...',
    'common.success': 'Success',
    'common.error': 'Error',
    'common.noData': 'No data found',
    'home.hero.title': 'Save Up to 50% on Hotels',
    'home.hero.subtitle': 'Get exclusive discount coupons for top hotels across Africa',
    'home.hero.cta': 'Explore Hotels',
    'hotels.title': 'Find Your Hotel',
    'hotels.search': 'Search by name, city, or country',
    'hotels.filter': 'Filter',
    'hotels.discount': 'OFF',
    'subscribe.title': 'Choose Your Plan',
    'subscribe.monthly': 'Monthly',
    'subscribe.annual': 'Annual',
    'subscribe.save17': 'Save 17%',
    'subscribe.startFree': 'Start Free',
    'subscribe.subscribe': 'Subscribe',
    'scan.title': 'Scan Coupon',
    'scan.validate': 'Validate',
    'scan.redeem': 'Redeem',
    'scan.enterCode': 'Enter coupon code',
    'coupon.active': 'Active',
    'coupon.redeemed': 'Redeemed',
    'coupon.expired': 'Expired',
    'coupon.cancelled': 'Cancelled',
    'auth.login': 'Log In',
    'auth.register': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.fullName': 'Full Name',
    'auth.forgotPassword': 'Forgot password?',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    'footer.about': 'About',
    'footer.contact': 'Contact',
    'footer.terms': 'Terms',
    'footer.privacy': 'Privacy',
  },
  sw: {
    'nav.home': 'Nyumbani',
    'nav.hotels': 'Hoteli',
    'nav.coupons': 'Kuponi',
    'nav.packages': 'Pakiti',
    'nav.login': 'Ingia',
    'nav.register': 'Jisajili',
    'nav.dashboard': 'Dashibodi',
    'nav.profile': 'Wasifu',
    'nav.logout': 'Toka',
    'common.save': 'Hifadhi',
    'common.cancel': 'Ghairi',
    'common.delete': 'Futa',
    'common.edit': 'Hariri',
    'common.search': 'Tafuta',
    'common.loading': 'Inapakia...',
    'common.success': 'Mafanikio',
    'common.error': 'Hitilafu',
    'common.noData': 'Hakuna data',
    'home.hero.title': 'Okoa Hadhi 50% kwenye Hoteli',
    'home.hero.subtitle': 'Pata kuponi za punguzo kwa hoteli bora barani Afrika',
    'home.hero.cta': 'Tazama Hoteli',
    'hotels.title': 'Tafuta Hoteli Yako',
    'hotels.search': 'Tafuta kwa jina, mji, au nchi',
    'hotels.filter': 'Chuja',
    'hotels.discount': 'PUZUZO',
    'subscribe.title': 'Chagua Mpango Wako',
    'subscribe.monthly': 'Kila Mwezi',
    'subscribe.annual': 'Kila Mwaka',
    'subscribe.save17': 'Okoa 17%',
    'subscribe.startFree': 'Anza Bure',
    'subscribe.subscribe': 'Jisajili',
    'scan.title': 'Soma Kuponi',
    'scan.validate': 'Thibitisha',
    'scan.redeem': 'Kuitumia',
    'scan.enterCode': 'Weka kodi ya kuponi',
    'coupon.active': 'Inatumika',
    'coupon.redeemed': 'Imetumika',
    'coupon.expired': 'Imeisha',
    'coupon.cancelled': 'Imeghairiwa',
    'auth.login': 'Ingia',
    'auth.register': 'Jisajili',
    'auth.email': 'Barua pepe',
    'auth.password': 'Nenosiri',
    'auth.fullName': 'Jina Kamili',
    'auth.forgotPassword': 'Umesahau nenosiri?',
    'auth.noAccount': 'Huna akaunti?',
    'auth.hasAccount': 'Tayari una akaunti?',
    'footer.about': 'Kuhusu',
    'footer.contact': 'Wasiliana',
    'footer.terms': 'Masharti',
    'footer.privacy': 'Faragha',
  },
};

let currentLocale: Locale = 'en';

export function setLocale(locale: Locale) {
  currentLocale = locale;
  if (typeof window !== 'undefined') localStorage.setItem('locale', locale);
}

export function getLocale(): Locale {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('locale') as Locale;
    if (saved && translations[saved]) return saved;
  }
  return currentLocale;
}

export function t(key: string, locale?: Locale): string {
  const loc = locale || getLocale();
  return translations[loc]?.[key] || translations.en[key] || key;
}
