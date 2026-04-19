import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDateTime } from "@/lib/i18n";
import { useListEmergencyVisits, useCreateEmergencyVisit, useUpdateEmergencyVisit, getListEmergencyVisitsQueryKey, useListPatients } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

/**
 * لاپەڕەی بەشی فریاگوزاری (ER)
 * ئەم بەشە تایبەتە بە تۆمارکردنی خێرای نەخۆشە مەترسیدارەکان و پۆلێنکردنیان (Triage)
 */
export default function Emergency() {
  const [isOpen, setIsOpen] = useState(false); // پەنجەرەی تۆمارکردنی حاڵەتی نوێ
  
  // بارکردنی لیستی سەردانەکان و نەخۆشەکان
  const { data: visits, isLoading } = useListEmergencyVisits();
  const { data: patients } = useListPatients();
  
  const createVisit = useCreateEmergencyVisit();
  const updateVisit = useUpdateEmergencyVisit();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  /**
   * تۆمارکردنی حاڵەتێکی نائاسایی
   * لێرەدا پۆلێنکردنی (Triage) زۆر گرنگە بۆ دیاریکردنی جەختی پزیشکی
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await createVisit.mutateAsync({
        data: {
          patientName: formData.get("patientName") as string,
          triage: formData.get("triage") as string,
          complaint: formData.get("complaint") as string,
          patientId: formData.get("patientId") ? Number(formData.get("patientId")) : undefined,
        }
      });
      queryClient.invalidateQueries({ queryKey: getListEmergencyVisitsQueryKey() });
      setIsOpen(false);
      toast({ title: "سەرکەوتوو بوو", description: "نەخۆشی فریاگوزاری تۆمارکرا" });
    } catch (error) {
      toast({ variant: "destructive", title: "هەڵە", description: "نەتوانرا تۆماربکرێت" });
    }
  };

  // گۆڕینی دۆخی نەخۆش لە فریاگوزاری (وەک: وەرگرتن بۆ بەشە ناوخۆییەکان)
  const handleStatusChange = async (id: number, status: string) => {
    try {
      await updateVisit.mutateAsync({ id, data: { status } });
      queryClient.invalidateQueries({ queryKey: getListEmergencyVisitsQueryKey() });
    } catch (error) {
      toast({ variant: "destructive", title: "هەڵە", description: "نەتوانرا دۆخ نوێبکرێتەوە" });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="فریاگوزاری (Emergency)" 
        description="تۆمارکردن و پۆلێنکردنی نەخۆشە بەپەلەکان"
        actions={
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive"><Plus className="w-4 h-4 ml-2" /> نەخۆشی نوێ</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>تۆمارکردنی فریاگوزاری</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="patientName">ناوی نەخۆش</Label>
                  <Input id="patientName" name="patientName" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patientId">نەخۆشی تۆمارکراو (ئارەزوومەندانە)</Label>
                  <select id="patientId" name="patientId" className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="">نەخۆشی نوێ...</option>
                    {patients?.map(p => <option key={p.id} value={p.id}>{p.fullName} ({p.mrn})</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="triage">پۆلێنکردن (Triage)</Label>
                  <select id="triage" name="triage" className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50" required>
                    <option value="critical">مەترسیدار (Critical)</option>
                    <option value="urgent">بەپەلە (Urgent)</option>
                    <option value="less_urgent">کەمتر بەپەلە (Less Urgent)</option>
                    <option value="nonurgent">ئاسایی (Non-urgent)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complaint">سکاڵا / هۆکار</Label>
                  <Input id="complaint" name="complaint" required />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>پاشگەزبوون</Button>
                  <Button type="submit" variant="destructive" disabled={createVisit.isPending}>پاشەکەوت</Button>
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
              <TableHead>نەخۆش</TableHead>
              <TableHead>کاتی گەیشتن</TableHead>
              <TableHead>هۆکار</TableHead>
              <TableHead>پۆلێن</TableHead>
              <TableHead>دۆخ</TableHead>
              <TableHead className="text-left">کردارەکان</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">چاوەڕێ بکە...</TableCell></TableRow>
            ) : visits?.length === 0 ? (
              <TableRow><TableCell colSpan={6}><EmptyState title="هیچ نەخۆشێکی فریاگوزاری نییە" description="بەتاڵە" /></TableCell></TableRow>
            ) : (
              visits?.map((visit) => (
                <TableRow key={visit.id}>
                  <TableCell className="font-medium">{visit.patientName}</TableCell>
                  <TableCell dir="ltr" className="text-right text-sm text-muted-foreground">{formatDateTime(visit.arrivalAt)}</TableCell>
                  <TableCell>{visit.complaint}</TableCell>
                  <TableCell><StatusBadge status={visit.triage} /></TableCell>
                  <TableCell><StatusBadge status={visit.status} /></TableCell>
                  <TableCell className="text-left">
                    {/* گۆڕینی قۆناغی چارەسەر یان دەرچوو */}
                    <Select value={visit.status} onValueChange={(val) => handleStatusChange(visit.id, val)}>
                      <SelectTrigger className="w-[130px] h-8">
                        <SelectValue placeholder="گۆڕینی دۆخ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="waiting">چاوەڕێ دەکات</SelectItem>
                        <SelectItem value="inprogress">لە کاردایە</SelectItem>
                        <SelectItem value="admitted">وەرگیراوە بۆ نوستن</SelectItem>
                        <SelectItem value="discharged">دەرچوو</SelectItem>
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
