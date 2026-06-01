'use client';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: 'General', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { toast.error('Please fill in all required fields'); return; }
    setSending(true);
    // Simulate send - API can be built later
    await new Promise(r => setTimeout(r, 1000));
    toast.success('Message sent! We will get back to you within 24 hours.');
    setForm({ name: '', email: '', subject: 'General', message: '' });
    setSending(false);
  };

  const contacts = [
    { icon: Mail, label: 'Email', value: 'support@busybeds.com', href: 'mailto:support@busybeds.com' },
    { icon: Phone, label: 'Phone', value: '+255 123 456 789', href: 'tel:+255123456789' },
    { icon: MapPin, label: 'Office', value: 'Ohio Street, Dar es Salaam, Tanzania', href: null },
    { icon: Clock, label: 'Hours', value: 'Mon–Fri: 9AM–6PM EAT', href: null },
  ];

  return (
    <div className="min-h-screen">
      <section className="relative bg-gradient-to-br from-[#ea4d60]/10 via-background to-[#ea4d60]/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">Have a question, suggestion, or partnership inquiry? We would love to hear from you. Our team typically responds within 24 hours.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold mb-4">Contact Information</h2>
              {contacts.map(c => (
                <Card key={c.label} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#ea4d60]/10 flex items-center justify-center shrink-0">
                      <c.icon className="h-5 w-5 text-[#ea4d60]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{c.label}</p>
                      {c.href ? (
                        <a href={c.href} className="text-sm text-[#ea4d60] hover:underline">{c.value}</a>
                      ) : (
                        <p className="text-sm text-muted-foreground">{c.value}</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Form */}
            <div className="md:col-span-2">
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Send Us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Full Name *</label>
                      <Input placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Email *</label>
                      <Input type="email" placeholder="you@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Subject</label>
                    <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}>
                      <option>General Inquiry</option>
                      <option>Technical Support</option>
                      <option>Partnership</option>
                      <option>Billing</option>
                      <option>Report an Issue</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Message *</label>
                    <Textarea rows={5} placeholder="How can we help you?" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
                  </div>
                  <Button type="submit" className="bg-[#ea4d60] hover:bg-[#ea4d60]/90 text-white" disabled={sending}>
                    {sending ? 'Sending...' : <><Send className="h-4 w-4 mr-2" /> Send Message</>}
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
