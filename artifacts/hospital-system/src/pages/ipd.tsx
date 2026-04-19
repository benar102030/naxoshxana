import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency, formatDateTime } from "@/lib/i18n";
import { useListAdmissions, useListBeds, useCreateAdmission, useUpdateAdmission, getListAdmissionsQueryKey, useListPatients, useListStaff } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BedDouble, Plus } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function IPD() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: admissions, isLoading } = useListAdmissions();
  const { data: beds } = useListBeds();
  const { data: patients } = useListPatients();
  const { data: staff } = useListStaff();
  
  const createAdmission = useCreateAdmission();
  const updateAdmission = useUpdateAdmission();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const doctors = staff?.filter(s => s.role === 'doctor') || [];
  const availableBeds = beds?.filter(b => !b.occupied) || [];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await createAdmission.mutateAsync({
        data: {
          patientId: Number(formData.get("patientId")),
          bedId: Number(formData.get("bedId")),
          doctorId: Number(formData.get("doctorId")),
          dailyRate: Number(formData.get("dailyRate")),
          reason: formData.get("reason") as string || undefined,
        }
      });
      queryClient.invalidateQueries({ queryKey: getListAdmissionsQueryKey() });
      setIsOpen(false);
      toast({ title: "سەرکەوتوو بوو", description: "نەخۆش خەوێندرا" });
    } catch (error) {
      toast({ variant: "destructive", title: "هەڵە", description: "نەتوانرا نەخۆش بخەوێندرێت" });
    }
  };

  const handleDischarge = async (id: number) => {
    if (!confirm("دڵنیایت لە دەرکردنی ئەم نەخۆشە؟")) return;
    try {
      await updateAdmission.mutateAsync({ 
        id, 
        data: { 
          status: "discharged",
          dischargedAt: new Date().toISOString()
        } 
      });
      queryClient.invalidateQueries({ queryKey: getListAdmissionsQueryKey() });
      toast({ title: "سەرکەوتوو بوو", description: "نەخۆش دەرچوو" });
    } catch (error) {
      toast({ variant: "destructive", title: "هەڵە", description: "نەتوانرا کردارەکە ئەنجام بدرێت" });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="نوستن لە نەخۆشخانە" 
        description="بەڕێوەبردنی نەخۆشە خەوێندراوەکان و جێگاکان"
        actions={
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 ml-2" /> وەرگرتنی نوێ</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>خەواندنی نەخۆش</DialogTitle>
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
                  <Label htmlFor="bedId">جێگا</Label>
                  <select id="bedId" name="bedId" className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50" required>
                    <option value="">هەڵبژێرە...</option>
                    {availableBeds.map(b => <option key={b.id} value={b.id}>{b.ward} - ژووری {b.room} - جێگای {b.bedNumber}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctorId">پزیشکی سەرپەرشتیار</Label>
                  <select id="doctorId" name="doctorId" className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50" required>
                    <option value="">هەڵبژێرە...</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dailyRate">نرخی ڕۆژانە (بە دینار)</Label>
                  <Input id="dailyRate" name="dailyRate" type="number" defaultValue="50000" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">هۆکاری خەواندن</Label>
                  <Input id="reason" name="reason" />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>پاشگەزبوون</Button>
                  <Button type="submit" disabled={createAdmission.isPending}>پاشەکەوت</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">کۆی جێگاکان</p>
            <p className="text-2xl font-bold">{beds?.length || 0}</p>
          </div>
          <BedDouble className="w-8 h-8 text-primary opacity-50" />
        </div>
        <div className="bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/50 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">بەردەست</p>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{availableBeds.length}</p>
          </div>
        </div>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>نەخۆش</TableHead>
              <TableHead>جێگا</TableHead>
              <TableHead>پزیشک</TableHead>
              <TableHead>کاتی وەرگرتن</TableHead>
              <TableHead>هۆکار</TableHead>
              <TableHead>دۆخ</TableHead>
              <TableHead className="text-left">کردارەکان</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8">چاوەڕێ بکە...</TableCell></TableRow>
            ) : admissions?.length === 0 ? (
              <TableRow><TableCell colSpan={7}><EmptyState title="هیچ نەخۆشێکی خەوێندراو نییە" description="نەخۆشەکان لێرە دەردەکەون" /></TableCell></TableRow>
            ) : (
              admissions?.map((ad) => (
                <TableRow key={ad.id}>
                  <TableCell className="font-medium">{ad.patientName}</TableCell>
                  <TableCell>{ad.bedLabel}</TableCell>
                  <TableCell>{ad.doctorName}</TableCell>
                  <TableCell dir="ltr" className="text-right text-sm text-muted-foreground">{formatDateTime(ad.admittedAt)}</TableCell>
                  <TableCell>{ad.reason || '-'}</TableCell>
                  <TableCell><StatusBadge status={ad.status} /></TableCell>
                  <TableCell className="text-left">
                    {ad.status === 'active' && (
                      <Button variant="outline" size="sm" onClick={() => handleDischarge(ad.id)}>
                        دەرکردن
                      </Button>
                    )}
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
