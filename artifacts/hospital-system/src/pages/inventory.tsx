import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/i18n";
import { useListInventoryItems, useCreateInventoryItem, useUpdateInventoryItem, getListInventoryItemsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus, AlertTriangle, Edit2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function Inventory() {
  const [isOpen, setIsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState<number | null>(null);
  
  const { data: items, isLoading } = useListInventoryItems();
  const createItem = useCreateInventoryItem();
  const updateItem = useUpdateInventoryItem();
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
      queryClient.invalidateQueries({ queryKey: getListInventoryItemsQueryKey() });
      setIsOpen(false);
      toast({ title: "سەرکەوتوو بوو", description: "کەلوپەلی نوێ بۆ کۆگا زیادکرا" });
    } catch (error) {
      toast({ variant: "destructive", title: "هەڵە", description: "نەتوانرا کەلوپەل زیادبکرێت" });
    }
  };

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
                const isLow = item.quantity <= item.reorderLevel;
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.name}
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
                    <TableCell className="text-left">
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
