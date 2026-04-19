import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from "recharts";
import { Droplet, Plus, Minus, Info } from "lucide-react";
import { formatDateTime } from "@/lib/i18n";

// ڕەنگ بۆ هەر جۆرە خوێنێک
const COLORS: Record<string, string> = {
  "A+": "#ef4444", // Red 500
  "A-": "#f87171", // Red 400
  "B+": "#3b82f6", // Blue 500
  "B-": "#60a5fa", // Blue 400
  "O+": "#10b981", // Emerald 500
  "O-": "#34d399", // Emerald 400
  "AB+": "#8b5cf6",// Violet 500
  "AB-": "#a78bfa" // Violet 400
};

/**
 * لاپەڕەی بانکی خوێن (Blood Bank)
 * نیشاندەری گرافیکی ڕێژەی خوێنەکان و توانای زیادکردن و کەمکردنەوەی کیسی خوێن
 */
export default function BloodBank() {
  const [isOpen, setIsOpen] = useState(false);
  const [actionType, setActionType] = useState<"add" | "remove">("add");
  const [selectedGroup, setSelectedGroup] = useState("A+");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: inventory, isLoading } = useQuery({
    queryKey: ["blood-inventory"],
    queryFn: async () => {
      const res = await fetch("/api/blood-bank");
      if (!res.ok) throw new Error("نەتوانرا بانکی خوێن باربکرێت");
      return res.json();
    }
  });

  const updateInventory = useMutation({
    mutationFn: async (data: { bloodGroup: string, units: number }) => {
      const res = await fetch("/api/blood-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("نەتوانرا نوێ بکرێتەوە");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blood-inventory"] });
      setIsOpen(false);
      toast({ title: "سەرکەوتوو بوو", description: "بڕی خوێنەکە نوێ کرایەوە" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "هەڵە", description: "نەتوانرا گۆڕانکاری بکرێت" });
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const amount = Number(formData.get("amount"));
    
    // ئەگەر جۆری کارەکە کەمکردنەوە بێت (نمونە: خوێن دراوە بە نەخۆش)، ئەوا یەکەکانی بە کەمکردنەوە (- دەنێرین)
    const newUnits = actionType === "add" ? amount : -amount;
    
    updateInventory.mutate({
      bloodGroup: selectedGroup,
      units: newUnits
    });
  };

  const totalUnits = inventory?.reduce((sum: number, item: any) => sum + item.units, 0) || 0;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader 
        title="بانکی خوێن (Blood Bank)" 
        description="بەڕێوەبردن و چاودێریکردنی کیسی خوێنی بەردەست لە نەخۆشخانە" 
      />

      {/* گرافیکی بانکی خوێن */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* بەشی چارت (Pie Chart) بۆ نیشاندانی ڕێژەی هەر جۆرە خوێنێک */}
        <Card className="lg:col-span-2 shadow-sm border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplet className="w-5 h-5 text-rose-500" /> کۆگای بانکی خوێن
            </CardTitle>
            <CardDescription className="text-lg">
              کۆی گشتی کیسەکان: <span className="font-bold text-foreground">{totalUnits}</span> کیس
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">چاوەڕێ بکە...</div>
            ) : totalUnits === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
                <Droplet className="w-16 h-16 mb-4 opacity-20" />
                <p>بانکی خوێن لە ئێستادا بەتاڵە</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inventory.filter((d: any) => d.units > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={90}
                    outerRadius={140}
                    paddingAngle={5}
                    dataKey="units"
                    nameKey="bloodGroup"
                    label={({ bloodGroup, percent }) => `${bloodGroup} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {inventory.filter((d: any) => d.units > 0).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.bloodGroup] || COLORS["A+"]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} کیس`, "بڕی بەردەست"]}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* لیستەی ئامارەکان بەپێی جۆری خوێن */}
        <div className="space-y-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-lg text-primary">ڕێکارەکان</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full bg-emerald-600 hover:bg-emerald-700" 
                      onClick={() => setActionType("add")}
                    >
                      <Plus className="w-4 h-4 ml-1" /> وەرگرتن (دەبەخشەر)
                    </Button>
                  </DialogTrigger>
                  <DialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      onClick={() => setActionType("remove")}
                    >
                      <Minus className="w-4 h-4 ml-1" /> دەرچوون (نەخۆش)
                    </Button>
                  </DialogTrigger>

                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {actionType === "add" ? "زیادکردنی کیسی خوێن (بەخشین)" : "کەمکردنەوەی کیسی خوێن (بەکارهێنان)"}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>جۆری خوێن</Label>
                        <select 
                          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          value={selectedGroup}
                          onChange={(e) => setSelectedGroup(e.target.value)}
                        >
                          {Object.keys(COLORS).map(bg => (
                            <option key={bg} value={bg}>{bg}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>چەند کیس؟ (یەکە)</Label>
                        <Input id="amount" name="amount" type="number" min="1" required defaultValue="1" />
                      </div>
                      <div className="flex justify-end pt-4 gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>پاشگەزبوون</Button>
                        <Button type="submit" variant={actionType === "add" ? "default" : "destructive"}>
                          تۆمارکردن
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-md">لیستی هەموو جۆرەکان</CardTitle>
            </CardHeader>
            <CardContent className="px-4 py-0 pb-4">
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {inventory?.map((item: any) => (
                  <div key={item.bloodGroup} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 border">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                        style={{ backgroundColor: COLORS[item.bloodGroup] || COLORS["A+"] }}
                      >
                        {item.bloodGroup}
                      </div>
                      <div className="text-xs text-muted-foreground">دوایین نوێکردنەوە:<br/>{formatDateTime(item.lastUpdated)}</div>
                    </div>
                    <div className="font-bold text-lg font-mono px-3 py-1 bg-muted rounded-md border">
                      {item.units} <span className="text-xs font-normal text-muted-foreground mr-1">کیس</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
