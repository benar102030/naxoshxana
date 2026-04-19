import { formatDate } from "@/lib/i18n";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { NotificationBell } from "./NotificationBell";

/**
 * بەشی سەرەوەی ڕوکار (Header)
 * بەرپرسە لە نیشاندانی بەرواری ڕۆژ و گۆڕینی تمی لاپەڕە (تاریک/ڕووناک)
 */
export function Header() {
  // بارودۆخی تمی لاپەڕە (Dark Mode)
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  // جێبەجێکردنی گۆڕانکارییەکە لەسەر تەواوی لاپەڕەکە
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
      </div>
      <div className="flex items-center gap-4">
        {/* نیشاندانی بەرواری ئەمڕۆ بە زمانی کوردی */}
        <div className="text-sm font-medium text-muted-foreground hidden sm:block">
          {formatDate(new Date().toISOString())}
        </div>
        <NotificationBell />
        {/* دوگمەی گۆڕینی تم (Dark/Light) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsDark(!isDark)}
          className="rounded-full"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
    </header>
  );
}
