import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDateTime } from "@/lib/i18n";
import { 
  useListInventoryItems, useCreateInventoryItem, useUpdateInventoryItem, 
  getListInventoryItemsQueryKey, useListInventoryTransactions
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus, AlertTriangle, Edit2, History } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

/**
 * لاپەڕەی کۆگا (Inventory)
 * بەڕێوەبردنی کەلوپەلی پزیشکی و ئۆفیس، چاودێریکردنی بڕی بەردەست و مێژووی گۆڕانکارییەکان
 */
export default function Inventory() {
  const [isOpen, setIsOpen] = useState(false); // بۆ کردنەوەی دیالۆگی زیادکردنی نوێ
  const [editOpen, setEditOpen] = useState<number | null>(null); // بۆ دەستکاریکردنی کەلوپەلێکی دیاریکراو
  const [historyOpen, setHistoryOpen] = useState<number | null>(null); // بۆ بینینی مێژووی گۆڕانکارییەکانی کەلوپەلێک
  
  // بارکردنی داتاکان و ئامادەکردنی کردارەکانی نوێکردنەوە
  const { data: items, isLoading } = useListInventoryItems();
  const createItem = useCreateInventoryItem();
  const updateItem = useUpdateInventoryItem();
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // مامەڵەکردن لەگەڵ فۆرمی زیادکردنی کەلوپەلێکی نوێ
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await createItem.mutateAsync({
        data: {
          name: formData.get("name") as string,
          category: formData.get("category") as string,
          unit: formData.get("unit") as string,
          quantity: Number(formData.get("quantity")),
          reorderLevel: Number(formData.get("reorderLevel")),
          unitPrice: Number(formData.get("unitPrice")),
          supplier: formData.get("supplier") as string || undefined,
        }
      });
      // نوێکردنەوەی لیستەکە پاش پاشەکەوتکردن
      queryClient.invalidateQueries({ queryKey: getListInventoryItemsQueryKey() });
      setIsOpen(false);
      toast({ title: "سەرکەوتوو بوو", description: "کەلوپەلی نوێ بۆ کۆگا زیادکرا" });
    } catch (error) {
      toast({ variant: "destructive", title: "هەڵە", description: "نەتوانرا کەلوپەل زیادبکرێت" });
    }
  };

  // مامەڵەکردن لەگەڵ فۆرمی دەستکاریکردنی بڕی کەلوپەل
  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editOpen) return;
    
    const formData = new FormData(e.currentTarget);
    try {
      await updateItem.mutateAsync({
        id: editOpen,
        data: {
          quantity: Number(formData.get("quantity")),
          reorderLevel: Number(formData.get("reorderLevel")),
          unitPrice: Number(formData.get("unitPrice")),
          supplier: formData.get("supplier") as string || undefined,
        }
      });
      queryClient.invalidateQueries({ queryKey: getListInventoryItemsQueryKey() });
      setEditOpen(null);
      toast({ title: "سەرکەوتوو بوو", description: "زانیاری کەلوپەل نوێکرایەوە" });
    } catch (error) {
      toast({ variant: "destructive", title: "هەڵە", description: "نەتوانرا زانیاری نوێبکرێتەوە" });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="کۆگا (Inventory)" 
        description="بەڕێوەبردنی کەلوپەلی پزیشکی و ئۆفیس"
        actions={
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 ml-2" /> کەلوپەلی نوێ</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>زیادکردنی کەلوپەل بۆ کۆگا</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="name">ناوی کەلوپەل</Label>
                    <Input id="name" name="name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">جۆر/پۆلێن</Label>
                    <Input id="category" name="category" placeholder="بۆ نمونە: پێداویستی پزیشکی" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">یەکە (Unit)</Label>
                    <Input id="unit" name="unit" placeholder="بۆ نمونە: پاکەت، کارتۆن، دانە" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">بڕی ئێستا</Label>
                    <Input id="quantity" name="quantity" type="number" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reorderLevel">ئاستی کەمبوونەوە</Label>
                    <Input id="reorderLevel" name="reorderLevel" type="number" defaultValue="10" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unitPrice">نرخی دانە (دینار)</Label>
                    <Input id="unitPrice" name="unitPrice" type="number" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplier">دابینکەر</Label>
                    <Input id="supplier" name="supplier" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>پاشگەزبوون</Button>
                  <Button type="submit" disabled={createItem.isPending}>پاشەکەوت</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* خشتەی نیشاندانی کەلوپەلەکان */}
      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ناوی کەلوپەل</TableHead>
              <TableHead>پۆلێن</TableHead>
              <TableHead>بڕی بەردەست</TableHead>
              <TableHead>نرخ</TableHead>
              <TableHead>دابینکەر</TableHead>
              <TableHead className="text-left">کردارەکان</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">چاوەڕێ بکە...</TableCell></TableRow>
            ) : items?.length === 0 ? (
              <TableRow><TableCell colSpan={6}><EmptyState title="کۆگا بەتاڵە" description="هیچ کەلوپەلێک لە کۆگا تۆمار نەکراوە" /></TableCell></TableRow>
            ) : (
              items?.map((item) => {
                // لۆژیکی ئاگادارکردنەوەی کەمبوونەوەی بڕ لە کۆگا
                const isLow = item.quantity <= item.reorderLevel;
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.name}
                      {/* نیشاندانی نیشانەی هۆشداری ئەگەر بڕەکە کەم بوو */}
                      {isLow && (
                        <Badge variant="destructive" className="mr-2 px-1 py-0 h-5 text-[10px]">
                          <AlertTriangle className="w-3 h-3 ml-1" /> کەمبووەتەوە
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>
                      <span className={isLow ? "text-rose-600 font-bold" : ""}>{item.quantity}</span> <span className="text-muted-foreground text-sm">{item.unit}</span>
                    </TableCell>
                    <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell>{item.supplier || '-'}</TableCell>
                    <TableCell className="text-left flex gap-1">
                      {/* دوگمەی دەستکاریکردن */}
                      <Dialog open={editOpen === item.id} onOpenChange={(open) => setEditOpen(open ? item.id : null)}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" title="دەستکاری">
                            <Edit2 className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>نوێکردنەوەی کەلوپەل: {item.name}</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleEditSubmit} className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="quantity">بڕی ئێستا</Label>
                                <Input id="quantity" name="quantity" type="number" defaultValue={item.quantity} required />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="reorderLevel">ئاستی کەمبوونەوە</Label>
                                <Input id="reorderLevel" name="reorderLevel" type="number" defaultValue={item.reorderLevel} required />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="unitPrice">نرخی دانە (دینار)</Label>
                                <Input id="unitPrice" name="unitPrice" type="number" defaultValue={item.unitPrice} required />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="supplier">دابینکەر</Label>
                                <Input id="supplier" name="supplier" defaultValue={item.supplier || ""} />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                              <Button type="button" variant="outline" onClick={() => setEditOpen(null)}>پاشگەزبوون</Button>
                              <Button type="submit" disabled={updateItem.isPending}>تۆمارکردن</Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>

                      {/* دوگمەی بینینی مێژووی گۆڕانکارییەکان (Audit History) */}
                      <Dialog open={historyOpen === item.id} onOpenChange={(open) => setHistoryOpen(open ? item.id : null)}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" title="مێژوو">
                            <History className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>مێژووی گۆڕانکارییەکان: {item.name}</DialogTitle>
                          </DialogHeader>
                          <div className="pt-4 max-h-[60vh] overflow-y-auto">
                            {/* بانگکردنی پێکهاتەی نیشاندانی وردەکاری مێژوو */}
                            <InventoryTransactions itemId={item.id} />
                          </div>
                        </DialogContent>
                      </Dialog>
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

/**
 * پێکهاتەیەک بۆ نیشاندانی مێژووی گۆڕانکارییەکانی دانە دانەی کەلوپەلەکان
 * وەک (زیادبوون، کەمبوون، یان ڕێکخستنەوەی کۆگا)
 */
function InventoryTransactions({ itemId }: { itemId: number }) {
  const { data: logs, isLoading } = useListInventoryTransactions({ itemId });

  if (isLoading) return <div className="py-8 text-center text-muted-foreground">چاوەڕێ بکە...</div>;
  if (!logs || logs.length === 0) return <div className="py-8 text-center text-muted-foreground italic">هیچ تۆمارێک نییە</div>;

  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <div key={log.id} className="flex justify-between items-center p-3 border rounded-lg bg-muted/30">
          <div>
            <div className="flex items-center gap-2">
              {/* دیاریکردنی ڕەنگ بەپێی جۆری کردارەکە */}
              <span className={`w-2 h-2 rounded-full ${
                log.type === 'in' ? 'bg-emerald-500' : 
                log.type === 'out' ? 'bg-rose-500' : 'bg-amber-500'
              }`} />
              <span className="font-medium">
                {log.type === 'in' ? 'زیادکرا' : 
                 log.type === 'out' ? 'کەمکرا' : 'گۆڕانکاری'}
              </span>
              <span className="text-sm font-mono dir-ltr">{log.change > 0 ? `+${log.change}` : log.change}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{log.reason || 'بەبێ هۆکار'}</p>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            {formatDateTime(log.createdAt)}
          </div>
        </div>
      ))}
    </div>
  );
}
