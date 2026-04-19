import { useAuthStore } from "@/lib/auth";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Bed,
  Ambulance,
  Activity,
  Syringe,
  Microscope,
  Pill,
  FileText,
  UserCog,
  Receipt,
  Package,
  Settings,
  LogOut,
  BedDouble,
  LayoutGrid,
  Droplets,
  CalendarDays
} from "lucide-react";
import { Button } from "./ui/button";

type Role =
  | "admin"
  | "manager"
  | "doctor"
  | "nurse"
  | "pharmacist"
  | "cashier"
  | "labtech"
  | "radtech";

// هەموو جۆرەکانی بەکارهێنەر
const ALL: Role[] = ["admin", "manager", "doctor", "nurse", "pharmacist", "cashier", "labtech", "radtech"];

/**
 * لیستی پێڕستەکانی لای لایە (Sidebar Items)
 * هەر پێڕستێک دیاریکراوە کە چ جۆرە ڕۆڵێکی بەکارهێنەر دەتوانێت بیبینێت
 */
const navItems: { href: string; label: string; icon: any; roles: Role[] }[] = [
  { href: "/", label: "داشبۆرد / سەرەکی", icon: LayoutDashboard, roles: ALL },
  { href: "/duty-roster", label: "ڕۆژمێری دەوام", icon: CalendarDays, roles: ALL },
  { href: "/patients", label: "نەخۆشەکان", icon: Users, roles: ALL },
  { href: "/opd", label: "کلینیکی دەرەکی", icon: Stethoscope, roles: ["admin", "manager", "doctor", "nurse"] },
  { href: "/ipd", label: "بەشی ناوخۆیی (IPD)", icon: BedDouble, roles: ["admin", "manager", "doctor", "nurse"] },
  { href: "/bed-map", label: "نەخشەی جێگاکان", icon: LayoutGrid, roles: ["admin", "manager", "doctor", "nurse"] },
  { href: "/emergency", label: "فریاگوزاری", icon: Ambulance, roles: ["admin", "manager", "doctor", "nurse"] },
  { href: "/surgery", label: "نەشتەرگەری", icon: Activity, roles: ["admin", "manager", "doctor", "nurse"] },
  { href: "/blood-bank", label: "بانکی خوێن", icon: Droplets, roles: ["admin", "manager", "doctor", "nurse", "labtech", "radtech"] },
  { href: "/lab", label: "تاقیگە", icon: Microscope, roles: ["admin", "manager", "doctor", "nurse", "labtech"] },
  { href: "/radiology", label: "تیشک", icon: FileText, roles: ["admin", "manager", "doctor", "nurse", "radtech"] },
  { href: "/pharmacy", label: "دەرمانخانە", icon: Pill, roles: ["admin", "manager", "doctor", "pharmacist"] },
  { href: "/prescriptions", label: "نوسخەی پزیشکی", icon: FileText, roles: ["admin", "manager", "doctor", "nurse", "pharmacist"] },
  { href: "/staff", label: "سەرچاوە مرۆییەکان", icon: UserCog, roles: ["admin", "manager"] },
  { href: "/billing", label: "پسوولەکان", icon: Receipt, roles: ["admin", "manager", "cashier"] },
  { href: "/inventory", label: "کۆگا", icon: Package, roles: ["admin", "manager", "pharmacist"] },
  { href: "/profile", label: "پڕۆفایل / ڕێکخستن", icon: Settings, roles: ALL },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuthStore();

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground h-screen flex flex-col border-l border-sidebar-border sticky top-0">
      <div className="p-6 pb-2">
        <div className="mb-6 flex justify-center items-center">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-500 rounded-xl blur opacity-25 group-hover:opacity-60 transition duration-500"></div>
            <img src="/logo1.jpg" alt="بەڕێوەبردنی نەخۆشخانە" className="relative max-w-[180px] w-full h-auto object-contain rounded-xl bg-white p-2.5 shadow-md ring-1 ring-border transition-transform duration-300 group-hover:scale-[1.02]" />
          </div>
        </div>
        {/* نیشاندانی ناوی بەکارهێنەری ئێستا و ڕۆڵەکەی */}
        {user && (
          <div className="bg-sidebar-accent/50 p-4 rounded-xl mb-6">
            <div className="font-semibold">{user.fullName}</div>
            <div className="text-xs text-sidebar-foreground/70">{({admin:"بەڕێوەبەری گشتی",manager:"بەڕێوەبەر",doctor:"پزیشک",nurse:"پەرستار",pharmacist:"دەرمانفرۆش",cashier:"سندوقدار",labtech:"تەکنیسیەنی تاقیگە",radtech:"تەکنیسیەنی تیشک"} as Record<string,string>)[user.role] ?? user.role}</div>
          </div>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
        {/* فلتەرکردنی پێڕستەکان تەنها بۆ ئەوانەی کە مۆڵەتیان هەیە */}
        {navItems.filter((it) => !user || it.roles.includes(user.role as Role)).map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <span
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground/90"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
      {/* دوگمەی چوونەدەرەوە */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
          onClick={logout}
        >
          <LogOut className="w-5 h-5" />
          چوونەدەرەوە
        </Button>
      </div>
    </aside>
  );
}
