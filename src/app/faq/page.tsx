'use client';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search, HelpCircle } from 'lucide-react';
import Link from 'next/link';

interface FAQItem { id: string; question: string; answer: string; category: string; }

const CATEGORIES = ['All', 'general', 'payments', 'subscription', 'coupons', 'referrals'];
const CAT_LABELS: Record<string, string> = { All: 'All', general: 'General', payments: 'Payments', subscription: 'Subscription', coupons: 'Coupons', referrals: 'Referrals' };

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/faq').then(r => r.json()).then(d => { setFaqs(d.data || d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = faqs.filter(f => {
    const matchCat = cat === 'All' || f.category === cat;
    const matchSearch = !search || f.question.toLowerCase().includes(search.toLowerCase()) || f.answer.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen">
      <section className="relative bg-gradient-to-br from-[#ea4d60]/10 via-background to-[#ea4d60]/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">Find answers to common questions about BusyBeds, subscriptions, coupons, and more.</p>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search questions..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex flex-wrap gap-2 mb-8">
            {CATEGORIES.map(c => (
              <Button key={c} variant={cat === c ? 'default' : 'outline'} size="sm" onClick={() => setCat(c)} className={cat === c ? 'bg-[#ea4d60] hover:bg-[#ea4d60]/90 text-white' : ''}>
                {CAT_LABELS[c]}
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />)}</div>
          ) : filtered.length === 0 ? (
            <Card className="p-8 text-center">
              <HelpCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">No matching questions found. Try a different search or category.</p>
            </Card>
          ) : (
            <Accordion type="multiple" className="space-y-2">
              {filtered.map(faq => (
                <AccordionItem key={faq.id} value={faq.id} className="border rounded-lg px-4">
                  <AccordionTrigger className="text-left hover:no-underline">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="font-medium">{faq.question}</span>
                      <Badge variant="outline" className="text-[10px] shrink-0">{faq.category}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </section>

      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-3">Still Have Questions?</h2>
          <p className="text-muted-foreground mb-4">Our support team is here to help you with anything you need.</p>
          <Link href="/contact"><Button className="bg-[#ea4d60] hover:bg-[#ea4d60]/90 text-white">Contact Us</Button></Link>
        </div>
      </section>
    </div>
  );
}
