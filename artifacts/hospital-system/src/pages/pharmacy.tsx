import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDateTime } from "@/lib/i18n";
import { 
  useListMedications, useCreateMedication, getListMedicationsQueryKey,
  useListPharmacySales, useCreatePharmacySale, getListPharmacySalesQueryKey,
  useListPatients
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus, AlertTriangle, Search } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

/**
 * لاپەڕەی بەڕێوەبردنی دەرمانخانە (Pharmacy Management)
 * کۆنترۆڵکردنی کۆگای دەرمان و تۆمارکردنی کڕین و فرۆشتنەکان
 */
export default function Pharmacy() {
  const [search, setSearch] = useState(""); // باری گەڕان
  const [medOpen, setMedOpen] = useState(false); // کردنەوەی فۆرمی دەرمانی نوێ
  const [saleOpen, setSaleOpen] = useState(false); // کردنەوەی فۆرمی فرۆشتن
  
  // بارکردنی داتاکان لە سێرڤەرەوە
  const { data: medications, isLoading: loadingMeds } = useListMedications();
  const { data: sales, isLoading: loadingSales } = useListPharmacySales();
  const { data: patients } = useListPatients();
  
  const createMed = useCreateMedication();
  const createSale = useCreatePharmacySale();
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // فلتەرکردنی دەرمانەکان بەپێی گەڕان
  const filteredMeds = medications?.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    (m.category && m.category.toLowerCase().includes(search.toLowerCase())) ||
    (m.manufacturer && m.manufacturer.toLowerCase().includes(search.toLowerCase()))
  );

  // فلتەرکردنی فرۆشتنەکان بەپێی گەڕان
  const filteredSales = sales?.filter(s => 
    s.patientName.toLowerCase().includes(search.toLowerCase()) || 
    s.medicationName.toLowerCase().includes(search.toLowerCase())
  );

  // تۆمارکردنی دەرمانی نوێ بۆ کۆگا
  const handleMedSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await createMed.mutateAsync({
        data: {
          name: formData.get("name") as string,
          category: formData.get("category") as string || undefined,
          unit: formData.get("unit") as string,
          stock: Number(formData.get("stock")),
          reorderLevel: Number(formData.get("reorderLevel")),
          price: Number(formData.get("price")),
          manufacturer: formData.get("manufacturer") as string || undefined,
          expiresOn: formData.get("expiresOn") as string || undefined,
        }
      });
      queryClient.invalidateQueries({ queryKey: getListMedicationsQueryKey() });
      setMedOpen(false);
      toast({ title: "سەرکەوتوو بوو", description: "دەرمانی نوێ زیادکرا" });
    } catch (error) {
      toast({ variant: "destructive", title: "هەڵە", description: "نەتوانرا دەرمان زیادبکرێت" });
    }
  };

  // تۆمارکردنی فرۆشتن و دەرکردنی دەرمان لە کۆگا
  const handleSaleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await createSale.mutateAsync({
        data: {
          patientName: formData.get("patientName") as string,
          patientId: formData.get("patientId") ? Number(formData.get("patientId")) : undefined,
          medicationId: Number(formData.get("medicationId")),
          quantity: Number(formData.get("quantity")),
        }
      });
      // نوێکردنەوەی لیستی فرۆشتنەکان
      queryClient.invalidateQueries({ queryKey: getListPharmacySalesQueryKey() });
      // گرنگ: نوێکردنەوەی بڕی دەرمان لە کۆگا پاش ئەوەی بەشێکی فرۆشرا
      queryClient.invalidateQueries({ queryKey: getListMedicationsQueryKey() });
      setSaleOpen(false);
      toast({ title: "سەرکەوتوو بوو", description: "فرۆشتنی دەرمان تۆمارکرا" });
    } catch (error) {
      toast({ variant: "destructive", title: "هەڵە", description: "نەتوانرا فرۆشتن تۆماربکرێت" });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="دەرمانخانە (Pharmacy)" 
        description="بەڕێوەبردنی کۆگای دەرمان و فرۆشتنەکان"
      />

      {/* مەکینەی گەڕان */}
      <div className="flex items-center mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="گەڕان بەدوای دەرمان، پۆلێن، یان ناوی نەخۆش..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>
      </div>

      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="inventory">کۆگای دەرمان</TabsTrigger>
          <TabsTrigger value="sales">فرۆشتنەکان</TabsTrigger>
        </TabsList>

        {/* تابی کۆگای دەرمانەکان */}
        <TabsContent value="inventory">
          <div className="flex justify-end mb-4">
            <Dialog open={medOpen} onOpenChange={setMedOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="w-4 h-4 ml-2" /> دەرمانی نوێ</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>زیادکردنی دەرمان</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleMedSubmit} className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="name">ناوی دەرمان</Label>
                      <Input id="name" name="name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">پۆلێن</Label>
                      <Input id="category" name="category" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">جۆری پێوانە</Label>
                      <select id="unit" name="unit" className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50" required>
                        <option value="tablet">حەب (Tablet)</option>
                        <option value="bottle">قوتوو (Bottle)</option>
                        <option value="tube">کرێم (Tube)</option>
                        <option value="vial">دەرزی (Vial)</option>
                        <option value="sachet">کیسە (Sachet)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stock">بڕی بەردەست</Label>
                      <Input id="stock" name="stock" type="number" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reorderLevel">ئاستی ئاگادارکردنەوە</Label>
                      <Input id="reorderLevel" name="reorderLevel" type="number" defaultValue="20" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">نرخی دانە (دینار)</Label>
                      <Input id="price" name="price" type="number" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiresOn">ڕێکەوتی بەسەرچوون</Label>
                      <Input id="expiresOn" name="expiresOn" type="date" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setMedOpen(false)}>پاشگەزبوون</Button>
                    <Button type="submit" disabled={createMed.isPending}>پاشەکەوت</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="border rounded-md bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ناوی دەرمان</TableHead>
                  <TableHead>پۆلێن</TableHead>
                  <TableHead>بڕی بەردەست</TableHead>
                  <TableHead>نرخ</TableHead>
                  <TableHead>کۆمپانیا</TableHead>
                  <TableHead>ڕێکەوتی بەسەرچوون</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingMeds ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8">چاوەڕێ بکە...</TableCell></TableRow>
                ) : filteredMeds?.length === 0 ? (
                  <TableRow><TableCell colSpan={6}><EmptyState title="هیچ دەرمانێک نەدۆزرایەوە" description="تۆماری کۆگا بەتاڵە یان گەڕانەکەت ئەنجامی نییە" /></TableCell></TableRow>
                ) : (
                  filteredMeds?.map((med) => {
                    const isLow = med.stock <= med.reorderLevel;
                    return (
                      <TableRow key={med.id}>
                        <TableCell className="font-medium">
                          {med.name}
                          {isLow && (
                            <Badge variant="destructive" className="mr-2 px-1 py-0 h-5 text-[10px]">
                              <AlertTriangle className="w-3 h-3 ml-1" /> کەمبووەتەوە
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{med.category || '-'}</TableCell>
                        <TableCell>
                          <span className={isLow ? "text-rose-600 font-bold" : ""}>{med.stock}</span> {med.unit}
                        </TableCell>
                        <TableCell>{formatCurrency(med.price)}</TableCell>
                        <TableCell>{med.manufacturer || '-'}</TableCell>
                        <TableCell>{med.expiresOn ? med.expiresOn : '-'}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* تابی تۆماری فرۆشتنەکان */}
        <TabsContent value="sales">
          <div className="flex justify-end mb-4">
            <Dialog open={saleOpen} onOpenChange={setSaleOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary"><Plus className="w-4 h-4 ml-2" /> فرۆشتنی نوێ</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>فرۆشتنی دەرمان</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSaleSubmit} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="patientName">ناوی نەخۆش</Label>
                    <Input id="patientName" name="patientName" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="patientId">نەخۆشی تۆمارکراو (ئارەزوومەندانە)</Label>
                    <select id="patientId" name="patientId" className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                      <option value="">هەڵبژێرە...</option>
                      {patients?.map(p => <option key={p.id} value={p.id}>{p.fullName} ({p.mrn})</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="medicationId">دەرمان</Label>
                    <select id="medicationId" name="medicationId" className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50" required>
                      <option value="">هەڵبژێرە...</option>
                      {medications?.filter(m => m.stock > 0).map(m => (
                        <option key={m.id} value={m.id}>{m.name} ({formatCurrency(m.price)} - بەردەست: {m.stock})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">بڕ</Label>
                    <Input id="quantity" name="quantity" type="number" min="1" defaultValue="1" required />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setSaleOpen(false)}>پاشگەزبوون</Button>
                    <Button type="submit" disabled={createSale.isPending}>تۆمارکردن</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="border rounded-md bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>کاتی فرۆشتن</TableHead>
                  <TableHead>نەخۆش</TableHead>
                  <TableHead>ناوی دەرمان</TableHead>
                  <TableHead>بڕ</TableHead>
                  <TableHead>نرخی دانە</TableHead>
                  <TableHead>کۆی گشتی</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingSales ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8">چاوەڕێ بکە...</TableCell></TableRow>
                ) : filteredSales?.length === 0 ? (
                  <TableRow><TableCell colSpan={6}><EmptyState title="هیچ فرۆشتنێک نەدۆزرایەوە" description="لیستی فرۆشتنەکان بەتاڵە یان گەڕانەکەت ئەنجامی نییە" /></TableCell></TableRow>
                ) : (
                  filteredSales?.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell dir="ltr" className="text-right text-sm text-muted-foreground">{formatDateTime(sale.soldAt)}</TableCell>
                      <TableCell className="font-medium">{sale.patientName}</TableCell>
                      <TableCell>{sale.medicationName}</TableCell>
                      <TableCell>{sale.quantity}</TableCell>
                      <TableCell>{formatCurrency(sale.unitPrice)}</TableCell>
                      <TableCell className="font-bold text-emerald-600">{formatCurrency(sale.total)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
