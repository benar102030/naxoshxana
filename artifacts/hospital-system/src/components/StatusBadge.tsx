import { Badge } from "./ui/badge";

export function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    scheduled: { label: "دیاریکراو", variant: "secondary" },
    inprogress: { label: "لە کاردایە", variant: "default" },
    done: { label: "تەواوبوو", variant: "outline" },
    completed: { label: "تەواوبوو", variant: "outline" },
    cancelled: { label: "پاشگەزبووەوە", variant: "destructive" },
    active: { label: "چالاک", variant: "default" },
    discharged: { label: "دەرچوو", variant: "outline" },
    waiting: { label: "چاوەڕێ دەکات", variant: "secondary" },
    admitted: { label: "وەرگیراو", variant: "default" },
    pending: { label: "هەڵواسراو", variant: "secondary" },
    sample_collected: { label: "نمونە وەرگیرا", variant: "default" },
    unpaid: { label: "نەدراوە", variant: "destructive" },
    partial: { label: "بەشێک دراوە", variant: "secondary" },
    paid: { label: "دراوە", variant: "outline" },
    critical: { label: "مەترسیدار", variant: "destructive" },
    urgent: { label: "بەپەلە", variant: "default" },
    less_urgent: { label: "کەمتر بەپەلە", variant: "secondary" },
    nonurgent: { label: "ئاسایی", variant: "outline" },
    approved: { label: "پەسەندکراو", variant: "default" },
    rejected: { label: "ڕەتکراوە", variant: "destructive" },
  };

  const config = statusMap[status] || { label: status, variant: "outline" };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
