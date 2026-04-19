import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency, formatDateTime } from "@/lib/i18n";
import { useListInvoices, useCreateInvoice, usePayInvoice, getListInvoicesQueryKey, useListPatients } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, CreditCard, Search, Printer } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { InvoicePrint } from "@/components/InvoicePrint";

/**
 * لاپەڕەی حسابات و پسوولەکان (Billing)
 * ئەم بەشە بەرپرسە لە دروستکردنی پسوولەی دارایی بۆ نەخۆشەکان و تۆمارکردنی پارەدانەکان
 */
export default function Billing() {
  const [search, setSearch] = useState(""); // گەڕان بەدوای ژمارەی پسوولە
  const [statusFilter, setStatusFilter] = useState("all"); // فلتەری دۆخی پارەدان (نەدراوە، دراوە، هتد)
  const [isOpen, setIsOpen] = useState(false); // پەنجەرەی دروستکردنی پسوولەی نوێ
  const [paymentOpen, setPaymentOpen] = useState<{ id: number, remaining: number } | null>(null); // پەنجەرەی پارەدان
  const [printingInvoice, setPrintingInvoice] = useState<any>(null); // ئەو پسوولەیەی پرنت دەکرێت
  
  // بارکردنی زانیارییەکان
  const { data: invoices, isLoading } = useListInvoices();
  const { data: patients } = useListPatients();
  
  const createInvoice = useCreateInvoice();
  const payInvoice = usePayInvoice();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // فلتەرکردنی پسوولەکان بەپێی گەڕان و دۆخی دارایی
  const filteredInvoices = invoices?.filter(inv => {
    const matchesSearch = inv.patientName.toLowerCase().includes(search.toLowerCase()) || 
                         `INV-${inv.id.toString().padStart(5, '0')}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // دروستکردنی پسوولەیەکی نوێ بۆ خزمەتگوزارییەکانی نەخۆشخانە
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await createInvoice.mutateAsync({
        data: {
          patientId: Number(formData.get("patientId")),
          items: formData.get("items") as string,
          amount: Number(formData.get("amount")),
        }
      });
      queryClient.invalidateQueries({ queryKey: getListInvoicesQueryKey() });
      setIsOpen(false);
      toast({ title: "سەرکەوتوو بوو", description: "پسوولەی نوێ دروستکرا" });
    } catch (error) {
      toast({ variant: "destructive", title: "هەڵە", description: "نەتوانرا پسوولە دروستبکرێت" });
    }
  };

  /**
   * تۆمارکردنی بڕە پارەیەک کە لەلایەن نەخۆشەوە دەدرێت
   * دەکرێت فۆرکا (Partial) بێت یان هەموو بڕە پارەکە بێت
   */
  const handlePaymentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!paymentOpen) return;
    
    const formData = new FormData(e.currentTarget);
    try {
      await payInvoice.mutateAsync({
        id: paymentOpen.id,
        data: {
          amount: Number(formData.get("amount")),
          method: formData.get("method") as string,
        }
      });
      queryClient.invalidateQueries({ queryKey: getListInvoicesQueryKey() });
      setPaymentOpen(null);
      toast({ title: "سەرکەوتوو بوو", description: "پارەدان تۆمارکرا" });
    } catch (error) {
      toast({ variant: "destructive", title: "هەڵە", description: "نەتوانرا پارەدان تۆماربکرێت" });
    }
  };

  // فرمانی پرنتکردنی پسوولە
  const handlePrint = (invoice: any) => {
    setPrintingInvoice(invoice);
    setTimeout(() => {
      window.print();
      setPrintingInvoice(null);
    }, 100);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="پسوولەکان (Billing)" 
        description="بەڕێوەبردنی حسابات و پارەدانی نەخۆشەکان"
        actions={
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 ml-2" /> پسوولەی نوێ</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>دروستکردنی پسوولە</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="patientId">نەخۆش</Label>
                  <select id="patientId" name="patientId" className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50" required>
                    <option value="">هەڵبژێرە...</option>
                    {patients?.map(p => <option key={p.id} value={p.id}>{p.fullName} ({p.mrn})</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="items">وردەکاری خزمەتگوزارییەکان</Label>
                  <Textarea id="items" name="items" placeholder="بۆ نمونە: پشکنینی خوێن، سەردانی پزیشک" rows={3} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">بڕی پارە (دینار)</Label>
                  <Input id="amount" name="amount" type="number" required />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>پاشگەزبوون</Button>
                  <Button type="submit" disabled={createInvoice.isPending}>پاشەکەوت</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* بەشی گەڕان و فلتەرکردن */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="گەڕان بەدوای ژمارەی پسوولە یان ناو..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="flex h-9 w-full md:w-[150px] items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="all">هەموو بارەکان</option>
          <option value="unpaid">نەدراوە</option>
          <option value="partial">بەشێکی دراوە</option>
          <option value="paid">تەواو دراوە</option>
        </select>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ژمارەی پسوولە</TableHead>
              <TableHead>نەخۆش</TableHead>
              <TableHead>وردەکاری</TableHead>
              <TableHead>کۆی گشتی</TableHead>
              <TableHead>دراوە</TableHead>
              <TableHead>دۆخ</TableHead>
              <TableHead>بەروار</TableHead>
              <TableHead className="text-left">کردارەکان</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8">چاوەڕێ بکە...</TableCell></TableRow>
            ) : filteredInvoices?.length === 0 ? (
              <TableRow><TableCell colSpan={8}><EmptyState title="هیچ پسوولەیەک نەدۆزرایەوە" description="دەتوانیت پسوولەی نوێ دروست بکەیت" /></TableCell></TableRow>
            ) : (
              filteredInvoices?.map((invoice) => {
                const remaining = invoice.amount - invoice.paidAmount;
                return (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono text-muted-foreground">INV-{invoice.id.toString().padStart(5, '0')}</TableCell>
                    <TableCell className="font-medium">{invoice.patientName}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={invoice.items}>{invoice.items}</TableCell>
                    <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                    <TableCell className="text-emerald-600">{formatCurrency(invoice.paidAmount)}</TableCell>
                    <TableCell><StatusBadge status={invoice.status} /></TableCell>
                    <TableCell dir="ltr" className="text-right text-sm text-muted-foreground">{formatDateTime(invoice.createdAt)}</TableCell>
                    <TableCell className="text-left">
                      <div className="flex justify-end gap-2">
                        {/* دوگمەی دابەزاندن و پرنتکردنی پسوولە بۆ نەخۆش */}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-primary text-primary hover:bg-primary/10"
                          onClick={() => handlePrint(invoice)}
                        >
                          <Printer className="w-3 h-3 ml-1" /> پسوولە / Print
                        </Button>
                        {/* تەنها ئەو پسوولانەی کە قەرزیان لەسەر ماوە دوگمەی پارەدانیان هەبێت */}
                        {invoice.status !== 'paid' && (
                          <Dialog open={paymentOpen?.id === invoice.id} onOpenChange={(open) => setPaymentOpen(open ? { id: invoice.id, remaining } : null)}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="secondary"><CreditCard className="w-3 h-3 ml-1" /> پارەدان</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>تۆمارکردنی پارەدان</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handlePaymentSubmit} className="space-y-4 pt-4">
                              <div className="bg-muted p-3 rounded-md mb-4 text-center">
                                <p className="text-sm text-muted-foreground">بڕی ماوە</p>
                                <p className="text-2xl font-bold text-rose-600">{formatCurrency(remaining)}</p>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="amount">بڕی پارەی دراو</Label>
                                <Input id="amount" name="amount" type="number" defaultValue={remaining} max={remaining} required />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="method">شێوازی پارەدان</Label>
                                <select id="method" name="method" className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50" required>
                                  <option value="cash">کاش (نەختینە)</option>
                                  <option value="card">کارت</option>
                                  <option value="insurance">دڵنیایی (Insurance)</option>
                                </select>
                              </div>
                              <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setPaymentOpen(null)}>پاشگەزبوون</Button>
                                <Button type="submit" disabled={payInvoice.isPending}>تۆمارکردن</Button>
                              </div>
                            </form>
                          </DialogContent>
                        </Dialog>
                      )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* بەشی پرنتکردن (تەنها کاتی پرنت دەردەکەوێت) */}
      <div className="hidden print:block">
        {printingInvoice && <InvoicePrint invoice={printingInvoice} />}
      </div>
    </div>
  );
}
