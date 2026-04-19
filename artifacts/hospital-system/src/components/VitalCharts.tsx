import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { useAuthStore } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Activity, Thermometer, Wind, Droplets } from "lucide-react";

/**
 * تایبەتە بە نیشاندانی چارت و گرافیکی نیشانە سەرەکییەکانی نەخۆش
 * BP, Heart Rate, Temp, SpO2, Respiratory Rate
 */
export function VitalCharts({ patientId }: { patientId: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // وەرگرتنی زانیارییەکان لە سێرڤەرەوە
  const { data: vitals, isLoading } = useQuery({
    queryKey: ["vitals", patientId],
    queryFn: async () => {
      const res = await fetch(`/api/vitals/patient/${patientId}`);
      if (!res.ok) throw new Error("نەتوانرا نیشانە سەرەکییەکان بار بکرێن");
      return res.json();
    }
  });

  // تۆمارکردنی نیشانەی نوێ
  const addVital = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/vitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, patientId, recordedBy: user?.id })
      });
      if (!res.ok) throw new Error("نەتوانرا تۆمار بکرێت");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vitals", patientId] });
      setIsOpen(false);
      toast({ title: "سەرکەوتوو بوو", description: "نیشانە سەرەکییەکان تۆمارکران" });
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addVital.mutate({
      heartRate: formData.get("heartRate"),
      bloodPressure: formData.get("bloodPressure"),
      temperature: formData.get("temperature"),
      spO2: formData.get("spO2"),
      respiratoryRate: formData.get("respiratoryRate"),
    });
  };

  if (isLoading) return <div className="p-4 text-center">چاوەڕێ بکە...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          چاودێری نیشانە سەرەکییەکان (Vital Signs)
        </h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm">تۆمارکردنی نوێ</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تۆمارکردنی نیشانە سەرەکییەکان</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="heartRate">لێدانی دڵ (BPM)</Label>
                <Input id="heartRate" name="heartRate" type="number" placeholder="72" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bloodPressure">پەستانی خوێن</Label>
                <Input id="bloodPressure" name="bloodPressure" placeholder="120/80" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="temperature">پلەی گەرمی (C°)</Label>
                <Input id="temperature" name="temperature" type="number" step="0.1" placeholder="37.0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="spO2">ڕێژەی ئۆکسجین (%)</Label>
                <Input id="spO2" name="spO2" type="number" placeholder="98" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="respiratoryRate">ڕێژەی هەناسەدان</Label>
                <Input id="respiratoryRate" name="respiratoryRate" type="number" placeholder="16" />
              </div>
              <div className="col-span-2 pt-4">
                <Button type="submit" className="w-full" disabled={addVital.isPending}>پاشەکەوتکردن</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {vitals && vitals.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* چارتی لێدانی دڵ و پەستان */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-500" /> لێدانی دڵ (Heart Rate)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vitals}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="recordedAt" hide />
                  <YAxis domain={['auto', 'auto']} />
                  <Tooltip labelFormatter={(val) => new Date(val).toLocaleString('ku-IQ')} />
                  <Line type="monotone" dataKey="heartRate" stroke="#e11d48" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* چارتی پلەی گەرمی */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-orange-500" /> پلەی گەرمی (Temperature)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vitals}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="recordedAt" hide />
                  <YAxis domain={[35, 42]} />
                  <Tooltip labelFormatter={(val) => new Date(val).toLocaleString('ku-IQ')} />
                  <Line type="monotone" dataKey="temperature" stroke="#f97316" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* چارتی ئۆکسجین */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-500" /> ڕێژەی ئۆکسجین (SpO2)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vitals}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="recordedAt" hide />
                  <YAxis domain={[80, 100]} />
                  <Tooltip labelFormatter={(val) => new Date(val).toLocaleString('ku-IQ')} />
                  <Line type="monotone" dataKey="spO2" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* چارتی هەناسەدان */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Wind className="w-4 h-4 text-emerald-500" /> ڕێژەی هەناسەدان (Respiratory Rate)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vitals}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="recordedAt" hide />
                  <YAxis domain={['auto', 'auto']} />
                  <Tooltip labelFormatter={(val) => new Date(val).toLocaleString('ku-IQ')} />
                  <Line type="monotone" dataKey="respiratoryRate" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="bg-muted p-8 rounded-lg text-center text-muted-foreground">
          هیچ نیشانەیەکی سەرەکی تۆمار نەکراوە بۆ ئەم نەخۆشە.
        </div>
      )}
    </div>
  );
}
