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

const ALL: Role[] = ["admin", "manager", "doctor", "nurse", "pharmacist", "cashier", "labtech", "radtech"];

const navItems: { href: string; label: string; icon: typeof LayoutDashboard; roles: Role[] }[] = [
  { href: "/", label: "داشبۆرد / سەرەکی", icon: LayoutDashboard, roles: ALL },
  { href: "/patients", label: "نەخۆشەکان", icon: Users, roles: ALL },
  { href: "/opd", label: "کلینیکی دەرەکی", icon: Stethoscope, roles: ["admin", "manager", "doctor", "nurse"] },
  { href: "/ipd", label: "نوستن لە نەخۆشخانە", icon: Bed, roles: ["admin", "manager", "doctor", "nurse"] },
  { href: "/emergency", label: "فریاگوزاری", icon: Ambulance, roles: ["admin", "manager", "doctor", "nurse"] },
  { href: "/surgery", label: "نەشتەرگەری", icon: Activity, roles: ["admin", "manager", "doctor", "nurse"] },
  { href: "/lab", label: "تاقیگە", icon: Microscope, roles: ["admin", "manager", "doctor", "nurse", "labtech"] },
  { href: "/radiology", label: "تیشک", icon: FileText, roles: ["admin", "manager", "doctor", "nurse", "radtech"] },
  { href: "/pharmacy", label: "دەرمانخانە", icon: Pill, roles: ["admin", "manager", "doctor", "pharmacist"] },
  { href: "/prescriptions", label: "نوسخەی پزیشکی", icon: FileText, roles: ["admin", "manager", "doctor", "nurse", "pharmacist"] },
  { href: "/staff", label: "سەرچاوە مرۆییەکان", icon: UserCog, roles: ["admin", "manager"] },
  { href: "/billing", label: "پسوولەکان", icon: Receipt, roles: ["admin", "manager", "cashier"] },
  { href: "/inventory", label: "کۆگا", icon: Package, roles: ["admin", "manager", "pharmacist"] },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuthStore();

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground h-screen flex flex-col border-l border-sidebar-border sticky top-0">
      <div className="p-6 pb-2">
        <h1 className="text-xl font-bold mb-6 text-sidebar-primary-foreground">نەخۆشخانە</h1>
        {user && (
          <div className="bg-sidebar-accent/50 p-4 rounded-xl mb-6">
            <div className="font-semibold">{user.fullName}</div>
            <div className="text-xs text-sidebar-foreground/70">{({admin:"بەڕێوەبەری گشتی",manager:"بەڕێوەبەر",doctor:"پزیشک",nurse:"پەرستار",pharmacist:"دەرمانفرۆش",cashier:"سندوقدار",labtech:"تەکنیسیەنی تاقیگە",radtech:"تەکنیسیەنی تیشک"} as Record<string,string>)[user.role] ?? user.role}</div>
          </div>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
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
