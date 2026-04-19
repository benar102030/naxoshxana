import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { Calendar as CalendarIcon, Clock, UserIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * ڕۆژمێری دەوام (Interactive Duty Roster)
 * خشتەی شەفت و دەوامی کارمەندان بە شێوەیەکی گرافیکی و کارلێکەر بەپێی هەفتە پیشان دەدات
 */
export default function DutyRoster() {
  // هێنانەوەی زانیارییەکانی دەوام
  const { data: shifts, isLoading } = useQuery({
    queryKey: ["shifts"],
    queryFn: async () => {
      const res = await fetch("/api/shifts"); // لە hr.ts دێت
      if (!res.ok) throw new Error("کێشە لە هێنانەوەی دەوامەکان");
      return res.json();
    }
  });

  // هەژمارکردنی ڕۆژەکانی ئەم هەفتەیە (٧ ڕۆژی داهاتوو لە ئەمڕۆوە یان سەرەتای هەفتە)
  const today = new Date();
  const startDate = startOfWeek(today, { weekStartsOn: 6 }); // شەممە دەستپێکی هەفتەیە
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

  // ستایلی ڕەنگەکان بەپێی جۆری شەفت
  const getShiftBadge = (shiftType: string) => {
    switch (shiftType) {
      case "morning":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-300">بەیانیان (٠٨:٠٠ - ١٤:٠٠)</Badge>;
      case "evening":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300">ئێواران (١٤:٠٠ - ٢٠:٠٠)</Badge>;
      case "night":
        return <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 border-indigo-300">شەوان (٢٠:٠٠ - ٠٨:٠٠)</Badge>;
      default:
        return <Badge variant="outline">{shiftType}</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader 
        title="ڕۆژمێری دەپام (Duty Roster)" 
        description="خشتەی دەوامی هەفتانەی پزیشکان و کارمەندان" 
      />

      <div className="grid grid-cols-1 gap-6">
        {/* نیشاندانی ڕۆژەکانی هەفتە کە دەوامیان تێدایە */}
        {weekDays.map((day, index) => {
          // دۆزینەوەی ئەو کارمەندانەی لەم ڕۆژەدا دەوامیان هەیە
          const dayShifts = shifts?.filter((s: any) => isSameDay(new Date(s.shiftDate), day)) || [];
          const isToday = isSameDay(day, today);

          return (
            <Card key={index} className={`border-l-4 ${isToday ? 'border-l-primary border-primary/50 shadow-md bg-primary/5' : 'border-l-muted'}`}>
              <CardHeader className="py-4">
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className={`w-5 h-5 ${isToday ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span>
                      {format(day, "EEEE - d / M / yyyy")}
                    </span>
                    {isToday && <Badge variant="default" className="ml-2">ئەمڕۆ</Badge>}
                  </div>
                  <span className="text-sm font-normal text-muted-foreground">
                    کۆی کارمەندان: {dayShifts.length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-muted-foreground text-sm">چاوەڕێ بکە...</p>
                ) : dayShifts.length === 0 ? (
                  <p className="text-muted-foreground text-sm italic">هیچ دەوامێک تۆمار نەکراوە بۆ ئەم ڕۆژە.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* دابەشکردنی دەوامەکان */}
                    {dayShifts.map((shift: any) => (
                      <div key={shift.id} className="flex items-start gap-3 p-3 rounded-md bg-background border hover:border-primary/30 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <UserIcon className="w-5 h-5" />
                        </div>
                        <div className="space-y-1.5 flex-1">
                          <h4 className="font-bold text-sm leading-none">{shift.staffName}</h4>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                            {getShiftBadge(shift.shiftType)}
                          </div>
                          {shift.notes && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{shift.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
