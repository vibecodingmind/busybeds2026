'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
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
} from 'lucide-react';
import { toast } from 'sonner';

/* ─── Types ─── */
interface Hotel {
  id: string;
  name: string;
  slug: string;
  city: string;
  country: string;
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
  createdAt: string;
}

interface HotelFormData {
  name: string;
  slug: string;
  city: string;
  country: string;
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

const EMPTY_FORM: HotelFormData = {
  name: '',
  slug: '',
  city: '',
  country: '',
  tier: 'standard',
  status: 'active',
  partnershipStatus: 'NONE',
  starRating: 3,
  descriptionShort: '',
  discountPercent: 15,
  couponValidDays: 30,
  phone: '',
  address: '',
  websiteUrl: '',
  coverImage: '',
};

/* ─── Helpers ─── */
function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function tierBadgeClass(tier: string) {
  switch (tier) {
    case 'luxury':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    case 'premium':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    case 'standard':
    default:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
  }
}

function partnershipBadgeClass(ps: string) {
  switch (ps) {
    case 'ACTIVE':
      return 'bg-emerald/15 text-emerald dark:bg-emerald/25 dark:text-emerald-300';
    case 'PENDING':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    case 'NONE':
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  }
}

/* ─── Component ─── */
export default function AdminHotelsPage() {
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
  const [partnershipFilter, setPartnershipFilter] = useState('all');
  const [citySearch, setCitySearch] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [form, setForm] = useState<HotelFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* ─── Fetch hotels ─── */
  const fetchHotels = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
      if (tierFilter && tierFilter !== 'all') params.set('tier', tierFilter);
      params.set('page', String(page));
      params.set('limit', String(limit));

      const res = await fetch(`/api/admin/hotels?${params.toString()}`);
      const data = await res.json();

      let filtered = data.data || [];
      // Client-side city filter (API doesn't have city param)
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
  }, [search, statusFilter, tierFilter, citySearch, page]);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, tierFilter, citySearch]);

  /* ─── Modal helpers ─── */
  const openAddModal = () => {
    setEditingHotel(null);
    setForm(EMPTY_FORM);
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

  const handleSlugChange = (slug: string) => {
    setSlugManuallyEdited(true);
    setForm((prev) => ({ ...prev, slug }));
  };

  /* ─── Save hotel (create / update) ─── */
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
    const newStatus = hotel.partnershipStatus === 'ACTIVE' ? 'NONE' : 'ACTIVE';
    try {
      if (newStatus === 'ACTIVE') {
        // Use existing approve-kyc endpoint for activating
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
          body: JSON.stringify({ partnershipStatus: 'NONE' }),
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

  /* ─── Render ─── */
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Hotel Management</h1>
          <p className="text-sm text-muted-foreground mt-1">{total} hotels total</p>
        </div>
        <Button className="bg-emerald hover:bg-emerald/90 text-emerald-foreground" onClick={openAddModal}>
          <Plus className="h-4 w-4 mr-2" />
          Add Hotel
        </Button>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search hotels..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* City Search */}
        <div className="relative min-w-[160px]">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="City..."
            className="pl-10"
            value={citySearch}
            onChange={(e) => setCitySearch(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        {/* Tier Filter */}
        <Select value={tierFilter} onValueChange={setTierFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="luxury">Luxury</SelectItem>
          </SelectContent>
        </Select>

        {/* Partnership Filter */}
        <Select value={partnershipFilter} onValueChange={setPartnershipFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Partnership" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Partnerships</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="NONE">None</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Hotel List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : hotels.length === 0 ? (
        <Card className="p-12 text-center">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-lg font-medium text-muted-foreground">No hotels found</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or add a new hotel.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {hotels
            .filter((h) => {
              // Client-side partnership filter (API doesn't have this param)
              if (partnershipFilter !== 'all' && h.partnershipStatus !== partnershipFilter) return false;
              return true;
            })
            .map((hotel) => (
              <Card key={hotel.id} className="p-4">
                <div className="flex items-center justify-between gap-4">
                  {/* Left: Hotel Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold truncate">{hotel.name}</p>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: hotel.starRating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {hotel.city}, {hotel.country}
                      {hotel.phone && (
                        <span className="ml-3 text-xs">📞 {hotel.phone}</span>
                      )}
                    </p>
                    {hotel.descriptionShort && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {hotel.descriptionShort}
                      </p>
                    )}
                  </div>

                  {/* Right: Badges + Actions */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    <Badge className={tierBadgeClass(hotel.tier)}>
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
                      {hotel.partnershipStatus}
                    </Badge>
                    {hotel.discountPercent > 0 && (
                      <Badge className="bg-emerald/15 text-emerald">
                        {hotel.discountPercent}% off
                      </Badge>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1 ml-2">
                      {/* Toggle Partnership */}
                      <Button
                        variant="ghost"
                        size="icon"
                        title={
                          hotel.partnershipStatus === 'ACTIVE'
                            ? 'Deactivate partnership'
                            : 'Activate partnership'
                        }
                        onClick={() => togglePartnership(hotel)}
                      >
                        <CheckCircle
                          className={`h-4 w-4 ${
                            hotel.partnershipStatus === 'ACTIVE'
                              ? 'text-emerald'
                              : 'text-muted-foreground'
                          }`}
                        />
                      </Button>

                      {/* Edit */}
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Edit hotel"
                        onClick={() => openEditModal(hotel)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      {/* Delete */}
                      <AlertDialog
                        open={deletingId === hotel.id}
                        onOpenChange={(open) => {
                          if (!open) setDeletingId(null);
                        }}
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete hotel"
                            onClick={() => setDeletingId(hotel.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Hotel</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete <strong>{hotel.name}</strong>? This action
                              cannot be undone. All related data including rooms, reviews, and coupons will
                              be permanently removed.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive hover:bg-destructive/90 text-white"
                              onClick={handleDelete}
                              disabled={deleting}
                            >
                              {deleting ? 'Deleting...' : 'Delete'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
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
                <Input
                  id="name"
                  placeholder="Hotel name"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  placeholder="auto-generated-from-name"
                  value={form.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                />
              </div>
            </div>

            {/* Row 2: City + Country */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="City"
                  value={form.city}
                  onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  placeholder="Country"
                  value={form.country}
                  onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
                />
              </div>
            </div>

            {/* Row 3: Tier + Status + Partnership */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Tier</Label>
                <Select value={form.tier} onValueChange={(v) => setForm((p) => ({ ...p, tier: v }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="luxury">Luxury</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Partnership</Label>
                <Select
                  value={form.partnershipStatus}
                  onValueChange={(v) => setForm((p) => ({ ...p, partnershipStatus: v }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="NONE">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 4: Star Rating + Discount + Coupon Days */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="starRating">Star Rating</Label>
                <Select
                  value={String(form.starRating)}
                  onValueChange={(v) => setForm((p) => ({ ...p, starRating: parseInt(v) }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} Star{n > 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountPercent">Discount %</Label>
                <Input
                  id="discountPercent"
                  type="number"
                  min={0}
                  max={100}
                  value={form.discountPercent}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, discountPercent: parseInt(e.target.value) || 0 }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="couponValidDays">Coupon Valid Days</Label>
                <Input
                  id="couponValidDays"
                  type="number"
                  min={1}
                  value={form.couponValidDays}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, couponValidDays: parseInt(e.target.value) || 30 }))
                  }
                />
              </div>
            </div>

            {/* Row 5: Description Short */}
            <div className="space-y-2">
              <Label htmlFor="descriptionShort">Short Description</Label>
              <Textarea
                id="descriptionShort"
                placeholder="Brief description of the hotel..."
                value={form.descriptionShort}
                onChange={(e) => setForm((p) => ({ ...p, descriptionShort: e.target.value }))}
                rows={2}
              />
            </div>

            {/* Row 6: Phone + Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="+255 123 456 789"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Street address"
                  value={form.address}
                  onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                />
              </div>
            </div>

            {/* Row 7: Website + Cover Image */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input
                  id="websiteUrl"
                  placeholder="https://example.com"
                  value={form.websiteUrl}
                  onChange={(e) => setForm((p) => ({ ...p, websiteUrl: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coverImage">Cover Image URL</Label>
                <Input
                  id="coverImage"
                  placeholder="https://example.com/image.jpg"
                  value={form.coverImage}
                  onChange={(e) => setForm((p) => ({ ...p, coverImage: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button
              className="bg-emerald hover:bg-emerald/90 text-emerald-foreground"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : editingHotel ? 'Update Hotel' : 'Create Hotel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
