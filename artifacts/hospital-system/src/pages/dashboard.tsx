import { useGetDashboardSummary, useGetVisitsTrend, useGetDepartmentLoad, useGetRevenueTrend, useGetRecentActivity } from "@workspace/api-client-react";
import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { formatCurrency, formatDate } from "@/lib/i18n";
import { Users, Calendar, Bed, Ambulance, Activity, TestTube, CreditCard, AlertTriangle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line } from "recharts";
import { StatusBadge } from "@/components/StatusBadge";

/**
 * لاپەڕەی داشبۆردی سەرەکی (Main Dashboard)
 * ئەم بەشە کورتی دەخاتە سەر هەموو چالاکییەکانی نەخۆشخانە بە شێوەی گرافیک و ئامار
 */
export default function Dashboard() {
  // وەرگرتنی هەموو ئامارەکان لە ڕێگەی هووکەکانی (Hooks) سێرڤەرەوە
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary(); // کورتەی خێرا (KPIs)
  const { data: visitsTrend } = useGetVisitsTrend(); // ڕەوتی سەردانەکان
  const { data: deptLoad } = useGetDepartmentLoad(); // قورسایی کار لەسەر بەشەکان
  const { data: revTrend } = useGetRevenueTrend(); // ڕەوتی داهات
  const { data: recentActivity } = useGetRecentActivity(); // دوایین گۆڕانکارییەکان

  // نیشاندانی تێکستی چاوەڕێبە تاوەکو داتاکان دەگەن
  if (loadingSummary || !summary) return <div className="p-8 text-center text-muted-foreground">باردەکرێت...</div>;

  return (
    <div className="space-y-6">
      {/* ناونیشانی لاپەڕە */}
      <PageHeader title="داشبۆرد / سەرەکی" description="کورتەی دۆخی ئێستای نەخۆشخانە" />
      
      {/* سندوقی تێبینییە سەرەکییەکان (KPI Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="کۆی نەخۆشەکان"
          value={summary.totalPatients}
          icon={<Users className="w-6 h-6" />}
        />
        <KpiCard
          title="سەردانی ئەمڕۆی کلینیک"
          value={summary.todayOpdVisits}
          icon={<Calendar className="w-6 h-6" />}
        />
        <KpiCard
          title="نەخۆشە خەوێندراوەکان"
          value={summary.admittedPatients}
          icon={<Bed className="w-6 h-6" />}
          description={`${summary.occupiedBeds} لە ${summary.availableBeds + summary.occupiedBeds} جێگا گیراوە`}
        />
        <KpiCard
          title="فریاگوزاری ئەمڕۆ"
          value={summary.emergencyToday}
          icon={<Ambulance className="w-6 h-6" />}
        />
        <KpiCard
          title="نەشتەرگەری ئەمڕۆ"
          value={summary.scheduledSurgeriesToday}
          icon={<Activity className="w-6 h-6" />}
        />
        <KpiCard
          title="پشکنینی هەڵواسراو"
          value={summary.pendingLabTests + summary.pendingRadiology}
          icon={<TestTube className="w-6 h-6" />}
        />
        <KpiCard
          title="داهاتی ئەمڕۆ"
          value={formatCurrency(summary.todayRevenue)}
          icon={<CreditCard className="w-6 h-6" />}
        />
        <KpiCard
          title="هۆشدارییەکان"
          value={summary.lowStockMedications + summary.expiringMedications}
          icon={<AlertTriangle className="w-6 h-6" />}
          description="دەرمانی کەمبوو یان بەسەرچوو"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* چارتی ڕەوتی سەردانەکان (Area Chart) */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>ڕەوتی سەردانەکان (١٤ ڕۆژی ڕابردوو)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visitsTrend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="date" tickFormatter={(v) => formatDate(v).split(' ')[0] + ' ' + formatDate(v).split(' ')[1]} />
                <YAxis />
                <Tooltip labelFormatter={(v) => formatDate(v as string)} />
                <Area type="monotone" dataKey="value" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.2} name="سەردانەکان" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* چارتی داهاتی پسوولەکان (Line Chart) */}
        <Card>
          <CardHeader>
            <CardTitle>داهاتی مانگانە</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revTrend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="date" tickFormatter={(v) => formatDate(v).split(' ')[0] + ' ' + formatDate(v).split(' ')[1]} />
                <YAxis tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} labelFormatter={(v) => formatDate(v as string)} />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--chart-2))" strokeWidth={3} name="داهات" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* چارتی قورسایی بەشەکان (Bar Chart) */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>قورسایی بەشەکان</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptLoad}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} name="ژمارەی نەخۆش" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* لیستی دوایین چالاکییەکان (Activity Feed) */}
        <Card>
          <CardHeader>
            <CardTitle>دوایین چالاکییەکان</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity?.slice(0, 6).map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className="mt-0.5 bg-muted p-2 rounded-full">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{activity.title}</p>
                    {activity.subtitle && (
                      <p className="text-xs text-muted-foreground">{activity.subtitle}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1 opacity-70">
                      {formatDate(activity.at)} {new Date(activity.at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
