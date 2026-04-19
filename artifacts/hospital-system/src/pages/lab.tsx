import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency, formatDateTime } from "@/lib/i18n";
import { useListLabTests, useCreateLabTest, useUpdateLabTest, getListLabTestsQueryKey, useListPatients, useListStaff } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

export default function Lab() {
  const [isOpen, setIsOpen] = useState(false);
  const [resultOpen, setResultOpen] = useState<number | null>(null);
  
  const { data: tests, isLoading } = useListLabTests();
  const { data: patients } = useListPatients();
  const { data: staff } = useListStaff();
  
  const createTest = useCreateLabTest();
  const updateTest = useUpdateLabTest();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const doctors = staff?.filter(s => s.role === 'doctor') || [];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await createTest.mutateAsync({
        data: {
          patientId: Number(formData.get("patientId")),
          doctorId: Number(formData.get("doctorId")),
          testName: formData.get("testName") as string,
          category: formData.get("category") as string,
          price: Number(formData.get("price")),
          normalRange: formData.get("normalRange") as string || undefined,
        }
      });
      queryClient.invalidateQueries({ queryKey: getListLabTestsQueryKey() });
      setIsOpen(false);
      toast({ title: "سەرکەوتوو بوو", description: "پشکنینی نوێ زیادکرا" });
    } catch (error) {
      toast({ variant: "destructive", title: "هەڵە", description: "نەتوانرا پشکنین زیادبکرێت" });
    }
  };

  const handleResultSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!resultOpen) return;
    
    const formData = new FormData(e.currentTarget);
    try {
      await updateTest.mutateAsync({
        id: resultOpen,
        data: {
          status: "completed",
          result: formData.get("result") as string,
        }
      });
      queryClient.invalidateQueries({ queryKey: getListLabTestsQueryKey() });
      setResultOpen(null);
      toast({ title: "سەرکەوتوو بوو", description: "ئەنجامی پشکنین تۆمارکرا" });
    } catch (error) {
      toast({ variant: "destructive", title: "هەڵە", description: "نەتوانرا ئەنجام تۆماربکرێت" });
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await updateTest.mutateAsync({ id, data: { status } });
      queryClient.invalidateQueries({ queryKey: getListLabTestsQueryKey() });
      toast({ title: "سەرکەوتوو بوو", description: "دۆخ نوێکرایەوە" });
    } catch (error) {
      toast({ variant: "destructive", title: "هەڵە", description: "نەتوانرا دۆخ نوێبکرێتەوە" });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="تاقیگە (Lab)" 
        description="بەڕێوەبردنی پشکنینەکان و ئەنجامەکان"
        actions={
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 ml-2" /> پشکنینی نوێ</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>داواکردنی پشکنین</DialogTitle>
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
                    <Label htmlFor="testName">ناوی پشکنین</Label>
                    <Input id="testName" name="testName" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">بەش</Label>
                    <select id="category" name="category" className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50" required>
                      <option value="blood">خوێن (Blood)</option>
                      <option value="urine">میز (Urine)</option>
                      <option value="biochemistry">کیمیا (Biochem)</option>
                      <option value="microbiology">مایکرۆ (Microbiology)</option>
                      <option value="other">تر (Other)</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="normalRange">ڕێژەی ئاسایی (Normal Range)</Label>
                    <Input id="normalRange" name="normalRange" dir="ltr" className="text-right" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">نرخ (دینار)</Label>
                    <Input id="price" name="price" type="number" defaultValue="15000" required />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>پاشگەزبوون</Button>
                  <Button type="submit" disabled={createTest.isPending}>پاشەکەوت</Button>
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
              <TableHead>پشکنین</TableHead>
              <TableHead>بەش</TableHead>
              <TableHead>پزیشک</TableHead>
              <TableHead>کات</TableHead>
              <TableHead>دۆخ</TableHead>
              <TableHead className="text-left">کردارەکان</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8">چاوەڕێ بکە...</TableCell></TableRow>
            ) : tests?.length === 0 ? (
              <TableRow><TableCell colSpan={7}><EmptyState title="هیچ پشکنینێک نییە" description="لیستی پشکنینەکان لێرە دەردەکەوێت" /></TableCell></TableRow>
            ) : (
              tests?.map((test) => (
                <TableRow key={test.id}>
                  <TableCell className="font-medium">{test.patientName}</TableCell>
                  <TableCell>
                    {test.testName}
                    {test.result && <span className="block text-xs text-muted-foreground mt-1 truncate max-w-[150px]">ئەنجام: {test.result}</span>}
                  </TableCell>
                  <TableCell>
                    {test.category === 'blood' ? 'خوێن' : 
                     test.category === 'urine' ? 'میز' : 
                     test.category === 'biochemistry' ? 'کیمیا' : 
                     test.category === 'microbiology' ? 'مایکرۆ' : 'تر'}
                  </TableCell>
                  <TableCell>{test.doctorName}</TableCell>
                  <TableCell dir="ltr" className="text-right text-sm text-muted-foreground">{formatDateTime(test.requestedAt)}</TableCell>
                  <TableCell><StatusBadge status={test.status} /></TableCell>
                  <TableCell className="text-left">
                    <div className="flex justify-end gap-2">
                      <Select value={test.status} onValueChange={(val) => handleStatusChange(test.id, val)}>
                        <SelectTrigger className="w-[130px] h-8">
                          <SelectValue placeholder="گۆڕینی دۆخ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">هەڵواسراو</SelectItem>
                          <SelectItem value="sample_collected">نمونە وەرگیرا</SelectItem>
                          <SelectItem value="completed">تەواوبوو</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Dialog open={resultOpen === test.id} onOpenChange={(open) => setResultOpen(open ? test.id : null)}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">ئەنجام</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>تۆمارکردنی ئەنجامی پشکنین</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleResultSubmit} className="space-y-4 pt-4">
                            <div className="space-y-2">
                              <Label htmlFor="result">ئەنجام (Result)</Label>
                              <Textarea id="result" name="result" defaultValue={test.result || ""} rows={5} dir="ltr" className="text-right font-mono" required />
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ڕێژەی ئاسایی: <span dir="ltr" className="inline-block">{test.normalRange || 'دیارینەکراوە'}</span>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                              <Button type="button" variant="outline" onClick={() => setResultOpen(null)}>پاشگەزبوون</Button>
                              <Button type="submit" disabled={updateTest.isPending}>تۆمارکردن</Button>
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
