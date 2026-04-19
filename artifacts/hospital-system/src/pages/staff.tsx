import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useListStaff, useListShifts, useListLeaves, useListPayroll, useCreateStaff, getListStaffQueryKey } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/EmptyState";
import { RoleBadge } from "@/components/RoleBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";
import { AdminDeleteButton } from "@/components/AdminActions";

/**
 * لاپەڕەی بەڕێوەبردنی کارمەندان و سەرچاوە مرۆییەکان (HR Management)
 */
export default function Staff() {
  const [search, setSearch] = useState(""); // باری گەڕان بەدوای کارمەند
  const [isOpen, setIsOpen] = useState(false); // بۆ کردنەوەی فۆرمی کارمەندی نوێ
  
  // بارکردنی هەموو داتاکانی پەیوەندیدار بە ستاف
  const { data: staff, isLoading: loadingStaff } = useListStaff();
  const { data: shifts, isLoading: loadingShifts } = useListShifts();
  const { data: leaves, isLoading: loadingLeaves } = useListLeaves();
  const { data: payroll, isLoading: loadingPayroll } = useListPayroll();
  
  const createStaff = useCreateStaff();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // مامەڵەکردن لەگەڵ ناردنی فۆرمی تۆمارکردنی کارمەند
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await createStaff.mutateAsync({
        data: {
          fullName: formData.get("fullName") as string,
          username: formData.get("username") as string,
          password: formData.get("password") as string,
          role: formData.get("role") as string,
          department: formData.get("department") as string || undefined,
          phone: formData.get("phone") as string || undefined,
          salary: Number(formData.get("salary")) || undefined,
        }
      });
      // نوێکردنەوەی لیستەکە لە کاتی سەرکەوتن
      queryClient.invalidateQueries({ queryKey: getListStaffQueryKey() });
      setIsOpen(false);
      toast({ title: "سەرکەوتوو بوو", description: "کارمەندی نوێ زیادکرا" });
    } catch (error) {
      toast({ variant: "destructive", title: "هەڵە", description: "نەتوانرا کارمەند زیادبکرێت" });
    }
  };

  // فلتەرکردنی لیستی کارمەندان بەپێی ناوی تەواو، ناوی بەکارهێنەر یان بەش
  const filteredStaff = staff?.filter(s => 
    s.fullName.toLowerCase().includes(search.toLowerCase()) || 
    s.username.toLowerCase().includes(search.toLowerCase()) ||
    (s.department && s.department.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title="سەرچاوە مرۆییەکان" 
        description="بەڕێوەبردنی کارمەندان، دەوام، و موچە" 
        actions={
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 ml-2" /> کارمەندی نوێ</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>زیادکردنی کارمەند</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">ناوی تەواو</Label>
                    <Input id="fullName" name="fullName" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">ناوی بەکارهێنەر (Username)</Label>
                    <Input id="username" name="username" required dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">تێپەڕەوشە (Password)</Label>
                    <Input id="password" name="password" type="password" required dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">پایە / ڕۆڵ</Label>
                    <select id="role" name="role" className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50" required>
                      <option value="doctor">پزیشک</option>
                      <option value="nurse">پەرستار</option>
                      <option value="pharmacist">دەرمانفرۆش</option>
                      <option value="cashier">سندوقدار</option>
                      <option value="labtech">تەکنیسیەنی تاقیگە</option>
                      <option value="radtech">تەکنیسیەنی تیشک</option>
                      <option value="manager">بەڕێوەبەر</option>
                      <option value="admin">بەڕێوەبەری گشتی</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">بەش</Label>
                    <Input id="department" name="department" placeholder="بۆ نمونە: فریاگوزاری" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">ژمارەی تەلەفۆن</Label>
                    <Input id="phone" name="phone" dir="ltr" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="salary">موچەی بنەڕەتی (بۆ هەر مانگێک)</Label>
                    <Input id="salary" name="salary" type="number" step="1000" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>پاشگەزبوون</Button>
                  <Button type="submit" disabled={createStaff.isPending}>پاشەکەوت</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* بەشی گەڕان بەدوای ستاف */}
      <div className="flex items-center mb-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="گەڕان بەدوای ناو یان بەش..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>
      </div>

      {/* تابتۆکانی جیاکردنەوەی بەشەکان */}
      <Tabs defaultValue="staff" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="staff">کارمەندان</TabsTrigger>
          <TabsTrigger value="shifts">خشتەی دەوام</TabsTrigger>
          <TabsTrigger value="leaves">مۆڵەتەکان</TabsTrigger>
          <TabsTrigger value="payroll">موچە</TabsTrigger>
        </TabsList>

        {/* لیستی سەرەکی کارمەندان */}
        <TabsContent value="staff" className="border rounded-md bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ناوی کارمەند</TableHead>
                <TableHead>ناوی بەکارهێنەر</TableHead>
                <TableHead>پایە</TableHead>
                <TableHead>بەش</TableHead>
                <TableHead>تەلەفۆن</TableHead>
                <TableHead>بەرواری دامەزراندن</TableHead>
                <TableHead className="text-left">کردارەکان</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingStaff ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">چاوەڕێ بکە...</TableCell></TableRow>
              ) : filteredStaff?.length === 0 ? (
                <TableRow><TableCell colSpan={6}><EmptyState title="هیچ کارمەندێک نەدۆزرایەوە" description="دەتوانیت ستافی نوێ زیاد بکەیت" /></TableCell></TableRow>
              ) : (
                filteredStaff?.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.fullName}</TableCell>
                    <TableCell dir="ltr" className="text-right text-muted-foreground">{s.username}</TableCell>
                    <TableCell><RoleBadge role={s.role} /></TableCell>
                    <TableCell>{s.department || '-'}</TableCell>
                    <TableCell dir="ltr" className="text-right">{s.phone || '-'}</TableCell>
                    <TableCell>{formatDate(s.joinedAt)}</TableCell>
                    <TableCell className="text-left">
                      <AdminDeleteButton
                        itemName={s.fullName}
                        size="icon"
                        onDelete={async () => {
                          await fetch(`/api/staff/${s.id}`, { method: "DELETE" });
                          queryClient.invalidateQueries({ queryKey: getListStaffQueryKey() });
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TabsContent>

        {/* لیستی خشتەی دەوامی کارمەندان */}
        <TabsContent value="shifts" className="border rounded-md bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ناوی کارمەند</TableHead>
                <TableHead>ڕێکەوت</TableHead>
                <TableHead>جۆری دەوام</TableHead>
                <TableHead>تێبینی</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingShifts ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8">چاوەڕێ بکە...</TableCell></TableRow>
              ) : shifts?.length === 0 ? (
                <TableRow><TableCell colSpan={4}><EmptyState title="هیچ خشتەیەک نییە" description="خشتەی دەوامی کارمەندان لێرە دەردەکەوێت" /></TableCell></TableRow>
              ) : (
                shifts?.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.staffName}</TableCell>
                    <TableCell>{formatDate(s.shiftDate)}</TableCell>
                    <TableCell>
                      {s.shiftType === 'morning' ? 'بەیانی' : s.shiftType === 'evening' ? 'ئێوارە' : 'شەو'}
                    </TableCell>
                    <TableCell>{s.notes || '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TabsContent>

        {/* بەشی بەڕێوەبردنی مۆڵەتەکان */}
        <TabsContent value="leaves" className="border rounded-md bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ناوی کارمەند</TableHead>
                <TableHead>جۆری مۆڵەت</TableHead>
                <TableHead>لە بەرواری</TableHead>
                <TableHead>بۆ بەرواری</TableHead>
                <TableHead>هۆکار</TableHead>
                <TableHead>دۆخ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingLeaves ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">چاوەڕێ بکە...</TableCell></TableRow>
              ) : leaves?.length === 0 ? (
                <TableRow><TableCell colSpan={6}><EmptyState title="هیچ مۆڵەتێک نییە" description="داواکاری مۆڵەتەکان لێرە دەردەکەوێت" /></TableCell></TableRow>
              ) : (
                leaves?.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.staffName}</TableCell>
                    <TableCell>
                      {l.leaveType === 'sick' ? 'نەخۆشی' : l.leaveType === 'annual' ? 'ساڵانە' : 'بەپەلە'}
                    </TableCell>
                    <TableCell>{formatDate(l.fromDate)}</TableCell>
                    <TableCell>{formatDate(l.toDate)}</TableCell>
                    <TableCell>{l.reason || '-'}</TableCell>
                    <TableCell><StatusBadge status={l.status} /></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TabsContent>

        {/* بەشی ژمێریاری و موچە */}
        <TabsContent value="payroll" className="border rounded-md bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ناوی کارمەند</TableHead>
                <TableHead>مانگ</TableHead>
                <TableHead>موچەی بنەڕەتی</TableHead>
                <TableHead>پاداشت</TableHead>
                <TableHead>لێبڕین</TableHead>
                <TableHead>کۆی گشتی</TableHead>
                <TableHead>بەرواری پێدان</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingPayroll ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">چاوەڕێ بکە...</TableCell></TableRow>
              ) : payroll?.length === 0 ? (
                <TableRow><TableCell colSpan={7}><EmptyState title="هیچ موچەیەک نییە" description="لیستی موچەکان لێرە دەردەکەوێت" /></TableCell></TableRow>
              ) : (
                payroll?.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.staffName}</TableCell>
                    <TableCell dir="ltr" className="text-right">{p.month}</TableCell>
                    <TableCell>{formatCurrency(p.baseSalary)}</TableCell>
                    <TableCell className="text-emerald-600">{formatCurrency(p.bonus)}</TableCell>
                    <TableCell className="text-rose-600">{formatCurrency(p.deductions)}</TableCell>
                    <TableCell className="font-bold">{formatCurrency(p.net)}</TableCell>
                    <TableCell>{p.paidAt ? formatDate(p.paidAt) : '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}
