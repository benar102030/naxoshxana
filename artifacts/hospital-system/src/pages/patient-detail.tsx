import { useParams, Link } from "wouter";
import { useGetPatient, useGetPatientTimeline } from "@workspace/api-client-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDateTime, formatDate } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, Calendar, FileText, Beaker, 
  Stethoscope, BedDouble, Receipt, Pill, ArrowLeft, Printer, Activity
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VitalCharts } from "@/components/VitalCharts";

/**
 * لاپەڕەی وردەکارییەکانی نەخۆش
 * ئەم لاپەڕەیە هەموو زانیارییەکانی نەخۆش و مێژووی پزیشکی (Timeline) پیشان دەدات
 */
export default function PatientDetail() {
  const { id } = useParams();
  const patientId = Number(id);
  
  // وەرگرتنی زانیاری نەخۆش و خشتەی کاتی چالاکییەکانی نەخۆشەکە (Timeline)
  const { data: patient, isLoading: loadingPatient } = useGetPatient(patientId);
  const { data: timeline, isLoading: loadingTimeline } = useGetPatientTimeline(patientId);

  // فرمانی پرنتکردنی لاپەڕەکە
  const handlePrint = () => {
    window.print();
  };

  // نیشاندانی باری چاوەڕوانی (Loading State)
  if (loadingPatient) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64 md:col-span-2" />
        </div>
      </div>
    );
  }

  if (!patient) return <div>نەخۆش نەدۆزرایەوە</div>;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-2 mb-2">
        <Link href="/patients">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 ml-2" /> گەڕانەوە بۆ لیست
          </Button>
        </Link>
      </div>

      <PageHeader 
        title={patient.fullName} 
        description={`تۆماری پزیشکی: ${patient.mrn}`}
        actions={
          <Button variant="outline" onClick={handlePrint} className="no-print">
            <Printer className="w-4 h-4 ml-2" /> پرنتکردنی تۆمار
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* بەشی زانیارییە کەسییەکانی نەخۆش */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">زانیارییە کەسییەکان</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm py-2 border-bottom border-dashed">
                <span className="text-muted-foreground">ناوی تەواو:</span>
                <span className="font-medium">{patient.fullName}</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-bottom border-dashed">
                <span className="text-muted-foreground">ڕەگەز:</span>
                <span>{patient.gender === 'male' ? 'نێر' : 'مێ'}</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-bottom border-dashed">
                <span className="text-muted-foreground">بەرواری لەدایکبوون:</span>
                <span>{patient.dob ? formatDate(patient.dob) : '-'}</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-bottom border-dashed">
                <span className="text-muted-foreground">جۆری خوێن:</span>
                <span className="font-bold text-rose-600">{patient.bloodType || '-'}</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-bottom border-dashed">
                <span className="text-muted-foreground">تەلەفۆن:</span>
                <span dir="ltr">{patient.phone || '-'}</span>
              </div>
              <div className="flex flex-col gap-1 text-sm py-2">
                <span className="text-muted-foreground">ناونیشان:</span>
                <span>{patient.address || '-'}</span>
              </div>
            </CardContent>
          </Card>

          {/* کردەکانی بەڕێوەبردن بۆ ئەم نەخۆشە */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Receipt className="w-4 h-4 ml-2" /> خزمەتگوزارییەکان
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start text-sm" variant="outline" size="sm">دروستکردنی سەردانی نوێ</Button>
              <Button className="w-full justify-start text-sm" variant="outline" size="sm">داواکردنی پشکنین</Button>
              <Button className="w-full justify-start text-sm" variant="outline" size="sm">دروستکردنی پسوولە</Button>
            </CardContent>
          </Card>
        </div>

        {/* نیشاندانی مێژووی پزیشکی و نیشانە سەرەکییەکان بە شێوەی تاب (Tabs) */}
        <div className="lg:col-span-2 space-y-4">
          <Tabs defaultValue="timeline" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 h-12">
              <TabsTrigger value="timeline" className="text-md gap-2">
                <Calendar className="w-4 h-4" /> مێژووی پزیشکی (Timeline)
              </TabsTrigger>
              <TabsTrigger value="vitals" className="text-md gap-2">
                <Activity className="w-4 h-4" /> نیشانە سەرەکییەکان (Vitals)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5" /> مێژووی پزیشکی (Timeline)
              </h3>

          {loadingTimeline ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : timeline?.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground">
                هیچ مێژوویەکی پزیشکی بۆ ئەم نەخۆشە تۆمار نەکراوە
              </CardContent>
            </Card>
          ) : (
            <div className="relative border-r-2 border-muted pr-6 space-y-8 mr-4 py-4">
              {/* ڕیزکردنی ڕووداوە پزیشکییەکان (وەک: نۆرینگە، تاقیگە، دەرمان) */}
              {timeline?.map((event, idx) => (
                <div key={`${event.type}-${event.id}-${idx}`} className="relative">
                  {/* ڕەنگی خاڵەکان بەپێی جۆری ڕووداوەکە دەگۆڕدرێت */}
                  <div className={`absolute -right-9 top-1 w-6 h-6 rounded-full border-4 border-background flex items-center justify-center ${
                    event.type === 'opd' ? 'bg-blue-500' :
                    event.type === 'ipd' ? 'bg-indigo-500' :
                    event.type === 'lab' ? 'bg-amber-500' :
                    event.type === 'radiology' ? 'bg-purple-500' :
                    event.type === 'prescription' ? 'bg-emerald-500' : 'bg-slate-500'
                  }`}>
                    {event.type === 'opd' && <Stethoscope className="w-3 h-3 text-white" />}
                    {event.type === 'ipd' && <BedDouble className="w-3 h-3 text-white" />}
                    {event.type === 'lab' && <Beaker className="w-3 h-3 text-white" />}
                    {event.type === 'radiology' && <FileText className="w-3 h-3 text-white" />}
                    {event.type === 'prescription' && <Pill className="w-3 h-3 text-white" />}
                    {event.type === 'billing' && <Receipt className="w-3 h-3 text-white" />}
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground font-mono" dir="ltr">
                      {formatDateTime(event.date)}
                    </span>
                    <Card className="hover:border-primary/40 transition-colors shadow-sm">
                      <CardContent className="p-4 flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <h4 className="font-bold text-md">{event.title}</h4>
                          <p className="text-sm text-muted-foreground">{event.detail}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <StatusBadge status={event.status} />
                          <Button variant="ghost" size="sm" className="h-7 text-[10px]">بینینی وردەکاری</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          )}
            </TabsContent>

            <TabsContent value="vitals" className="space-y-6">
              <VitalCharts patientId={patientId} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
