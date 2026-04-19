import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency, formatDateTime } from "@/lib/i18n";
import { useListRadiologyOrders, useCreateRadiologyOrder, useUpdateRadiologyOrder, getListRadiologyOrdersQueryKey, useListPatients, useListStaff } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

/**
 * لاپەڕەی تیشک و وێنەگری پزیشکی (Radiology)
 * ئەم بەشە ڕێگە دەدات بە داواکردنی تیشک و وێنەگرتنی جۆراوجۆر و تۆمارکردنی ڕاپۆرتەکان
 */
export default function Radiology() {
  const [search, setSearch] = useState(""); // گەڕان بەدوای ناو یان ئەندامی جەستە
  const [modalityFilter, setModalityFilter] = useState("all"); // فلتەری جۆری تیشک (مفراس، ڕەنین، هتد)
  const [isOpen, setIsOpen] = useState(false); // پەنجەرەی داواکاری نوێ
  const [reportOpen, setReportOpen] = useState<number | null>(null); // پەنجەرەی ڕاپۆرت
  
  // بارکردنی زانیارییەکان لە سێرڤەرەوە
  const { data: orders, isLoading } = useListRadiologyOrders();
  const { data: patients } = useListPatients();
  const { data: staff } = useListStaff();
  
  const createOrder = useCreateRadiologyOrder();
  const updateOrder = useUpdateRadiologyOrder();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // فلتەرکردنی لیستی تیشکەکان بەپێی گەڕان و جۆری ئامێری وێنەگرتن
  const filteredOrders = orders?.filter(order => {
    const matchesSearch = order.patientName.toLowerCase().includes(search.toLowerCase()) || 
                         order.bodyPart.toLowerCase().includes(search.toLowerCase());
    const matchesModality = modalityFilter === 'all' || order.modality === modalityFilter;
    return matchesSearch && matchesModality;
  });

  const doctors = staff?.filter(s => s.role === 'doctor') || [];

  // ناردنی داواکارییەکی نوێی تیشک بۆ نەخۆش
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await createOrder.mutateAsync({
        data: {
          patientId: Number(formData.get("patientId")),
          doctorId: Number(formData.get("doctorId")),
          modality: formData.get("modality") as string,
          bodyPart: formData.get("bodyPart") as string,
          price: Number(formData.get("price")),
        }
      });
      queryClient.invalidateQueries({ queryKey: getListRadiologyOrdersQueryKey() });
      setIsOpen(false);
      toast({ title: "سەرکەوتوو بوو", description: "داواکاری تیشکی نوێ زیادکرا" });
    } catch (error) {
      toast({ variant: "destructive", title: "هەڵە", description: "نەتوانرا داواکاری زیادبکرێت" });
    }
  };

  /**
   * تۆمارکردنی ڕاپۆرتی کۆتایی تیشکەکە
   * دەکرێت بەستەری وێنەی ئەشیعەکەش هاوپێچ بکرێت
   */
  const handleReportSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!reportOpen) return;
    
    const formData = new FormData(e.currentTarget);
    try {
      await updateOrder.mutateAsync({
        id: reportOpen,
        data: {
          status: "completed",
          report: formData.get("report") as string,
          imageUrl: formData.get("imageUrl") as string || undefined,
        }
      });
      queryClient.invalidateQueries({ queryKey: getListRadiologyOrdersQueryKey() });
      setReportOpen(null);
      toast({ title: "سەرکەوتوو بوو", description: "ڕاپۆرتی تیشک تۆمارکرا" });
    } catch (error) {
      toast({ variant: "destructive", title: "هەڵە", description: "نەتوانرا ڕاپۆرت تۆماربکرێت" });
    }
  };

  // گۆڕینی دۆخی پشکنین (بۆ نموونە کاتێک ئەنجام درا)
  const handleStatusChange = async (id: number, status: string) => {
    try {
      await updateOrder.mutateAsync({ id, data: { status } });
      queryClient.invalidateQueries({ queryKey: getListRadiologyOrdersQueryKey() });
      toast({ title: "سەرکەوتوو بوو", description: "دۆخ نوێکرایەوە" });
    } catch (error) {
      toast({ variant: "destructive", title: "هەڵە", description: "نەتوانرا دۆخ نوێبکرێتەوە" });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="تیشک (Radiology)" 
        description="بەڕێوەبردنی داواکارییەکانی تیشک و وێنەگرتن"
        actions={
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 ml-2" /> داواکاری نوێ</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>داواکردنی تیشک</DialogTitle>
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
                  <Label htmlFor="doctorId">پزیشکی داواکار</Label>
                  <select id="doctorId" name="doctorId" className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50" required>
                    <option value="">هەڵبژێرە...</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="modality">جۆری تیشک</Label>
                    <select id="modality" name="modality" className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50" required>
                      <option value="xray">تیشکی سینی (X-Ray)</option>
                      <option value="ct">مفراس (CT Scan)</option>
                      <option value="mri">رەنین (MRI)</option>
                      <option value="ultrasound">سۆنار (Ultrasound)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bodyPart">ئەندامی جەستە</Label>
                    <Input id="bodyPart" name="bodyPart" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">نرخ (دینار)</Label>
                  <Input id="price" name="price" type="number" defaultValue="25000" required />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>پاشگەزبوون</Button>
                  <Button type="submit" disabled={createOrder.isPending}>پاشەکەوت</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* بەشی فلتەرکردنی خێرا */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="گەڕان بەدوای نەخۆش یان ئەندامی جەستە..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>
        <select 
          value={modalityFilter}
          onChange={(e) => setModalityFilter(e.target.value)}
          className="flex h-9 w-full md:w-[150px] items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="all">هەموو جۆرەکان</option>
          <option value="xray">X-Ray</option>
          <option value="ct">CT Scan</option>
          <option value="mri">MRI</option>
          <option value="ultrasound">Ultrasound</option>
        </select>
      </div>

      {/* خشتەی داواکارییەکانی تیشک */}
      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>نەخۆش</TableHead>
              <TableHead>جۆری تیشک</TableHead>
              <TableHead>ئەندام</TableHead>
              <TableHead>پزیشک</TableHead>
              <TableHead>کات</TableHead>
              <TableHead>دۆخ</TableHead>
              <TableHead className="text-left">کردارەکان</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8">چاوەڕێ بکە...</TableCell></TableRow>
            ) : filteredOrders?.length === 0 ? (
              <TableRow><TableCell colSpan={7}><EmptyState title="هیچ داواکارییەک نەدۆزرایەوە" description="لیستی تیشکەکان لێرە دەردەکەوێت" /></TableCell></TableRow>
            ) : (
              filteredOrders?.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.patientName}</TableCell>
                  <TableCell className="uppercase">{order.modality}</TableCell>
                  <TableCell>{order.bodyPart}</TableCell>
                  <TableCell>{order.doctorName}</TableCell>
                  <TableCell dir="ltr" className="text-right text-sm text-muted-foreground">{formatDateTime(order.requestedAt)}</TableCell>
                  <TableCell><StatusBadge status={order.status} /></TableCell>
                  <TableCell className="text-left">
                    <div className="flex justify-end gap-2">
                      <Select value={order.status} onValueChange={(val) => handleStatusChange(order.id, val)}>
                        <SelectTrigger className="w-[130px] h-8">
                          <SelectValue placeholder="گۆڕینی دۆخ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">هەڵواسراو</SelectItem>
                          <SelectItem value="completed">تەواوبوو</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {/* پەنجەرەی تۆمارکردنی ڕاپۆرتی تیشک */}
                      <Dialog open={reportOpen === order.id} onOpenChange={(open) => setReportOpen(open ? order.id : null)}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">ڕاپۆرت</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>تۆمارکردنی ڕاپۆرتی تیشک</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleReportSubmit} className="space-y-4 pt-4">
                            <div className="space-y-2">
                              <Label htmlFor="imageUrl">بەستەری وێنە (ئارەزوومەندانە)</Label>
                              <Input id="imageUrl" name="imageUrl" defaultValue={order.imageUrl || ""} dir="ltr" className="text-right" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="report">ڕاپۆرت (Report)</Label>
                              <Textarea id="report" name="report" defaultValue={order.report || ""} rows={6} required />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                              <Button type="button" variant="outline" onClick={() => setReportOpen(null)}>پاشگەزبوون</Button>
                              <Button type="submit" disabled={updateOrder.isPending}>تۆمارکردن</Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
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
