import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useAuthStore } from "@/lib/auth";
import Login from "@/pages/login";

interface LayoutProps {
  children: ReactNode;
}

/**
 * پێکهاتەی گشتی ڕوکار (Global Layout Component)
 * ئەم بەشە بەرپرسە لە پێکەوەبەستنی لایەنی Sidebar و سەرەوە Header و ناوەڕۆکی لاپەڕەکان
 */
export function Layout({ children }: LayoutProps) {
  const { token } = useAuthStore();

  // ئەگەر بەکارهێنەر نەچووبێتە ژوورەوە، لاپەڕەی Login پیشان بدە
  if (!token) {
    return <Login />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* بەشی لای چەپ - پێڕستی سەرەکی (Sidebar) */}
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        {/* بەشی سەرەوە - زانیاری بەکارهێنەر و گەڕان (Header) */}
        <Header />
        {/* ناوەڕۆکی لاپەڕەکان لێرەدا نیشان دەدرێن */}
        <div className="flex-1 p-6 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
