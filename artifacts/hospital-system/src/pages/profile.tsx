import { useAuthStore } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RoleBadge } from "@/components/RoleBadge";
import { formatDate } from "@/lib/i18n";
import { User, Mail, Phone, Building, Briefcase, Calendar } from "lucide-react";

/**
 * لاپەڕەی پڕۆفایل (User Profile)
 * نیشاندانی زانیارییەکانی کارمەندی چووەژوورەوە و ڕێکخستنی هەژمارەکەی
 */
export default function Profile() {
  // وەرگرتنی زانیارییەکانی کارمەند لە کۆگای متمانەپێدان (Auth Store)
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="پڕۆفایل" 
        description="زانیارییە کەسییەکان و ڕێکخستنی هەژمار" 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* کارتی کورتی کارمەند */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-12 h-12 text-primary" />
            </div>
            <CardTitle>{user.fullName}</CardTitle>
            <div className="mt-2 flex justify-center">
              <RoleBadge role={user.role} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Building className="w-4 h-4 text-muted-foreground" />
              <span>بەش: {user.department || 'دیاری نەکراوە'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>بەرواری دەستبەکاربوون: {formatDate(user.joinedAt)}</span>
            </div>
          </CardContent>
        </Card>

        {/* کارتی زانیارییە وردەکان و گۆڕینی تێپەڕەوشە */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>زانیارییە گشتییەکان</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>ناوی تەواو</Label>
                <div className="flex items-center gap-2 p-2 border rounded bg-muted/30">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>{user.fullName}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>ناوی بەکارهێنەر (Username)</Label>
                <div className="flex items-center gap-2 p-2 border rounded bg-muted/30 font-mono">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{user.username}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>ژمارەی تەلەفۆن</Label>
                <div className="flex items-center gap-2 p-2 border rounded bg-muted/30">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{user.phone || 'بەردەست نییە'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>پایە / ڕۆڵ</Label>
                <div className="flex items-center gap-2 p-2 border rounded bg-muted/30">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span>{user.role}</span>
                </div>
              </div>
            </div>

            {/* بەشی ئاسایش (Security) بۆ گۆڕینی تێپەڕەوشە */}
            <div className="pt-6 border-t">
              <h3 className="text-lg font-medium mb-4">گۆڕینی تێپەڕەوشە</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="old">تێپەڕەوشەی ئێستا</Label>
                  <Input id="old" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new">تێپەڕەوشەی نوێ</Label>
                  <Input id="new" type="password" />
                </div>
              </div>
              <Button className="mt-4" variant="outline">نوێکردنەوەی تێپەڕەوشە</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
