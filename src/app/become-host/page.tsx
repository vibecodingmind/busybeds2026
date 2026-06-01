'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Building2, Upload, ArrowRight, Check } from 'lucide-react';
import { HOTEL_TYPES, VIBE_TAGS } from '@/lib/locations';

export default function BecomeHostPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    hotelName: '', city: '', country: 'Tanzania', category: 'Hotel',
    descriptionShort: '', descriptionLong: '', starRating: 3, discountPercent: 15,
    amenities: [] as string[], vibeTags: [] as string[], coverImage: '',
  });

  const submit = async () => {
    const res = await fetch('/api/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) {
      toast.success('Application submitted!');
      router.push('/owner/dashboard');
    } else toast.error(data.error || 'Failed to submit');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-8">
        <Building2 className="h-12 w-12 text-emerald mx-auto mb-3" />
        <h1 className="text-3xl font-bold">List Your Hotel</h1>
        <p className="text-muted-foreground">Join BusyBeds and offer exclusive discounts to travelers across Africa</p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= s ? 'bg-emerald text-emerald-foreground' : 'bg-muted text-muted-foreground'}`}>
            {step > s ? <Check className="h-4 w-4" /> : s}
          </div>
        ))}
      </div>

      {step === 1 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Hotel Details</h2>
          <div className="space-y-4">
            <div><Label>Hotel Name</Label><Input value={form.hotelName} onChange={e => setForm(f => ({ ...f, hotelName: e.target.value }))} placeholder="Grand Palace Hotel" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>City</Label><Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Dar es Salaam" /></div>
              <div><Label>Country</Label>
                <Select value={form.country} onValueChange={v => setForm(f => ({ ...f, country: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tanzania">Tanzania</SelectItem>
                    <SelectItem value="Kenya">Kenya</SelectItem>
                    <SelectItem value="Uganda">Uganda</SelectItem>
                    <SelectItem value="Zanzibar">Zanzibar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{HOTEL_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Star Rating</Label>
                <Select value={String(form.starRating)} onValueChange={v => setForm(f => ({ ...f, starRating: parseInt(v) }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{[1,2,3,4,5].map(n => <SelectItem key={n} value={String(n)}>{'⭐'.repeat(n)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Short Description</Label><Input value={form.descriptionShort} onChange={e => setForm(f => ({ ...f, descriptionShort: e.target.value }))} placeholder="A luxurious beachfront resort..." /></div>
            <Button className="w-full bg-emerald hover:bg-emerald/90 text-emerald-foreground" onClick={() => setStep(2)}>Next <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">More Details</h2>
          <div className="space-y-4">
            <div><Label>Full Description</Label><Textarea rows={4} value={form.descriptionLong} onChange={e => setForm(f => ({ ...f, descriptionLong: e.target.value }))} placeholder="Describe your hotel in detail..." /></div>
            <div><Label>Discount Percentage</Label><Input type="number" value={form.discountPercent} onChange={e => setForm(f => ({ ...f, discountPercent: parseInt(e.target.value) || 15 }))} min={5} max={50} /></div>
            <div>
              <Label>Vibe Tags</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {VIBE_TAGS.map(tag => (
                  <Button key={tag} variant={form.vibeTags.includes(tag) ? 'default' : 'outline'} size="sm" className={form.vibeTags.includes(tag) ? 'bg-emerald text-emerald-foreground' : ''} onClick={() => setForm(f => ({ ...f, vibeTags: f.vibeTags.includes(tag) ? f.vibeTags.filter(t => t !== tag) : [...f.vibeTags, tag] }))}>
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button className="flex-1 bg-emerald hover:bg-emerald/90 text-emerald-foreground" onClick={() => setStep(3)}>Next <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Review & Submit</h2>
          <div className="space-y-3 text-sm">
            <p><strong>Hotel:</strong> {form.hotelName}</p>
            <p><strong>Location:</strong> {form.city}, {form.country}</p>
            <p><strong>Category:</strong> {form.category} — {'⭐'.repeat(form.starRating)}</p>
            <p><strong>Discount:</strong> {form.discountPercent}%</p>
            {form.vibeTags.length > 0 && <p><strong>Vibes:</strong> {form.vibeTags.join(', ')}</p>}
          </div>
          <p className="text-sm text-muted-foreground mt-4">Your application will be reviewed by our team. You&apos;ll be notified once approved.</p>
          <div className="flex gap-2 mt-6">
            <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
            <Button className="flex-1 bg-emerald hover:bg-emerald/90 text-emerald-foreground" onClick={submit}>Submit Application</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
