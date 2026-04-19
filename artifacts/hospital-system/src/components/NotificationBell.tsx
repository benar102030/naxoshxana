import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCircle, Info, AlertTriangle, AlertCircle } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/auth";
import { formatDistanceToNow } from "date-fns";

/**
 * زەنگی ئاگادارکردنەوەکان (Notificaton Bell)
 * ئەم پێکهاتەیە ئاگادارییە گرنگەکانی سیستەم نیشانی کارمەندان دەدات
 */
export function NotificationBell() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`/api/notifications/staff/${user.id}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user,
    refetchInterval: 30000, // هەر ٣٠ چرکەیەک جاری نوێ دەکرێتەوە
  });

  const markAsRead = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    }
  });

  const unreadCount = notifications?.filter((n: any) => !n.read).length || 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full bg-background">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -right-1 -top-1 px-1.5 py-0.5 text-[10px] min-w-[20px] flex justify-center h-5 w-5 rounded-full border-2 border-background">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[350px] p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold">ئاگادارکردنەوەکان</h3>
          {unreadCount > 0 && (
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
              {unreadCount} نوێ
            </span>
          )}
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">چاوەڕێ بکە...</div>
          ) : notifications?.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">هیچ ئاگادارکردنەوەیەک نییە</div>
          ) : (
            notifications?.map((n: any) => (
              <DropdownMenuItem 
                key={n.id} 
                className={`p-4 cursor-pointer flex gap-3 items-start border-b last:border-0 ${!n.read ? 'bg-primary/5' : ''}`}
                onClick={() => !n.read && markAsRead.mutate(n.id)}
              >
                <div className={`mt-1 p-1.5 rounded-full ${
                  n.type === 'critical' ? 'bg-rose-100 text-rose-600' :
                  n.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {n.type === 'critical' ? <AlertCircle className="w-4 h-4" /> :
                   n.type === 'warning' ? <AlertTriangle className="w-4 h-4" /> :
                   <Info className="w-4 h-4" />}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start gap-2">
                    <p className={`text-sm font-bold leading-none ${!n.read ? 'text-primary' : 'text-foreground'}`}>{n.title}</p>
                    <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {n.message}
                  </p>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />
        <Button variant="ghost" className="w-full text-xs font-bold h-10 rounded-none hover:bg-primary/5">
          بینینی هەموو ئاگادارکردنەوەکان
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
