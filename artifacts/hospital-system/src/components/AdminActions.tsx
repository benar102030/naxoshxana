import { useState } from "react";
import { Trash2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuthStore } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

/**
 * هوک سادەی بەکارهێنانی ئادمین
 * دەگەڕێتەوە true ئەگەر بەکارهێنەری ئێستا ئادمین بوو
 */
export function useIsAdmin() {
  const user = useAuthStore((s) => s.user);
  return user?.role === "admin";
}

/**
 * AdminOnly — تەنها نیشانی دەدات بۆ ئادمین
 * بەکارهێنان: <AdminOnly>هەر شتێک</AdminOnly>
 */
export function AdminOnly({ children }: { children: React.ReactNode }) {
  const isAdmin = useIsAdmin();
  if (!isAdmin) return null;
  return <>{children}</>;
}

/**
 * دوگمەی سڕینەوەی ئادمین
 * تەنها بۆ ئادمین دەردەکەوێت، پرسیاری دڵنیابوون دەکات پێش سڕین
 */
interface AdminDeleteButtonProps {
  label?: string;
  itemName: string;
  onDelete: () => Promise<void> | void;
  size?: "sm" | "default" | "lg" | "icon";
  variant?: "ghost" | "outline" | "destructive";
}

export function AdminDeleteButton({
  label = "سڕینەوە",
  itemName,
  onDelete,
  size = "sm",
  variant = "ghost",
}: AdminDeleteButtonProps) {
  const isAdmin = useIsAdmin();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  if (!isAdmin) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      await onDelete();
      toast({
        title: "سڕایەوە",
        description: `${itemName} بە سەرکەوتوویی سڕایەوە`,
      });
    } catch {
      toast({
        variant: "destructive",
        title: "هەڵە",
        description: "نەتوانرا بسرێتەوە، دووبارە هەوڵ بدەوە",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950"
          disabled={loading}
        >
          <Trash2 className="w-4 h-4" />
          {size !== "icon" && <span className="mr-1">{label}</span>}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-rose-600">
            <ShieldAlert className="w-5 h-5" />
            دڵنیای لە سڕینەوە؟
          </AlertDialogTitle>
          <AlertDialogDescription>
            ئایا دڵنیایت دەتەوێت{" "}
            <span className="font-bold text-foreground">«{itemName}»</span> بسریتەوە؟
            <br />
            <span className="text-rose-500 text-xs">⚠️ ئەم کردارە گەڕانەوەیەکی نییە.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>پاشگەزبوون</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-rose-600 hover:bg-rose-700 text-white"
          >
            بەڵێ، بسرەوە
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
