import { useState } from "react";
import { Link } from "wouter";
import { useListPatients, useCreatePatient, getListPatientsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search } from "lucide-react";
import { formatDate } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { AdminDeleteButton } from "@/components/AdminActions";

/**
 * لاپەڕەی لیستی نەخۆشەکان
 * لێرەدا دەتوانرێت نەخۆشی نوێ تۆمار بکرێت و گەڕان بۆ نەخۆشە کۆنەکان بکرێت
 */
export default function Patients() {
  const [search, setSearch] = useState(""); // باری گەڕان
  const [isOpen, setIsOpen] = useState(false); // کردنەوە و داخستنی پەنجەرەی زیادکردن
  
  // بارکردنی لیستی نەخۆشەکان لە سێرڤەرەوە
  const { data: patients, isLoading } = useListPatients();
  const createPatient = useCreatePatient();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // فلتەرکردنی نەخۆشەکان بەپێی دەقی گەڕان (ناو، کۆد، یان تەلەفۆن)
  const filteredPatients = patients?.filter(p => 
    p.fullName.includes(search) || p.mrn.includes(search) || (p.phone && p.phone.includes(search))
  );

  // پرۆسەی تۆمارکردنی نەخۆشێکی نوێ
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await createPatient.mutateAsync({
        data: {
          fullName: formData.get("fullName") as string,
          gender: formData.get("gender") as string,
          phone: formData.get("phone") as string || undefined,
          dob: formData.get("dob") as string || undefined,
          bloodType: formData.get("bloodType") as string || undefined,
          address: formData.get("address") as string || undefined,
        }
      });
      // نوێکردنەوەی لیستەکە دوای سەرکەوتنی تۆمارکردن
      queryClient.invalidateQueries({ queryKey: getListPatientsQueryKey() });
      setIsOpen(false);
      toast({ title: "سەرکەوتوو بوو", description: "نەخۆشی نوێ زیادکرا" });
    } catch (error) {
      toast({ variant: "destructive", title: "هەڵە", description: "نەتوانرا نەخۆش زیادبکرێت" });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="نەخۆشەکان" 
        description="بەڕێوەبردنی تۆماری نەخۆشەکان"
        actions={
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 ml-2" /> نەخۆشی نوێ</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>زیادکردنی نەخۆش</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">ناوی سیانی</Label>
                    <Input id="fullName" name="fullName" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">ڕەگەز</Label>
                    <select id="gender" name="gender" className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50" required>
                      <option value="male">نێر</option>
                      <option value="female">مێ</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">ژمارەی تەلەفۆن</Label>
                    <Input id="phone" name="phone" dir="ltr" className="text-right" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob">ڕێکەوتی لەدایکبوون</Label>
                    <Input id="dob" name="dob" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bloodType">جۆری خوێن</Label>
                    <select id="bloodType" name="bloodType" className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                      <option value="">هەڵبژێرە</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">ناونیشان</Label>
                    <Input id="address" name="address" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>پاشگەزبوون</Button>
                  <Button type="submit" disabled={createPatient.isPending}>پاشەکەوت</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex items-center mb-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="گەڕان بەدوای ناو، ژمارەی تەلەفۆن، یان MRN..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>
      </div>

      {/* خشتەی نیشاندانی نەخۆشەکان */}
      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>MRN</TableHead>
              <TableHead>ناوی نەخۆش</TableHead>
              <TableHead>ڕەگەز</TableHead>
              <TableHead>ژمارەی تەلەفۆن</TableHead>
              <TableHead>جۆری خوێن</TableHead>
              <TableHead>بەرواری تۆمارکردن</TableHead>
              <TableHead className="text-left">کردارەکان</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">چاوەڕێ بکە...</TableCell></TableRow>
            ) : filteredPatients?.length === 0 ? (
              <TableRow><TableCell colSpan={6}><EmptyState title="هیچ نەخۆشێک نەدۆزرایەوە" description="دەتوانیت نەخۆشی نوێ زیاد بکەیت" /></TableCell></TableRow>
            ) : (
              filteredPatients?.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-mono text-sm">{patient.mrn}</TableCell>
                  <TableCell className="font-medium">{patient.fullName}</TableCell>
                  <TableCell>{patient.gender === 'male' ? 'نێر' : 'مێ'}</TableCell>
                  <TableCell dir="ltr" className="text-right">{patient.phone || '-'}</TableCell>
                  <TableCell dir="ltr" className="text-right">{patient.bloodType || '-'}</TableCell>
                  <TableCell>{formatDate(patient.createdAt)}</TableCell>
                  <TableCell className="text-left">
                    <div className="flex items-center gap-1">
                      <Link href={`/patients/${patient.id}`}>
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">بۆ پرۆفایل</Button>
                      </Link>
                      <AdminDeleteButton
                        itemName={patient.fullName}
                        size="icon"
                        onDelete={async () => {
                          await fetch(`/api/patients/${patient.id}`, { method: "DELETE" });
                          queryClient.invalidateQueries({ queryKey: getListPatientsQueryKey() });
                        }}
                      />
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
