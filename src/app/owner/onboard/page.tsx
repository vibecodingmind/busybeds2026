'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import {
  Building2, ArrowRight, ArrowLeft, Check, Search, Star,
  MapPin, Hotel, Waves, TreePalm, Castle, Tent, Mountain, Home,
  Sparkles, Shield, TrendingUp, Users, Globe, ChevronRight,
} from 'lucide-react';
import { HOTEL_TYPES, VIBE_TAGS, COUNTRIES, CITIES } from '@/lib/locations';

type Step = 0 | 1 | 2 | 3 | 4 | 5;

interface AvailableHotel {
  id: string;
  name: string;
  city: string;
  country: string;
  category: string;
  starRating: number;
  coverImage?: string;
  images?: string;
}

/* --- Step 0: Welcome / Choose Path --- */
function WelcomeStep({ onPath }: { onPath: (path: 'select' | 'create') => void }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-[#0E5C3B]/10 dark:bg-[#10b981]/10 flex items-center justify-center mx-auto mb-4">
          <Building2 className="h-8 w-8 text-[#0E5C3B] dark:text-[#10b981]" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          Become a Host on BusyBeds
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-md mx-auto">
          Join thousands of hotel owners offering exclusive discounts to travelers across Africa
        </p>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[
          { icon: TrendingUp, title: 'Increase Bookings', desc: 'Reach thousands of travelers looking for deals' },
          { icon: Shield, title: 'Verified Platform', desc: 'Trusted by hotels across East Africa' },
          { icon: Users, title: 'Loyal Guests', desc: 'Build a base of returning discount subscribers' },
        ].map(b => (
          <div key={b.title} className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <b.icon className="h-6 w-6 text-[#0E5C3B] dark:text-[#10b981] mx-auto mb-2" />
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{b.title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{b.desc}</p>
          </div>
        ))}
      </div>

      {/* Path choices */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => onPath('select')}
          className="group p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-[#0E5C3B] dark:hover:border-[#10b981] bg-white dark:bg-gray-900 text-left transition-all hover:shadow-lg"
        >
          <div className="w-12 h-12 rounded-xl bg-[#0E5C3B]/10 dark:bg-[#10b981]/10 flex items-center justify-center mb-4">
            <Search className="h-6 w-6 text-[#0E5C3B] dark:text-[#10b981]" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Claim Your Hotel</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Your hotel is already listed? Find it and claim ownership to manage your listing and offer discounts.
          </p>
          <div className="flex items-center text-[#0E5C3B] dark:text-[#10b981] font-medium text-sm">
            Find my hotel <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => onPath('create')}
          className="group p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-[#C8932A] dark:hover:border-[#C8932A] bg-white dark:bg-gray-900 text-left transition-all hover:shadow-lg"
        >
          <div className="w-12 h-12 rounded-xl bg-[#C8932A]/10 flex items-center justify-center mb-4">
            <Sparkles className="h-6 w-6 text-[#C8932A]" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Add New Hotel</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            List a new hotel on BusyBeds. Fill in the details and start offering exclusive coupon deals.
          </p>
          <div className="flex items-center text-[#C8932A] font-medium text-sm">
            Get started <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>
    </div>
  );
}

/* --- Step 1: Search & Select Existing Hotel --- */
function SelectHotelStep({ onSelect, onBack }: { onSelect: (hotel: AvailableHotel) => void; onBack: () => void }) {
  const [hotels, setHotels] = useState<AvailableHotel[]>([]);
  const [filtered, setFiltered] = useState<AvailableHotel[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/hotels?limit=200&status=active')
      .then(r => r.json())
      .then(d => {
        const list = d.data || [];
        setHotels(list);
        setFiltered(list);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    if (!q) { setFiltered(hotels); return; }
    setFiltered(hotels.filter(h =>
      h.name.toLowerCase().includes(q) ||
      h.city.toLowerCase().includes(q) ||
      h.country.toLowerCase().includes(q)
    ));
  }, [search, hotels]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Find Your Hotel</h2>
        <p className="text-gray-500 dark:text-gray-400">Search for your hotel from our existing listings</p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          placeholder="Search by hotel name, city, or country..."
          className="pl-12 h-12 text-base rounded-xl border-gray-200 dark:border-gray-700"
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
          {filtered.map(h => (
            <button key={h.id}
              onClick={() => onSelect(h)}
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-[#0E5C3B] dark:hover:border-[#10b981] hover:bg-[#0E5C3B]/5 dark:hover:bg-[#10b981]/5 transition-all text-left group"
            >
              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800">
                {h.coverImage ? (
                  <img src={h.coverImage} alt={h.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Hotel className="h-6 w-6 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-gray-900 dark:text-white truncate group-hover:text-[#0E5C3B] dark:group-hover:text-[#10b981]">{h.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3" />{h.city}, {h.country}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="flex">
                    {Array.from({ length: h.starRating }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-[#C8932A] text-[#C8932A]" />
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-400">{h.category}</span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[#0E5C3B] dark:group-hover:text-[#10b981] shrink-0" />
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Hotel className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">No hotels found matching &ldquo;{search}&rdquo;</p>
          <p className="text-gray-400 dark:text-gray-500 text-xs">Try a different search or add your hotel manually</p>
        </div>
      )}

      <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-100 dark:border-gray-800">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </div>
    </div>
  );
}

/* --- Step 2: Hotel Details (for new hotel) --- */
function HotelDetailsStep({ form, setForm, onNext, onBack }: {
  form: any; setForm: (f: any) => void; onNext: () => void; onBack: () => void;
}) {
  const [country, setCountry] = useState(form.country || 'Tanzania');
  const cities = CITIES[country] || [];

  useEffect(() => {
    setForm({ ...form, country, city: '' });
  }, [country]);

  const canNext = form.hotelName && form.city && form.country;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Tell us about your hotel</h2>
        <p className="text-gray-500 dark:text-gray-400">Basic information about your property</p>
      </div>

      <Card className="p-6 space-y-5">
        <div>
          <Label className="text-sm font-medium">Hotel Name *</Label>
          <Input
            value={form.hotelName}
            onChange={e => setForm({ ...form, hotelName: e.target.value })}
            placeholder="e.g. Serena Hotel"
            className="mt-1.5 h-11"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">Country *</Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="mt-1.5 h-11">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium">City *</Label>
            <Select value={form.city} onValueChange={v => setForm({ ...form, city: v })}>
              <SelectTrigger className="mt-1.5 h-11">
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">Property Type</Label>
            <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
              <SelectTrigger className="mt-1.5 h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HOTEL_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium">Star Rating</Label>
            <Select value={String(form.starRating)} onValueChange={v => setForm({ ...form, starRating: parseInt(v) })}>
              <SelectTrigger className="mt-1.5 h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map(n => (
                  <SelectItem key={n} value={String(n)}>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: n }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-[#C8932A] text-[#C8932A]" />
                      ))}
                      <span className="ml-1">{n}-Star</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Short Description</Label>
          <Input
            value={form.descriptionShort}
            onChange={e => setForm({ ...form, descriptionShort: e.target.value })}
            placeholder="A brief tagline for your hotel..."
            className="mt-1.5 h-11"
          />
        </div>

        <div>
          <Label className="text-sm font-medium">Full Description</Label>
          <Textarea
            value={form.descriptionLong}
            onChange={e => setForm({ ...form, descriptionLong: e.target.value })}
            placeholder="Describe your hotel, its unique features, surroundings..."
            className="mt-1.5 min-h-[100px]"
          />
        </div>
      </Card>

      <div className="flex items-center justify-between mt-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!canNext}
          className="bg-[#0E5C3B] hover:bg-[#0E5C3B]/90 text-white"
        >
          Next <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

/* --- Step 3: Discount & Vibe --- */
function DiscountStep({ form, setForm, onNext, onBack }: {
  form: any; setForm: (f: any) => void; onNext: () => void; onBack: () => void;
}) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Set Your Discount</h2>
        <p className="text-gray-500 dark:text-gray-400">What discount will you offer BusyBeds subscribers?</p>
      </div>

      <Card className="p-6 space-y-6">
        <div>
          <Label className="text-sm font-medium">Discount Percentage</Label>
          <div className="flex items-center gap-4 mt-2">
            <input
              type="range"
              min={5}
              max={50}
              step={5}
              value={form.discountPercent}
              onChange={e => setForm({ ...form, discountPercent: parseInt(e.target.value) })}
              className="flex-1 h-2 rounded-full appearance-none bg-gray-200 dark:bg-gray-700 accent-[#0E5C3B]"
            />
            <div className="w-16 text-center">
              <span className="text-2xl font-bold text-[#0E5C3B] dark:text-[#10b981]">{form.discountPercent}</span>
              <span className="text-sm text-gray-500">% off</span>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
            <span>5%</span>
            <span>50%</span>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Vibe Tags</Label>
          <p className="text-xs text-gray-400 mb-2">Select all that describe your hotel</p>
          <div className="flex flex-wrap gap-2">
            {VIBE_TAGS.map(tag => (
              <button key={tag}
                onClick={() => setForm({
                  ...form,
                  vibeTags: form.vibeTags.includes(tag)
                    ? form.vibeTags.filter((t: string) => t !== tag)
                    : [...form.vibeTags, tag]
                })}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  form.vibeTags.includes(tag)
                    ? 'bg-[#0E5C3B] text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Coupon Validity (days)</Label>
          <Select value={String(form.couponValidDays || 30)} onValueChange={v => setForm({ ...form, couponValidDays: parseInt(v) })}>
            <SelectTrigger className="mt-1.5 h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="14">14 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="60">60 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <div className="flex items-center justify-between mt-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <Button onClick={onNext} className="bg-[#0E5C3B] hover:bg-[#0E5C3B]/90 text-white">
          Next <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

/* --- Step 4: Review & Submit --- */
function ReviewStep({ form, selectedHotel, isClaiming, onBack, onSubmit }: {
  form: any; selectedHotel: AvailableHotel | null; isClaiming: boolean;
  onBack: () => void; onSubmit: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    await onSubmit();
    setSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Review & Submit</h2>
        <p className="text-gray-500 dark:text-gray-400">Make sure everything looks good before submitting</p>
      </div>

      <Card className="p-6 space-y-4">
        {isClaiming && selectedHotel ? (
          <>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0E5C3B]/5 dark:bg-[#10b981]/5">
              <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                {selectedHotel.coverImage ? (
                  <img src={selectedHotel.coverImage} alt={selectedHotel.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Hotel className="h-5 w-5 text-gray-300" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{selectedHotel.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />{selectedHotel.city}, {selectedHotel.country}
                </p>
              </div>
              <Badge className="ml-auto bg-[#0E5C3B] text-white">Claiming</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Category:</span> <span className="font-medium">{selectedHotel.category}</span></div>
              <div><span className="text-gray-500">Stars:</span> <span className="font-medium">{selectedHotel.starRating}</span></div>
              <div><span className="text-gray-500">Discount:</span> <span className="font-medium text-[#0E5C3B]">{form.discountPercent}%</span></div>
              <div><span className="text-gray-500">Validity:</span> <span className="font-medium">{form.couponValidDays || 30} days</span></div>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">{form.hotelName}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <MapPin className="h-3 w-3" />{form.city}, {form.country}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Type:</span> <span className="font-medium">{form.category}</span></div>
              <div><span className="text-gray-500">Stars:</span> <span className="font-medium">{form.starRating}</span></div>
              <div><span className="text-gray-500">Discount:</span> <span className="font-medium text-[#0E5C3B]">{form.discountPercent}%</span></div>
              <div><span className="text-gray-500">Validity:</span> <span className="font-medium">{form.couponValidDays || 30} days</span></div>
            </div>
            {form.descriptionShort && (
              <p className="text-sm text-gray-600 dark:text-gray-400 italic">&ldquo;{form.descriptionShort}&rdquo;</p>
            )}
            {form.vibeTags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.vibeTags.map((tag: string) => (
                  <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                ))}
              </div>
            )}
          </>
        )}
      </Card>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mt-4">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          Your application will be reviewed by our team. You&apos;ll receive an email notification once approved. You can then manage your hotel, set room prices, and issue discount coupons.
        </p>
      </div>

      <div className="flex items-center justify-between mt-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-[#0E5C3B] hover:bg-[#0E5C3B]/90 text-white min-w-[160px]"
        >
          {submitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting...
            </div>
          ) : (
            <>Submit Application <Check className="h-4 w-4 ml-2" /></>
          )}
        </Button>
      </div>
    </div>
  );
}

/* --- Step 5: Success --- */
function SuccessStep({ isClaiming }: { isClaiming: boolean }) {
  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="w-20 h-20 rounded-full bg-[#0E5C3B]/10 dark:bg-[#10b981]/10 flex items-center justify-center mx-auto mb-6">
        <Check className="h-10 w-10 text-[#0E5C3B] dark:text-[#10b981]" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
        {isClaiming ? 'Claim Submitted!' : 'Application Submitted!'}
      </h2>
      <p className="text-gray-500 dark:text-gray-400 text-lg mb-8">
        {isClaiming
          ? 'We\'re verifying your hotel ownership. You\'ll be notified once approved.'
          : 'Your hotel listing is being reviewed. You\'ll be notified once it goes live.'}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/owner/dashboard">
          <Button className="bg-[#0E5C3B] hover:bg-[#0E5C3B]/90 text-white w-full sm:w-auto">
            Go to Dashboard
          </Button>
        </Link>
        <Link href="/">
          <Button variant="outline" className="w-full sm:w-auto">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}

/* --- Main Onboarding Page (Airbnb-style multi-step) --- */
export default function OwnerOnboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [path, setPath] = useState<'select' | 'create' | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<AvailableHotel | null>(null);
  const [form, setForm] = useState({
    hotelName: '', city: '', country: 'Tanzania', category: 'Hotel',
    descriptionShort: '', descriptionLong: '', starRating: 3, discountPercent: 15,
    couponValidDays: 30, amenities: [] as string[], vibeTags: [] as string[],
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/owner/onboard');
    }
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#0E5C3B]/30 border-t-[#0E5C3B] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const handlePath = (p: 'select' | 'create') => {
    setPath(p);
    if (p === 'select') {
      setStep(1); // search/select
    } else {
      setStep(2); // new hotel details
    }
  };

  const handleSelectHotel = (hotel: AvailableHotel) => {
    setSelectedHotel(hotel);
    setStep(3); // discount for claimed hotel
  };

  const handleSubmit = async () => {
    try {
      if (path === 'select' && selectedHotel) {
        // Claim existing hotel
        const res = await fetch('/api/owner/onboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'claim',
            hotelId: selectedHotel.id,
            discountPercent: form.discountPercent,
            couponValidDays: form.couponValidDays || 30,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setStep(5);
        } else {
          toast.error(data.error || 'Failed to claim hotel');
        }
      } else {
        // Create new hotel
        const res = await fetch('/api/owner/onboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create',
            ...form,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setStep(5);
        } else {
          toast.error(data.error || 'Failed to submit');
        }
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  };

  // Step progress bar
  const totalSteps = path === 'select' ? 3 : 3; // claim: search→discount→review; create: details→discount→review
  const currentProgress = step === 0 ? 0 : step === 5 ? 100 : path === 'select'
    ? step === 1 ? 33 : step === 3 ? 66 : 100
    : step === 2 ? 33 : step === 3 ? 66 : 100;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F1117]">
      {/* Progress bar */}
      {step > 0 && step < 5 && (
        <div className="sticky top-14 z-20 bg-white dark:bg-[#0F1117] border-b border-gray-100 dark:border-gray-800">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
            <button onClick={() => {
              if (step === 1) setStep(0);
              else if (step === 2) setStep(0);
              else if (step === 3) setStep(path === 'select' ? 1 : 2);
              else if (step === 4) setStep(3);
            }} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0E5C3B] dark:bg-[#10b981] rounded-full transition-all duration-500"
                style={{ width: `${currentProgress}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 font-medium">
              {path === 'select'
                ? step === 1 ? 'Step 1 of 3' : step === 3 ? 'Step 2 of 3' : 'Step 3 of 3'
                : step === 2 ? 'Step 1 of 3' : step === 3 ? 'Step 2 of 3' : 'Step 3 of 3'
              }
            </span>
          </div>
        </div>
      )}

      {/* Step content */}
      {step === 0 && <WelcomeStep onPath={handlePath} />}
      {step === 1 && <SelectHotelStep onSelect={handleSelectHotel} onBack={() => setStep(0)} />}
      {step === 2 && <HotelDetailsStep form={form} setForm={setForm} onNext={() => setStep(3)} onBack={() => setStep(0)} />}
      {step === 3 && <DiscountStep form={form} setForm={setForm} onNext={() => setStep(4)} onBack={() => setStep(path === 'select' ? 1 : 2)} />}
      {step === 4 && <ReviewStep form={form} selectedHotel={selectedHotel} isClaiming={path === 'select'} onBack={() => setStep(3)} onSubmit={handleSubmit} />}
      {step === 5 && <SuccessStep isClaiming={path === 'select'} />}
    </div>
  );
}
