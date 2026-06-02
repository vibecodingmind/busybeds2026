'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Star,
  Building2,
  Globe,
  X,
  Download,
  CheckSquare,
  Square,
  Loader2,
  MapPin,
  Image as ImageIcon,
  Sparkles,
  Crown,
  Gem,
  Hotel,
  Home,
  Tent,
  Waves,
  Building,
  EyeOff,
  Eye,
  Trash,
} from 'lucide-react';
import { toast } from 'sonner';
import { COUNTRIES, CITIES, HOTEL_TYPES } from '@/lib/locations';

/* ─── Types ─── */
interface Hotel {
  id: string;
  name: string;
  slug: string;
  city: string;
  country: string;
  category: string;
  region: string;
  tier: string;
  status: string;
  partnershipStatus: string;
  starRating: number;
  descriptionShort: string;
  discountPercent: number;
  couponValidDays: number;
  phone: string | null;
  address: string | null;
  websiteUrl: string | null;
  coverImage: string | null;
  images: string;
  importSource: string | null;
  createdAt: string;
}

interface HotelFormData {
  name: string;
  slug: string;
  city: string;
  country: string;
  category: string;
  region: string;
  tier: string;
  status: string;
  partnershipStatus: string;
  starRating: number;
  descriptionShort: string;
  discountPercent: number;
  couponValidDays: number;
  phone: string;
  address: string;
  websiteUrl: string;
  coverImage: string;
}

interface GooglePlace {
  placeId: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  lat?: number;
  lng?: number;
  photoUrl?: string;
  photos?: string[];
  types?: string[];
  userRatingsTotal?: number;
  selected?: boolean;
  tier?: string;
  category?: string;
}

const EMPTY_FORM: HotelFormData = {
  name: '',
  slug: '',
  city: '',
  country: 'Tanzania',
  category: 'Hotel',
  region: '',
  tier: 'standard',
  status: 'active',
  partnershipStatus: 'LISTING_ONLY',
  starRating: 3,
  descriptionShort: '',
  discountPercent: 15,
  couponValidDays: 30,
  phone: '',
  address: '',
  websiteUrl: '',
  coverImage: '',
};

const REGIONS = ['East Africa', 'West Africa', 'Southern Africa', 'North Africa', 'Central Africa'];

const TIER_CONFIG: Record<string, { label: string; icon: any; color: string; bgColor: string }> = {
  standard: { label: 'Standard', icon: Star, color: 'text-blue-600', bgColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  premium: { label: 'Premium', icon: Crown, color: 'text-amber-600', bgColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
  luxury: { label: 'Luxury', icon: Gem, color: 'text-purple-600', bgColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
};

const CATEGORY_CONFIG: Record<string, { icon: any; label: string }> = {
  Hotel: { icon: Hotel, label: 'Hotel' },
  Villa: { icon: Building2, label: 'Villa' },
  BnB: { icon: Home, label: 'BnB' },
  Apartment: { icon: Building, label: 'Apartment' },
  Lodge: { icon: Tent, label: 'Lodge' },
  Resort: { icon: Waves, label: 'Resort' },
};

/* ─── Helpers ─── */
function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function tierBadgeClass(tier: string) {
  return TIER_CONFIG[tier]?.bgColor || TIER_CONFIG.standard.bgColor;
}

function partnershipBadgeClass(ps: string) {
  switch (ps) {
    case 'ACTIVE':
      return 'bg-emerald/15 text-emerald dark:bg-emerald/25 dark:text-emerald-300';
    case 'PENDING':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    case 'LISTING_ONLY':
      return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    case 'NONE':
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  }
}

function autoDetectRegion(city: string, country: string): string {
  const REGIONS_MAP: Record<string, string[]> = {
    'East Africa': ['Tanzania', 'Kenya', 'Uganda', 'Rwanda', 'Burundi', 'Ethiopia', 'Zanzibar'],
    'West Africa': ['Ghana', 'Nigeria'],
    'Southern Africa': ['South Africa'],
  };

  for (const [region, countries] of Object.entries(REGIONS_MAP)) {
    if (countries.some(c => country.toLowerCase().includes(c.toLowerCase()))) {
      return region;
    }
  }
  return country || '';
}

/* ─── Component ─── */
export default function AdminHotelsPage() {
  // Active view state
  const [activeView, setActiveView] = useState<'list' | 'import'>('list');

  // List state
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  // Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [partnershipFilter, setPartnershipFilter] = useState('all');
  const [citySearch, setCitySearch] = useState('');

  // Add/Edit modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [form, setForm] = useState<HotelFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<'activate' | 'deactivate' | 'delete' | null>(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);

  // Import state
  const [importQuery, setImportQuery] = useState('');
  const [importCity, setImportCity] = useState('');
  const [importCountry, setImportCountry] = useState('Tanzania');
  const [importRegion, setImportRegion] = useState('East Africa');
  const [importDefaultTier, setImportDefaultTier] = useState('standard');
  const [importDefaultCategory, setImportDefaultCategory] = useState('Hotel');
  const [importResults, setImportResults] = useState<GooglePlace[]>([]);
  const [importSearching, setImportSearching] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });

  /* ─── Fetch hotels ─── */
  const fetchHotels = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
      if (tierFilter && tierFilter !== 'all') params.set('tier', tierFilter);
      if (categoryFilter && categoryFilter !== 'all') params.set('category', categoryFilter);
      params.set('page', String(page));
      params.set('limit', String(limit));

      const res = await fetch(`/api/admin/hotels?${params.toString()}`);
      const data = await res.json();

      let filtered = data.data || [];
      // Client-side city filter
      if (citySearch) {
        filtered = filtered.filter((h: Hotel) =>
          h.city.toLowerCase().includes(citySearch.toLowerCase())
        );
      }

      setHotels(filtered);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {
      toast.error('Failed to load hotels');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, tierFilter, categoryFilter, citySearch, page]);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set()); // Clear selection when filters change
  }, [search, statusFilter, tierFilter, categoryFilter, citySearch]);

  /* ─── Auto-detect region when country changes in Add form ─── */
  useEffect(() => {
    if (!editingHotel && form.country) {
      const detected = autoDetectRegion(form.city, form.country);
      if (detected) {
        setForm(prev => ({ ...prev, region: detected }));
      }
    }
  }, [form.country, form.city, editingHotel]);

  /* ─── Modal helpers ─── */
  const openAddModal = () => {
    setEditingHotel(null);
    setForm({ ...EMPTY_FORM, region: autoDetectRegion('', 'Tanzania') });
    setSlugManuallyEdited(false);
    setModalOpen(true);
  };

  const openEditModal = (hotel: Hotel) => {
    setEditingHotel(hotel);
    setForm({
      name: hotel.name,
      slug: hotel.slug,
      city: hotel.city,
      country: hotel.country,
      category: hotel.category || 'Hotel',
      region: hotel.region || '',
      tier: hotel.tier,
      status: hotel.status,
      partnershipStatus: hotel.partnershipStatus,
      starRating: hotel.starRating,
      descriptionShort: hotel.descriptionShort || '',
      discountPercent: hotel.discountPercent,
      couponValidDays: hotel.couponValidDays,
      phone: hotel.phone || '',
      address: hotel.address || '',
      websiteUrl: hotel.websiteUrl || '',
      coverImage: hotel.coverImage || '',
    });
    setSlugManuallyEdited(true);
    setModalOpen(true);
  };

  const handleNameChange = (name: string) => {
    setForm((prev) => {
      const updated = { ...prev, name };
      if (!slugManuallyEdited) {
        updated.slug = slugify(name);
      }
      return updated;
    });
  };

  /* ─── Save hotel ─── */
  const handleSave = async () => {
    if (!form.name || !form.city || !form.country) {
      toast.error('Name, city, and country are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        slug: form.slug || slugify(form.name),
        region: form.region || autoDetectRegion(form.city, form.country),
        phone: form.phone || null,
        address: form.address || null,
        websiteUrl: form.websiteUrl || null,
        coverImage: form.coverImage || null,
      };

      if (editingHotel) {
        const res = await fetch(`/api/admin/hotels/${editingHotel.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!data.success) {
          toast.error(data.error || 'Failed to update hotel');
          return;
        }
        toast.success('Hotel updated');
      } else {
        const res = await fetch('/api/admin/hotels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!data.success) {
          toast.error(data.error || 'Failed to create hotel');
          return;
        }
        toast.success('Hotel created');
      }
      setModalOpen(false);
      fetchHotels();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  /* ─── Delete hotel ─── */
  const handleDelete = async () => {
    if (!deletingId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/hotels/${deletingId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || 'Failed to delete hotel');
        return;
      }
      toast.success('Hotel deleted');
      setDeletingId(null);
      fetchHotels();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setDeleting(false);
    }
  };

  /* ─── Toggle partnership ─── */
  const togglePartnership = async (hotel: Hotel) => {
    const newStatus = hotel.partnershipStatus === 'ACTIVE' ? 'LISTING_ONLY' : 'ACTIVE';
    try {
      if (newStatus === 'ACTIVE') {
        const res = await fetch(`/api/admin/hotels/${hotel.id}/approve-kyc`, { method: 'POST' });
        const data = await res.json();
        if (!data.success) {
          toast.error(data.error || 'Failed to approve');
          return;
        }
        toast.success('Partnership activated');
      } else {
        const res = await fetch(`/api/admin/hotels/${hotel.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ partnershipStatus: 'LISTING_ONLY' }),
        });
        const data = await res.json();
        if (!data.success) {
          toast.error(data.error || 'Failed to deactivate');
          return;
        }
        toast.success('Partnership deactivated');
      }
      fetchHotels();
    } catch {
      toast.error('Something went wrong');
    }
  };

  /* ─── Google Places Import ─── */
  const handleSearchGoogle = async () => {
    if (!importQuery.trim()) {
      toast.error('Enter a search query');
      return;
    }
    setImportSearching(true);
    setImportResults([]);
    try {
      const params = new URLSearchParams();
      params.set('query', importQuery);
      if (importCity) params.set('city', importCity);
      if (importRegion) params.set('region', importRegion);
      params.set('maxResults', '60');

      const res = await fetch(`/api/admin/hotels/import-search?${params.toString()}`);
      const data = await res.json();

      if (data.success && data.data) {
        const results = data.data.map((r: GooglePlace) => ({
          ...r,
          selected: false,
          tier: importDefaultTier,
          category: importDefaultCategory,
        }));
        setImportResults(results);
        toast.success(`Found ${results.length} hotels`);
      } else {
        toast.error(data.error || 'No results found');
      }
    } catch {
      toast.error('Search failed');
    } finally {
      setImportSearching(false);
    }
  };

  const toggleSelectAll = () => {
    const allSelected = importResults.every(r => r.selected);
    setImportResults(prev => prev.map(r => ({ ...r, selected: !allSelected })));
  };

  const toggleSelect = (index: number) => {
    setImportResults(prev => prev.map((r, i) => i === index ? { ...r, selected: !r.selected } : r));
  };

  const updatePlaceTier = (index: number, tier: string) => {
    setImportResults(prev => prev.map((r, i) => i === index ? { ...r, tier } : r));
  };

  const updatePlaceCategory = (index: number, category: string) => {
    setImportResults(prev => prev.map((r, i) => i === index ? { ...r, category } : r));
  };

  const handleBulkImport = async () => {
    const selected = importResults.filter(r => r.selected);
    if (selected.length === 0) {
      toast.error('Select at least one hotel to import');
      return;
    }

    setImporting(true);
    setImportProgress({ current: 0, total: selected.length });

    try {
      const hotels = selected.map(place => ({
        placeId: place.placeId,
        name: place.name,
        address: place.address,
        phone: place.phone,
        website: place.website,
        rating: place.rating,
        lat: place.lat,
        lng: place.lng,
        photos: place.photos,
        tier: place.tier || importDefaultTier,
        category: place.category || importDefaultCategory,
      }));

      const res = await fetch('/api/admin/hotels/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotels,
          defaultTier: importDefaultTier,
          defaultCategory: importDefaultCategory,
          defaultRegion: importRegion,
        }),
      });

      const data = await res.json();

      if (data.success) {
        const { summary, results: importResults } = data;
        toast.success(`Imported ${summary.imported} hotels (${summary.skipped} skipped, ${summary.failed} failed)`);
        setImportProgress({ current: selected.length, total: selected.length });

        // Mark imported ones in the list
        setImportResults(prev => prev.map(r => {
          const result = importResults.find((ir: any) => ir.name === r.name);
          if (result && result.status === 'imported') {
            return { ...r, imported: true };
          }
          if (result && result.status === 'skipped') {
            return { ...r, alreadyExists: true };
          }
          return r;
        }));

        fetchHotels();
      } else {
        toast.error(data.error || 'Import failed');
      }
    } catch {
      toast.error('Import failed');
    } finally {
      setImporting(false);
    }
  };

  const selectedCount = importResults.filter(r => r.selected).length;

  /* ─── Bulk action helpers ─── */
  const toggleHotelSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAllHotels = () => {
    const visibleHotelIds = hotels
      .filter(h => partnershipFilter === 'all' || h.partnershipStatus === partnershipFilter)
      .map(h => h.id);

    if (visibleHotelIds.every(id => selectedIds.has(id))) {
      // Deselect all visible
      setSelectedIds(prev => {
        const next = new Set(prev);
        visibleHotelIds.forEach(id => next.delete(id));
        return next;
      });
    } else {
      // Select all visible
      setSelectedIds(prev => {
        const next = new Set(prev);
        visibleHotelIds.forEach(id => next.add(id));
        return next;
      });
    }
  };

  const allVisibleSelected = (() => {
    const visibleHotelIds = hotels
      .filter(h => partnershipFilter === 'all' || h.partnershipStatus === partnershipFilter);
    return visibleHotelIds.length > 0 && visibleHotelIds.every(h => selectedIds.has(h.id));
  })();

  const handleBulkAction = async () => {
    if (!bulkAction || selectedIds.size === 0) return;
    setBulkProcessing(true);
    try {
      const res = await fetch('/api/admin/hotels/bulk-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: bulkAction, hotelIds: Array.from(selectedIds) }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || 'Bulk action failed');
        return;
      }
      toast.success(data.message);
      setSelectedIds(new Set());
      setBulkAction(null);
      setBulkConfirmOpen(false);
      fetchHotels();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setBulkProcessing(false);
    }
  };

  /* ─── Render ─── */
  return (
    <div className="space-y-8">
      {/* Header - Airbnb style with lots of breathing room */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-gray-900 dark:text-white">Hotels</h1>
          <p className="text-[15px] text-gray-500 dark:text-gray-400 mt-1.5">{total} hotels in your portfolio</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={activeView === 'import' ? 'default' : 'outline'}
            className={`h-11 px-5 rounded-xl text-sm font-medium ${activeView === 'import' ? 'bg-[#ea4d60] hover:bg-[#d4424f] text-white' : 'border-gray-300 text-gray-700 hover:border-gray-900 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:text-gray-100'}`}
            onClick={() => setActiveView('import')}
          >
            <Globe className="h-4 w-4 mr-2" />
            Import from Google
          </Button>
          <Button className="h-11 px-5 rounded-xl text-sm font-medium bg-[#222] hover:bg-[#000] text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100" onClick={openAddModal}>
            <Plus className="h-4 w-4 mr-2" />
            Add Hotel
          </Button>
        </div>
      </div>

      {/* ===== HOTEL LIST VIEW ===== */}
      {activeView === 'list' && (
        <>
          {/* Filters - Airbnb search bar style */}
          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-gray-200/80 dark:border-gray-800 p-6 shadow-sm">
            <div className="space-y-5">
              {/* Search Row - Airbnb style search bar */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search hotels by name..."
                    className="pl-11 h-11 rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-[#222] text-[15px]"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="relative min-w-[200px] sm:w-[240px]">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Filter by city..."
                    className="pl-11 h-11 rounded-xl border-gray-300 dark:border-gray-700 bg-white dark:bg-[#222] text-[15px]"
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                  />
                </div>
              </div>
              {/* Filter Dropdowns Row - Airbnb pill-style filters */}
              <div className="flex flex-wrap gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px] h-10 rounded-xl border-gray-300 dark:border-gray-700 text-sm">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={tierFilter} onValueChange={setTierFilter}>
                  <SelectTrigger className="w-[150px] h-10 rounded-xl border-gray-300 dark:border-gray-700 text-sm">
                    <SelectValue placeholder="Tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="luxury">Luxury</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[150px] h-10 rounded-xl border-gray-300 dark:border-gray-700 text-sm">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {HOTEL_TYPES.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={partnershipFilter} onValueChange={setPartnershipFilter}>
                  <SelectTrigger className="w-[170px] h-10 rounded-xl border-gray-300 dark:border-gray-700 text-sm">
                    <SelectValue placeholder="Partnership" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Partnerships</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="LISTING_ONLY">Listing Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Bulk Action Bar */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  {selectedIds.size} hotel{selectedIds.size !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-emerald text-emerald hover:bg-emerald hover:text-white"
                  onClick={() => { setBulkAction('activate'); setBulkConfirmOpen(true); }}
                  disabled={bulkProcessing}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Activate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-white"
                  onClick={() => { setBulkAction('deactivate'); setBulkConfirmOpen(true); }}
                  disabled={bulkProcessing}
                >
                  <EyeOff className="h-4 w-4 mr-1" />
                  Deactivate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-destructive text-destructive hover:bg-destructive hover:text-white"
                  onClick={() => { setBulkAction('delete'); setBulkConfirmOpen(true); }}
                  disabled={bulkProcessing}
                >
                  <Trash className="h-4 w-4 mr-1" />
                  Delete
                </Button>
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIds(new Set())}
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
            </div>
          )}

          {/* Bulk Action Confirm Dialog */}
          <AlertDialog open={bulkConfirmOpen} onOpenChange={setBulkConfirmOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {bulkAction === 'delete' ? 'Delete Selected Hotels' : bulkAction === 'activate' ? 'Activate Selected Hotels' : 'Deactivate Selected Hotels'}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {bulkAction === 'delete' ? (
                    <>Are you sure you want to <strong>permanently delete</strong> {selectedIds.size} hotel{selectedIds.size !== 1 ? 's' : ''}? This action cannot be undone and will remove all associated data including coupons, reviews, and room types.</>
                  ) : bulkAction === 'activate' ? (
                    <>Are you sure you want to <strong>activate</strong> {selectedIds.size} hotel{selectedIds.size !== 1 ? 's' : ''}? They will become visible to users on the platform.</>
                  ) : (
                    <>Are you sure you want to <strong>deactivate</strong> {selectedIds.size} hotel{selectedIds.size !== 1 ? 's' : ''}? They will be hidden from users on the platform.</>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={bulkProcessing}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className={
                    bulkAction === 'delete'
                      ? 'bg-destructive hover:bg-destructive/90 text-white'
                      : bulkAction === 'activate'
                      ? 'bg-emerald hover:bg-emerald/90 text-white'
                      : 'bg-amber-500 hover:bg-amber-600 text-white'
                  }
                  onClick={handleBulkAction}
                  disabled={bulkProcessing}
                >
                  {bulkProcessing ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
                  ) : (
                    <>
                      {bulkAction === 'delete' && <Trash className="h-4 w-4 mr-2" />}
                      {bulkAction === 'activate' && <Eye className="h-4 w-4 mr-2" />}
                      {bulkAction === 'deactivate' && <EyeOff className="h-4 w-4 mr-2" />}
                      {bulkAction === 'delete' ? 'Delete All' : bulkAction === 'activate' ? 'Activate All' : 'Deactivate All'}
                    </>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Hotel List - Airbnb style */}
          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm">
            <div className="p-6">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : hotels.length === 0 ? (
            <div className="py-12 text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-lg font-medium text-muted-foreground">No hotels found</p>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or add a new hotel.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Select All Header Row */}
              <div className="flex items-center gap-4 px-5 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                <button
                  onClick={toggleSelectAllHotels}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {allVisibleSelected ? (
                    <CheckSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                  {allVisibleSelected ? 'Deselect All' : 'Select All'}
                </button>
                <span className="text-xs text-muted-foreground">
                  {hotels.filter(h => partnershipFilter === 'all' || h.partnershipStatus === partnershipFilter).length} hotels on this page
                </span>
              </div>
              {hotels
                .filter((h) => {
                  if (partnershipFilter !== 'all' && h.partnershipStatus !== partnershipFilter) return false;
                  return true;
                })
                .map((hotel) => {
                  const TierIcon = TIER_CONFIG[hotel.tier]?.icon || Star;
                  const CatIcon = CATEGORY_CONFIG[hotel.category]?.icon || Building2;
                  const images = (() => {
                    try { return JSON.parse(hotel.images || '[]'); } catch { return []; }
                  })();

                  return (
                    <div key={hotel.id} className={`flex items-center gap-5 p-5 rounded-2xl border border-gray-200/70 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm transition-all ${selectedIds.has(hotel.id) ? 'bg-blue-50/60 dark:bg-blue-900/10 ring-1 ring-blue-200 dark:ring-blue-800 border-blue-200 dark:border-blue-800' : ''}`}>
                      <div className="flex items-center gap-4 w-full">
                        {/* Selection Checkbox */}
                        <button
                          onClick={() => toggleHotelSelect(hotel.id)}
                          className={`shrink-0 w-6 h-6 rounded flex items-center justify-center transition-colors ${
                            selectedIds.has(hotel.id)
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                          }`}
                        >
                          {selectedIds.has(hotel.id) ? (
                            <CheckSquare className="h-5 w-5" />
                          ) : (
                            <Square className="h-5 w-5" />
                          )}
                        </button>
                        {/* Thumbnail */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0 shadow-sm">
                          {hotel.coverImage ? (
                            <img src={hotel.coverImage} alt={hotel.name} className="w-full h-full object-cover" />
                          ) : images.length > 0 ? (
                            <img src={images[0]} alt={hotel.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Hotel Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold truncate text-[15px] text-gray-900 dark:text-white">{hotel.name}</p>
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: hotel.starRating }).map((_, i) => (
                                <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            <MapPin className="h-3.5 w-3.5 inline mr-1 opacity-60" />
                            {hotel.city}, {hotel.country}
                            {hotel.region && <span className="ml-2 text-xs text-gray-400">({hotel.region})</span>}
                            {hotel.phone && <span className="ml-3 text-xs">📞 {hotel.phone}</span>}
                          </p>
                          {hotel.importSource && (
                            <p className="text-xs text-blue-500 mt-0.5">Imported from Google Maps</p>
                          )}
                        </div>

                        {/* Badges + Actions */}
                        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                          <Badge className="text-xs flex items-center gap-1">
                            <CatIcon className="h-3 w-3" />
                            {hotel.category}
                          </Badge>
                          <Badge className={tierBadgeClass(hotel.tier)}>
                            <TierIcon className="h-3 w-3 mr-1" />
                            {hotel.tier}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={
                              hotel.status === 'active'
                                ? 'border-emerald text-emerald'
                                : 'border-destructive text-destructive'
                            }
                          >
                            {hotel.status}
                          </Badge>
                          <Badge className={partnershipBadgeClass(hotel.partnershipStatus)}>
                            {hotel.partnershipStatus === 'LISTING_ONLY' ? 'Listing' : hotel.partnershipStatus}
                          </Badge>
                          {hotel.discountPercent > 0 && (
                            <Badge className="bg-emerald/15 text-emerald">
                              {hotel.discountPercent}% off
                            </Badge>
                          )}

                          <div className="flex items-center gap-1 ml-2">
                            <Button variant="ghost" size="icon" title="Toggle partnership" onClick={() => togglePartnership(hotel)}>
                              <CheckCircle className={`h-4 w-4 ${hotel.partnershipStatus === 'ACTIVE' ? 'text-emerald' : 'text-muted-foreground'}`} />
                            </Button>
                            <Button variant="ghost" size="icon" title="Edit hotel" onClick={() => openEditModal(hotel)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog open={deletingId === hotel.id} onOpenChange={(open) => { if (!open) setDeletingId(null); }}>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" title="Delete hotel" onClick={() => setDeletingId(hotel.id)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Hotel</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete <strong>{hotel.name}</strong>? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                                  <AlertDialogAction className="bg-destructive hover:bg-destructive/90 text-white" onClick={handleDelete} disabled={deleting}>
                                    {deleting ? 'Deleting...' : 'Delete'}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 pt-5 border-t border-gray-100 dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Page <span className="font-semibold text-gray-900 dark:text-white">{page}</span> of {totalPages}
              </p>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="h-9 px-4 rounded-xl" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <Button variant="outline" size="sm" className="h-9 px-4 rounded-xl" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
            </div>
          </div>
        </>
      )}

      {/* ===== GOOGLE PLACES IMPORT VIEW ===== */}
      {activeView === 'import' && (
        <div className="space-y-8">
          {/* Search Panel */}
          <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-gray-200/80 dark:border-gray-800 p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
              <Globe className="h-5 w-5 text-[#ea4d60]" />
              Search Hotels on Google Maps
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <Label>Search Query *</Label>
                <Input
                  placeholder="e.g. hotels, resorts, lodges..."
                  value={importQuery}
                  onChange={(e) => setImportQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchGoogle()}
                />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  placeholder="e.g. Dar es Salaam"
                  value={importCity}
                  onChange={(e) => setImportCity(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchGoogle()}
                />
              </div>
              <div className="space-y-2">
                <Label>Region</Label>
                <Select value={importRegion} onValueChange={setImportRegion}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONS.map(r => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 flex items-end">
                <Button
                  className="w-full bg-[#ea4d60] hover:bg-[#d4424f] text-white"
                  onClick={handleSearchGoogle}
                  disabled={importSearching}
                >
                  {importSearching ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Searching...</>
                  ) : (
                    <><Search className="h-4 w-4 mr-2" /> Search</>
                  )}
                </Button>
              </div>
            </div>

            {/* Default settings for import */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <div className="space-y-2">
                <Label>Default Tier for Imports</Label>
                <Select value={importDefaultTier} onValueChange={(v) => {
                  setImportDefaultTier(v);
                  setImportResults(prev => prev.map(r => ({ ...r, tier: v })));
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">
                      <span className="flex items-center gap-2"><Star className="h-3 w-3 text-blue-500" /> Standard</span>
                    </SelectItem>
                    <SelectItem value="premium">
                      <span className="flex items-center gap-2"><Crown className="h-3 w-3 text-amber-500" /> Premium</span>
                    </SelectItem>
                    <SelectItem value="luxury">
                      <span className="flex items-center gap-2"><Gem className="h-3 w-3 text-purple-500" /> Luxury</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Default Category for Imports</Label>
                <Select value={importDefaultCategory} onValueChange={(v) => {
                  setImportDefaultCategory(v);
                  setImportResults(prev => prev.map(r => ({ ...r, category: v })));
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HOTEL_TYPES.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          {importResults.length > 0 && (
            <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-gray-200/80 dark:border-gray-800 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold">
                    {importResults.length} results found
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {selectedCount} selected
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={toggleSelectAll}>
                    {importResults.every(r => r.selected) ? (
                      <><CheckSquare className="h-4 w-4 mr-1" /> Deselect All</>
                    ) : (
                      <><Square className="h-4 w-4 mr-1" /> Select All ({importResults.length})</>
                    )}
                  </Button>
                  <Button
                    className="bg-emerald hover:bg-emerald/90 text-emerald-foreground"
                    size="sm"
                    onClick={handleBulkImport}
                    disabled={importing || selectedCount === 0}
                  >
                    {importing ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Importing {importProgress.current}/{importProgress.total}...</>
                    ) : (
                      <><Download className="h-4 w-4 mr-2" /> Import {selectedCount} Hotel{selectedCount > 1 ? 's' : ''}</>
                    )}
                  </Button>
                </div>
              </div>

              {importing && (
                <div className="mb-4">
                  <Progress value={(importProgress.current / importProgress.total) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Importing {importProgress.current} of {importProgress.total} hotels... Photos are being downloaded to the server.
                  </p>
                </div>
              )}

              {/* Results Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {importResults.map((place, index) => {
                  const TierIcon = TIER_CONFIG[place.tier || 'standard']?.icon || Star;
                  return (
                    <Card
                      key={place.placeId}
                      className={`overflow-hidden transition-all ${
                        place.selected
                          ? 'ring-2 ring-[#ea4d60] shadow-md'
                          : 'hover:shadow-md'
                      } ${place.imported ? 'opacity-60' : ''} ${
                        (place as any).alreadyExists ? 'ring-2 ring-amber-400' : ''
                      }`}
                    >
                      {/* Photo */}
                      <div className="relative h-36 bg-gray-100 dark:bg-gray-800">
                        {place.photoUrl ? (
                          <img src={place.photoUrl} alt={place.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-10 w-10 text-gray-400" />
                          </div>
                        )}
                        {/* Select checkbox overlay */}
                        <div className="absolute top-2 left-2">
                          <button
                            onClick={() => toggleSelect(index)}
                            className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                              place.selected
                                ? 'bg-[#ea4d60] text-white'
                                : 'bg-white/80 text-gray-600 hover:bg-white'
                            }`}
                          >
                            {place.selected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                          </button>
                        </div>
                        {/* Rating badge */}
                        {place.rating && (
                          <div className="absolute top-2 right-2 bg-white/90 dark:bg-gray-900/90 rounded-md px-2 py-0.5 flex items-center gap-1">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-semibold">{place.rating}</span>
                          </div>
                        )}
                        {/* Status badges */}
                        {place.imported && (
                          <div className="absolute bottom-2 right-2 bg-emerald text-white text-xs px-2 py-0.5 rounded-md font-medium">
                            Imported
                          </div>
                        )}
                        {(place as any).alreadyExists && (
                          <div className="absolute bottom-2 right-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-md font-medium">
                            Exists
                          </div>
                        )}
                        {/* Photo count */}
                        {place.photos && place.photos.length > 0 && (
                          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-md flex items-center gap-1">
                            <ImageIcon className="h-3 w-3" /> {place.photos.length} photos
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-3">
                        <p className="font-semibold text-sm truncate">{place.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{place.address}</p>
                        {place.phone && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">📞 {place.phone}</p>
                        )}

                        {/* Per-hotel tier and category selectors */}
                        <div className="flex gap-2 mt-2">
                          <Select value={place.tier || 'standard'} onValueChange={(v) => updatePlaceTier(index, v)}>
                            <SelectTrigger className="h-7 text-xs flex-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="standard">
                                <span className="flex items-center gap-1"><Star className="h-3 w-3 text-blue-500" /> Std</span>
                              </SelectItem>
                              <SelectItem value="premium">
                                <span className="flex items-center gap-1"><Crown className="h-3 w-3 text-amber-500" /> Prem</span>
                              </SelectItem>
                              <SelectItem value="luxury">
                                <span className="flex items-center gap-1"><Gem className="h-3 w-3 text-purple-500" /> Lux</span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <Select value={place.category || 'Hotel'} onValueChange={(v) => updatePlaceCategory(index, v)}>
                            <SelectTrigger className="h-7 text-xs flex-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {HOTEL_TYPES.map(t => (
                                <SelectItem key={t} value={t}>{t}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty state for import */}
          {importResults.length === 0 && !importSearching && (
            <div className="bg-white dark:bg-[#1a1d27] rounded-2xl border border-gray-200/80 dark:border-gray-800 p-12 shadow-sm text-center">
              <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-lg font-medium text-muted-foreground">Search Google Maps for Hotels</p>
              <p className="text-sm text-muted-foreground mt-1">
                Enter a query like &quot;hotels in Dar es Salaam&quot; to find up to 60 hotels to import. Photos will be downloaded directly to the server.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ─── Add / Edit Modal ─── */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingHotel ? 'Edit Hotel' : 'Add Hotel'}</DialogTitle>
            <DialogDescription>
              {editingHotel ? 'Update hotel details below.' : 'Fill in the details to create a new hotel.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Row 1: Name + Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" placeholder="Hotel name" value={form.name} onChange={(e) => handleNameChange(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" placeholder="auto-generated-from-name" value={form.slug} onChange={(e) => { setSlugManuallyEdited(true); setForm((p) => ({ ...p, slug: e.target.value })); }} />
              </div>
            </div>

            {/* Row 2: Category + Tier */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HOTEL_TYPES.map(t => {
                      const cfg = CATEGORY_CONFIG[t];
                      return (
                        <SelectItem key={t} value={t}>
                          <span className="flex items-center gap-2">
                            {cfg && <cfg.icon className="h-3.5 w-3.5" />} {t}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tier *</Label>
                <Select value={form.tier} onValueChange={(v) => setForm((p) => ({ ...p, tier: v }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">
                      <span className="flex items-center gap-2"><Star className="h-3.5 w-3.5 text-blue-500" /> Standard</span>
                    </SelectItem>
                    <SelectItem value="premium">
                      <span className="flex items-center gap-2"><Crown className="h-3.5 w-3.5 text-amber-500" /> Premium</span>
                    </SelectItem>
                    <SelectItem value="luxury">
                      <span className="flex items-center gap-2"><Gem className="h-3.5 w-3.5 text-purple-500" /> Luxury</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 3: Country + City + Region */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Country *</Label>
                <Select value={form.country} onValueChange={(v) => setForm((p) => ({ ...p, country: v, city: '' }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>City *</Label>
                {CITIES[form.country] ? (
                  <Select value={form.city} onValueChange={(v) => setForm((p) => ({ ...p, city: v }))}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {CITIES[form.country].map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input placeholder="City" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} />
                )}
              </div>
              <div className="space-y-2">
                <Label>Region</Label>
                <Select value={form.region} onValueChange={(v) => setForm((p) => ({ ...p, region: v }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Auto-detected" />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONS.map(r => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 4: Status + Partnership + Star Rating */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Partnership</Label>
                <Select value={form.partnershipStatus} onValueChange={(v) => setForm((p) => ({ ...p, partnershipStatus: v }))}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LISTING_ONLY">Listing Only</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="ACTIVE">Active Partner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Star Rating</Label>
                <Select value={String(form.starRating)} onValueChange={(v) => setForm((p) => ({ ...p, starRating: parseInt(v) }))}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <SelectItem key={n} value={String(n)}>{n} Star{n > 1 ? 's' : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 5: Discount + Coupon Days */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discountPercent">Discount %</Label>
                <Input id="discountPercent" type="number" min={0} max={100} value={form.discountPercent} onChange={(e) => setForm((p) => ({ ...p, discountPercent: parseInt(e.target.value) || 0 }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="couponValidDays">Coupon Valid Days</Label>
                <Input id="couponValidDays" type="number" min={1} value={form.couponValidDays} onChange={(e) => setForm((p) => ({ ...p, couponValidDays: parseInt(e.target.value) || 30 }))} />
              </div>
            </div>

            {/* Row 6: Description */}
            <div className="space-y-2">
              <Label htmlFor="descriptionShort">Short Description</Label>
              <Textarea id="descriptionShort" placeholder="Brief description..." value={form.descriptionShort} onChange={(e) => setForm((p) => ({ ...p, descriptionShort: e.target.value }))} rows={2} />
            </div>

            {/* Row 7: Phone + Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="+255 123 456 789" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="Street address" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
              </div>
            </div>

            {/* Row 8: Website + Cover Image */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input id="websiteUrl" placeholder="https://example.com" value={form.websiteUrl} onChange={(e) => setForm((p) => ({ ...p, websiteUrl: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coverImage">Cover Image URL</Label>
                <Input id="coverImage" placeholder="https://example.com/image.jpg" value={form.coverImage} onChange={(e) => setForm((p) => ({ ...p, coverImage: e.target.value }))} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button className="bg-emerald hover:bg-emerald/90 text-emerald-foreground" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editingHotel ? 'Update Hotel' : 'Create Hotel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
