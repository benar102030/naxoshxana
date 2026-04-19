import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDateTime } from "@/lib/i18n";
import { useListSurgeries, useCreateSurgery, useUpdateSurgery, getListSurgeriesQueryKey, useListPatients, useListStaff } from "@workspace/api-client-react";
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
 * لاپەڕەی بەڕێوەبردنی نەشتەرگەرییەکان
 * لێرەدا خشتەی نەشتەرگەری، پزیشکە نەشتەرگەرەکان، و ژوورەکانی نەشتەرگەری بەڕێوەدەبرێن
 */
export default function Surgery() {
  const [isOpen, setIsOpen] = useState(false); // پەنجەرەی خشتەکردنی نەشتەرگەری نوێ
  
  // بارکردنی دراوەکان
  const { data: surgeries, isLoading } = useListSurgeries();
  const { data: patients } = useListPatients();
  const { data: staff } = useListStaff();
  
  const createSurgery = useCreateSurgery();
  const updateSurgery = useUpdateSurgery();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // فلتەرکردنی پزیشکەکان بۆ هەڵبژاردنی نەشتەرگەر
  const surgeons = staff?.filter(s => s.role === 'doctor') || [];

  /**
   * تۆمارکردنی کاتێکی نوێی نەشتەرگەری
   * لێرەدا ژووری نەشتەرگەری (OR) و جۆری سڕکردن (Anesthesia) دیاری دەکرێن
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await createSurgery.mutateAsync({
        data: {
          patientId: Number(formData.get("patientId")),
          surgeonId: Number(formData.get("surgeonId")),
          operatingRoom: formData.get("operatingRoom") as string,
          scheduledAt: formData.get("scheduledAt") as string,
          procedureName: formData.get("procedureName") as string,
          anesthesia: formData.get("anesthesia") as string || undefined,
        }
      });
      queryClient.invalidateQueries({ queryKey: getListSurgeriesQueryKey() });
      setIsOpen(false);
      toast({ title: "سەرکەوتوو بوو", description: "نەشتەرگەری نوێ زیادکرا" });
    } catch (error) {
      toast({ variant: "destructive", title: "هەڵە", description: "نەتوانرا نەشتەرگەری زیادبکرێت" });
    }
  };

  // گۆڕینی دۆخی نەشتەرگەری (وەک: 'تەواوبوو' دوای ئەنجامدانی نۆرەکە)
  const handleStatusChange = async (id: number, status: string) => {
    try {
      await updateSurgery.mutateAsync({ id, data: { status } });
      queryClient.invalidateQueries({ queryKey: getListSurgeriesQueryKey() });
      toast({ title: "سەرکەوتوو بوو", description: "دۆخ نوێکرایەوە" });
    } catch (error) {
      toast({ variant: "destructive", title: "هەڵە", description: "نەتوانرا دۆخ نوێبکرێتەوە" });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="نەشتەرگەری" 
        description="خشتە و بەڕێوەبردنی نەشتەرگەرییەکان"
        actions={
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 ml-2" /> نەشتەرگەری نوێ</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>خشتەکردنی نەشتەرگەری</DialogTitle>
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
                  <Label htmlFor="surgeonId">پزیشکی نەشتەرگەر</Label>
                  <select id="surgeonId" name="surgeonId" className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50" required>
                    <option value="">هەڵبژێرە...</option>
                    {surgeons.map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="procedureName">ناوی نەشتەرگەری</Label>
                  <Input id="procedureName" name="procedureName" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="operatingRoom">ژووری نەشتەرگەری (OR)</Label>
                    <Input id="operatingRoom" name="operatingRoom" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="anesthesia">جۆری سڕکردن</Label>
                    <Input id="anesthesia" name="anesthesia" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduledAt">کاتی نەشتەرگەری</Label>
                  <Input id="scheduledAt" name="scheduledAt" type="datetime-local" required />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>پاشگەزبوون</Button>
                  <Button type="submit" disabled={createSurgery.isPending}>پاشەکەوت</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* خشتەی گشتی نەشتەرگەرییەکان */}
      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>نەخۆش</TableHead>
              <TableHead>نەشتەرگەری</TableHead>
              <TableHead>پزیشک</TableHead>
              <TableHead>ژوور</TableHead>
              <TableHead>کات</TableHead>
              <TableHead>دۆخ</TableHead>
              <TableHead className="text-left">کردارەکان</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8">چاوەڕێ بکە...</TableCell></TableRow>
            ) : surgeries?.length === 0 ? (
              <TableRow><TableCell colSpan={7}><EmptyState title="هیچ نەشتەرگەرییەک نییە" description="لیستی نەشتەرگەرییەکان لێرە دەردەکەوێت" /></TableCell></TableRow>
            ) : (
              surgeries?.map((surgery) => (
                <TableRow key={surgery.id}>
                  <TableCell className="font-medium">{surgery.patientName}</TableCell>
                  <TableCell>{surgery.procedureName}</TableCell>
                  <TableCell>{surgery.surgeonName}</TableCell>
                  <TableCell>{surgery.operatingRoom}</TableCell>
                  <TableCell dir="ltr" className="text-right text-sm text-muted-foreground">{formatDateTime(surgery.scheduledAt)}</TableCell>
                  <TableCell><StatusBadge status={surgery.status} /></TableCell>
                  <TableCell className="text-left">
                    {/* گۆڕینی قۆناغەکانی پێش و پاش نەشتەرگەری */}
                    <Select value={surgery.status} onValueChange={(val) => handleStatusChange(surgery.id, val)}>
                      <SelectTrigger className="w-[130px] h-8">
                        <SelectValue placeholder="گۆڕینی دۆخ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">دیاریکراو</SelectItem>
                        <SelectItem value="inprogress">لە کاردایە</SelectItem>
                        <SelectItem value="completed">تەواوبوو</SelectItem>
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
