import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useListStaff, useListShifts, useListLeaves, useListPayroll, getListStaffQueryKey } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/EmptyState";
import { RoleBadge } from "@/components/RoleBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/i18n";

export default function Staff() {
  const { data: staff, isLoading: loadingStaff } = useListStaff();
  const { data: shifts, isLoading: loadingShifts } = useListShifts();
  const { data: leaves, isLoading: loadingLeaves } = useListLeaves();
  const { data: payroll, isLoading: loadingPayroll } = useListPayroll();

  return (
    <div className="space-y-6">
      <PageHeader title="سەرچاوە مرۆییەکان" description="بەڕێوەبردنی کارمەندان، دەوام، و موچە" />

      <Tabs defaultValue="staff" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="staff">کارمەندان</TabsTrigger>
          <TabsTrigger value="shifts">خشتەی دەوام</TabsTrigger>
          <TabsTrigger value="leaves">مۆڵەتەکان</TabsTrigger>
          <TabsTrigger value="payroll">موچە</TabsTrigger>
        </TabsList>

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
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingStaff ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">چاوەڕێ بکە...</TableCell></TableRow>
              ) : staff?.length === 0 ? (
                <TableRow><TableCell colSpan={6}><EmptyState title="هیچ کارمەندێک نییە" description="تۆماری کارمەندان لێرە دەردەکەوێت" /></TableCell></TableRow>
              ) : (
                staff?.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.fullName}</TableCell>
                    <TableCell dir="ltr" className="text-right text-muted-foreground">{s.username}</TableCell>
                    <TableCell><RoleBadge role={s.role} /></TableCell>
                    <TableCell>{s.department || '-'}</TableCell>
                    <TableCell dir="ltr" className="text-right">{s.phone || '-'}</TableCell>
                    <TableCell>{formatDate(s.joinedAt)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TabsContent>

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
