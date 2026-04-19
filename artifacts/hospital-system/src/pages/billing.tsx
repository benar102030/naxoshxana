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
import { Plus, CreditCard } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Billing() {
  const [isOpen, setIsOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState<{ id: number, remaining: number } | null>(null);
  
  const { data: invoices, isLoading } = useListInvoices();
  const { data: patients } = useListPatients();
  
  const createInvoice = useCreateInvoice();
  const payInvoice = usePayInvoice();
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
            ) : invoices?.length === 0 ? (
              <TableRow><TableCell colSpan={8}><EmptyState title="هیچ پسوولەیەک نییە" description="لیستی پسوولەکان لێرە دەردەکەوێت" /></TableCell></TableRow>
            ) : (
              invoices?.map((invoice) => {
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
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
