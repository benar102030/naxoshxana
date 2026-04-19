import { PageHeader } from "@/components/PageHeader";
import { useListBeds, useListAdmissions, useListPatients, useListStaff, useCreateAdmission, getListAdmissionsQueryKey, getListBedsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BedDouble, Users, UserPlus, Info } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { StatusBadge } from "@/components/StatusBadge";

/**
 * لاپەڕەی نەخشەی گرافیکی جێگاکان (Visual Bed Map)
 * ڕێگە دەدات بە بینینی هەموو بەشەکانی نەخۆشخانە و دۆخی جێگاکان بە شێوەیەکی گرافیکی
 */
export default function BedMap() {
  const [selectedBed, setSelectedBed] = useState<any>(null);
  const [isAdmissionOpen, setIsAdmissionOpen] = useState(false);
  const [isFreeUpOpen, setIsFreeUpOpen] = useState(false);
  
  const { data: beds, isLoading: loadingBeds } = useListBeds();
  const { data: admissions } = useListAdmissions();
  const { data: patients } = useListPatients();
  const { data: staff } = useListStaff();
  
  const createAdmission = useCreateAdmission();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const doctors = staff?.filter(s => s.role === 'doctor') || [];
  
  // گروپکردنی جێگاکان بەپێی قاوشەکان (Wards)
  const wards = Array.from(new Set(beds?.map(b => b.ward) || []));

  const handleAdmissionSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedBed) return;
    
    const formData = new FormData(e.currentTarget);
    try {
      await createAdmission.mutateAsync({
        data: {
          patientId: Number(formData.get("patientId")),
          bedId: selectedBed.id,
          doctorId: Number(formData.get("doctorId")),
          dailyRate: Number(formData.get("dailyRate")),
          reason: formData.get("reason") as string || undefined,
        }
      });
      queryClient.invalidateQueries({ queryKey: getListAdmissionsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getListBedsQueryKey() });
      setIsAdmissionOpen(false);
      setSelectedBed(null);
      toast({ title: "سەرکەوتوو بوو", description: "نەخۆش لەم جێگایە خەوێندرا" });
    } catch (error) {
      toast({ variant: "destructive", title: "هەڵە", description: "نەتوانرا نەخۆش بخەوێندرێت" });
    }
  };

  const handleFreeUpSubmit = async () => {
    if (!selectedBed) return;
    try {
      await fetch(`/api/beds/${selectedBed.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ occupied: false })
      });
      queryClient.invalidateQueries({ queryKey: getListBedsQueryKey() });
      setIsFreeUpOpen(false);
      setSelectedBed(null);
      toast({ title: "بەردەست کرا", description: "جێگاکە سەرکەوتووانە چۆڵکرا و هەژمار دەکرێت وەک جێگایەکی بەتاڵ" });
    } catch (error) {
      toast({ variant: "destructive", title: "هەڵە", description: "نەتوانرا گۆڕانکاری بکرێت" });
    }
  };

  if (loadingBeds) return <div className="p-8 text-center">چاوەڕێ بکە...</div>;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader 
        title="نەخشەی جێگاکان (Bed Map)" 
        description="بینینی دۆخی چۆڵی و پڕی جێگاکانی نەخۆشخانە بە شێوەی گرافیکی" 
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
         <div className="flex items-center gap-2 text-sm">
            <div className="w-4 h-4 bg-emerald-500 rounded-sm"></div>
            <span>بەردەست (Available)</span>
         </div>
         <div className="flex items-center gap-2 text-sm">
            <div className="w-4 h-4 bg-rose-500 rounded-sm"></div>
            <span>گیراوە (Occupied)</span>
         </div>
         <div className="flex items-center gap-2 text-sm">
            <div className="w-4 h-4 bg-amber-500 rounded-sm"></div>
            <span>لە چاککردنەوەدایە (Maintenance)</span>
         </div>
      </div>

      {wards.map(wardName => (
        <div key={wardName} className="space-y-4">
          <h3 className="text-xl font-bold border-r-4 border-primary pr-3 py-1 flex items-center gap-2 bg-primary/5 rounded-l-md">
            <BedDouble className="w-5 h-5 text-primary" />
            قاوشی: {wardName}
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {beds?.filter(b => b.ward === wardName).map(bed => {
              const currentAdmission = admissions?.find(a => a.bedId === bed.id && a.status === 'active');
              
              return (
                <Card 
                  key={bed.id} 
                  className={`cursor-pointer transition-all hover:shadow-md border-2 ${
                    bed.occupied ? 'border-rose-200 bg-rose-50/30' : 'border-emerald-200 bg-emerald-50/30'
                  }`}
                  onClick={() => {
                    setSelectedBed(bed);
                    if (!bed.occupied) {
                      setIsAdmissionOpen(true);
                    } else {
                      setIsFreeUpOpen(true);
                    }
                  }}
                >
                  <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm font-bold">جێگای {bed.bedNumber}</CardTitle>
                    <BedDouble className={`w-4 h-4 ${bed.occupied ? 'text-rose-500' : 'text-emerald-500'}`} />
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-xs text-muted-foreground mb-2">ژووری {bed.room}</div>
                    {bed.occupied ? (
                      <div className="space-y-1">
                        <div className="text-sm font-bold text-rose-700 truncate">{currentAdmission?.patientName || "نەخۆش"}</div>
                        <div className="text-[10px] text-rose-500">{currentAdmission?.doctorName}</div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs">
                        <UserPlus className="w-3 h-3" /> وەرگرتن
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      {/* دیالۆگی خەواندنی نەخۆش کاتێک کلیک لەسەر جێگایەکی چۆڵ دەکرێت */}
      <Dialog open={isAdmissionOpen} onOpenChange={setIsAdmissionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>خەواندنی نەخۆش لە جێگای {selectedBed?.bedNumber} - قاوشی {selectedBed?.ward}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdmissionSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="patientId">نەخۆش</Label>
              <select id="patientId" name="patientId" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" required>
                <option value="">هەڵبژێرە...</option>
                {patients?.map(p => <option key={p.id} value={p.id}>{p.fullName} ({p.mrn})</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="doctorId">پزیشکی سەرپەرشتیار</Label>
              <select id="doctorId" name="doctorId" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" required>
                <option value="">هەڵبژێرە...</option>
                {doctors.map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dailyRate">نرخی ڕۆژانە (دینار)</Label>
              <Input id="dailyRate" name="dailyRate" type="number" defaultValue="50000" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">هۆکاری خەواندن</Label>
              <Input id="reason" name="reason" placeholder="بۆ نمونە: نەشتەرگەری" />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAdmissionOpen(false)}>پاشگەزبوون</Button>
              <Button type="submit" disabled={createAdmission.isPending}>تەواوکردن</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {/* دیالۆگی چۆڵکردنی دەستی کاتێک کلیک لەسەر جێگایەکی پڕ دەکرێت */}
      <Dialog open={isFreeUpOpen} onOpenChange={setIsFreeUpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>چۆڵکردنەوەی جێگای {selectedBed?.bedNumber}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              تێبینی: ئەگەر بێتوو نەخۆشێکی تێدایە و بەفەرمی دەرچوو (Discharge)، ئەوا جێگاکە خۆکار چۆڵ دەبێت. بەڵام گەر جێگاکە بە هەڵە بە "پڕ" مایەوە، دەتوانیت لێرەوە دەستی پێ بکەیت و بگەڕێنیتەوە دۆخی "بەردەست". تۆ دڵنیایت دەتەوێت چۆڵی بکەیت؟
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsFreeUpOpen(false)}>نەخێر</Button>
              <Button type="button" variant="destructive" onClick={handleFreeUpSubmit}>بەڵێ، چۆڵی بکە</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
