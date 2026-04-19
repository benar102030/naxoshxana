import { Badge } from "./ui/badge";

export function RoleBadge({ role }: { role: string }) {
  const roleMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    admin: { label: "بەڕێوەبەری گشتی", variant: "destructive" },
    manager: { label: "بەڕێوەبەر", variant: "default" },
    doctor: { label: "پزیشک", variant: "default" },
    nurse: { label: "پەرستار", variant: "secondary" },
    pharmacist: { label: "دەرمانفرۆش", variant: "secondary" },
    cashier: { label: "سندوقدار", variant: "outline" },
    labtech: { label: "تەکنیسیەنی تاقیگە", variant: "outline" },
    radtech: { label: "تەکنیسیەنی تیشک", variant: "outline" },
  };

  const config = roleMap[role] || { label: role, variant: "outline" };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
