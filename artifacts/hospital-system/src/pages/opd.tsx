import { useState } from "react";
import { useListOpdVisits, useCreateOpdVisit, useUpdateOpdVisit, useListPatients, useListStaff, getListOpdVisitsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { StatusBadge } from "@/components/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * لاپەڕەی کلینیکی دەرەکی (OPD)
 * ئەم بەشە تایبەتە بە بەڕێوەبردنی کاتەکانی نۆرینگە و بینینی نەخۆش لەلایەن پزیشکە پسپۆڕەکانەوە
 */
export default function OPD() {
  const [isOpen, setIsOpen] = useState(false); // پەنجەرەی زیادکردنی سەردان
  
  // بارکردنی زانیارییەکان
  const { data: visits, isLoading } = useListOpdVisits();
  const { data: patients } = useListPatients();
  const { data: staff } = useListStaff();
  
  const createVisit = useCreateOpdVisit();
  const updateVisit = useUpdateOpdVisit();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // جیاکردنەوەی کارمەندەکان بۆ وەرگرتنی لیستی پزیشکەکان
  const doctors = staff?.filter(s => s.role === 'doctor') || [];

  // تۆمارکردنی کاتی سەردانێکی نوێ بۆ نەخۆش
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await createVisit.mutateAsync({
        data: {
          patientId: Number(formData.get("patientId")),
          doctorId: Number(formData.get("doctorId")),
          appointmentAt: formData.get("appointmentAt") as string,
          fee: Number(formData.get("fee")),
          complaint: formData.get("complaint") as string || undefined,
        }
      });
      // نوێکردنەوەی لیستەکە دوای سەرکەوتنی کارەکە
      queryClient.invalidateQueries({ queryKey: getListOpdVisitsQueryKey() });
      setIsOpen(false);
      toast({ title: "سەرکەوتوو بوو", description: "سەردانی نوێ زیادکرا" });
    } catch (error) {
      toast({ variant: "destructive", title: "هەڵە", description: "نەتوانرا سەردان زیادبکرێت" });
    }
  };

  // گۆڕینی دۆخی سەردان (بۆ نموونە: گۆڕین بۆ 'تەواوبوو' کاتێک پزیشک نەخۆشەکە دەبینێت)
  const handleStatusChange = async (id: number, status: string) => {
    try {
      await updateVisit.mutateAsync({ id, data: { status } });
      queryClient.invalidateQueries({ queryKey: getListOpdVisitsQueryKey() });
      toast({ title: "سەرکەوتوو بوو", description: "دۆخ نوێکرایەوە" });
    } catch (error) {
      toast({ variant: "destructive", title: "هەڵە", description: "نەتوانرا دۆخ نوێبکرێتەوە" });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="کلینیکی دەرەکی" 
        description="سەردان و کاتەکانی بینینی نەخۆش"
        actions={
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 ml-2" /> سەردانی نوێ</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>زیادکردنی سەردان</DialogTitle>
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
                  <Label htmlFor="doctorId">پزیشک</Label>
                  <select id="doctorId" name="doctorId" className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50" required>
                    <option value="">هەڵبژێرە...</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.fullName} ({d.department})</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appointmentAt">کاتی سەردان</Label>
                  <Input id="appointmentAt" name="appointmentAt" type="datetime-local" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fee">نرخی بینین</Label>
                  <Input id="fee" name="fee" type="number" defaultValue="25000" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complaint">سکاڵا / نەخۆشی</Label>
                  <Input id="complaint" name="complaint" />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>پاشگەزبوون</Button>
                  <Button type="submit" disabled={createVisit.isPending}>پاشەکەوت</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* خشتەی نۆرینگەکان */}
      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>نەخۆش</TableHead>
              <TableHead>پزیشک</TableHead>
              <TableHead>کات</TableHead>
              <TableHead>سکاڵا</TableHead>
              <TableHead>نرخ</TableHead>
              <TableHead>دۆخ</TableHead>
              <TableHead className="text-left">کردارەکان</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8">چاوەڕێ بکە...</TableCell></TableRow>
            ) : visits?.length === 0 ? (
              <TableRow><TableCell colSpan={7}><EmptyState title="هیچ سەردانێک نییە" description="دەتوانیت سەردانی نوێ زیاد بکەیت" /></TableCell></TableRow>
            ) : (
              visits?.map((visit) => (
                <TableRow key={visit.id}>
                  <TableCell className="font-medium">{visit.patientName}</TableCell>
                  <TableCell>{visit.doctorName}</TableCell>
                  <TableCell dir="ltr" className="text-right text-sm text-muted-foreground">{formatDateTime(visit.appointmentAt)}</TableCell>
                  <TableCell>{visit.complaint || '-'}</TableCell>
                  <TableCell>{formatCurrency(visit.fee)}</TableCell>
                  <TableCell><StatusBadge status={visit.status} /></TableCell>
                  <TableCell className="text-left">
                    {/* گۆڕینی دۆخی پشکنین دوای بینینی پزیشک */}
                    <Select value={visit.status} onValueChange={(val) => handleStatusChange(visit.id, val)}>
                      <SelectTrigger className="w-[130px] h-8">
                        <SelectValue placeholder="گۆڕینی دۆخ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">دیاریکراو</SelectItem>
                        <SelectItem value="inprogress">لە کاردایە</SelectItem>
                        <SelectItem value="done">تەواوبوو</SelectItem>
                        <SelectItem value="cancelled">پاشگەزبووەوە</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
