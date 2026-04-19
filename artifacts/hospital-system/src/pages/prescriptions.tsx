import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime } from "@/lib/i18n";
import { useListPrescriptions, useCreatePrescription, getListPrescriptionsQueryKey, useListPatients, useListStaff } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { PrescriptionPrint } from "@/components/PrescriptionPrint";

/**
 * لاپەڕەی نوسخەی پزیشکی (Prescriptions)
 * لێرەدا پزیشکەکان دەتوانن دەرمان بۆ نەخۆش بنوسن و مێژووی دەرمانەکان ببینن
 */
export default function Prescriptions() {
  const [isOpen, setIsOpen] = useState(false); // پەنجەرەی نوسینی دەرمانی نوێ
  
  // بارکردنی دراوەکان
  const { data: prescriptions, isLoading } = useListPrescriptions();
  const { data: patients } = useListPatients();
  const { data: staff } = useListStaff();
  
  const createPrescription = useCreatePrescription();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const doctors = staff?.filter(s => s.role === 'doctor') || [];

  /**
   * تۆمارکردنی نوسخەیەکی نوێ
   * لێرەدا ناوی دەرمان و دۆز (Dosage) و ماوەی بەکارهێنان دیاری دەکرێت
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await createPrescription.mutateAsync({
        data: {
          patientId: Number(formData.get("patientId")),
          doctorId: Number(formData.get("doctorId")),
          medicationName: formData.get("medicationName") as string,
          dosage: formData.get("dosage") as string,
          duration: formData.get("duration") as string,
          notes: formData.get("notes") as string || undefined,
        }
      });
      queryClient.invalidateQueries({ queryKey: getListPrescriptionsQueryKey() });
      setIsOpen(false);
      toast({ title: "سەرکەوتوو بوو", description: "نوسخەی پزیشکی تۆمارکرا" });
    } catch (error) {
      toast({ variant: "destructive", title: "هەڵە", description: "نەتوانرا نوسخە تۆماربکرێت" });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="نوسخەی پزیشکی (Prescriptions)" 
        description="بەڕێوەبردنی دەرمانی نوسراو بۆ نەخۆشەکان"
        actions={
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 ml-2" /> نوسخەی نوێ</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>نوسینی دەرمان</DialogTitle>
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
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medicationName">ناوی دەرمان</Label>
                  <Input id="medicationName" name="medicationName" dir="ltr" className="text-right" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dosage">شێوازی بەکارهێنان (Dosage)</Label>
                    <Input id="dosage" name="dosage" placeholder="بۆ نمونە: 1x3" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">ماوە (Duration)</Label>
                    <Input id="duration" name="duration" placeholder="بۆ نمونە: 7 ڕۆژ" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">تێبینی</Label>
                  <Textarea id="notes" name="notes" rows={3} />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>پاشگەزبوون</Button>
                  <Button type="submit" disabled={createPrescription.isPending}>پاشەکەوت</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* لیستی نوسخەکان بە شێوازی کارت (Card View) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full py-8 text-center text-muted-foreground">چاوەڕێ بکە...</div>
        ) : prescriptions?.length === 0 ? (
          <div className="col-span-full">
            <EmptyState title="هیچ نوسخەیەک نییە" description="نوسخە پزیشکییەکان لێرە دەردەکەون" />
          </div>
        ) : (
          prescriptions?.map((presc) => (
            <div key={presc.id} className="bg-card border rounded-lg p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h3 className="font-bold text-lg">{presc.patientName}</h3>
                  <p className="text-sm text-muted-foreground">پزیشک: {presc.doctorName}</p>
                </div>
                <PrescriptionPrint prescription={{
                  id: presc.id,
                  patientName: presc.patientName,
                  doctorName: presc.doctorName,
                  medicationName: presc.medicationName,
                  dosage: presc.dosage,
                  duration: presc.duration,
                  notes: presc.notes ?? undefined,
                  createdAt: presc.prescribedAt,
                }} />
              </div>
              <div>
                {/* ناوی دەرمانی بە ئینگلیزی/لاتینی لە لای ڕاست پیشان دەدرێت */}
                <p className="font-mono text-lg font-semibold dir-ltr text-right text-primary">{presc.medicationName}</p>
                <div className="flex gap-4 mt-2 text-sm">
                  <div><span className="text-muted-foreground">بەکارهێنان:</span> {presc.dosage}</div>
                  <div><span className="text-muted-foreground">ماوە:</span> {presc.duration}</div>
                </div>
                {presc.notes && (
                  <p className="mt-2 text-sm bg-muted/50 p-2 rounded">{presc.notes}</p>
                )}
              </div>
              <div className="text-xs text-muted-foreground pt-2 border-t">
                {formatDateTime(presc.prescribedAt)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
