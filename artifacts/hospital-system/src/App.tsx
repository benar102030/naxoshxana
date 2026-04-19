import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import { useAuthStore } from "@/lib/auth";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import Dashboard from "@/pages/dashboard";
import Patients from "@/pages/patients";
import PatientDetail from "@/pages/patient-detail";
import Staff from "@/pages/staff";
import OPD from "@/pages/opd";
import IPD from "@/pages/ipd";
import Emergency from "@/pages/emergency";
import Surgery from "@/pages/surgery";
import Lab from "@/pages/lab";
import Radiology from "@/pages/radiology";
import Pharmacy from "@/pages/pharmacy";
import Prescriptions from "@/pages/prescriptions";
import Billing from "@/pages/billing";
import BedMap from "@/pages/bed-map";
import BloodBank from "@/pages/blood-bank";
import DutyRoster from "@/pages/duty-roster";
import Inventory from "@/pages/inventory";
import Profile from "@/pages/profile";

/**
 * ڕێکخستنی React Query بۆ بەڕێوەبردنی کەش (Caching) و هێنانەدی داتا
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // تەنها یەک جار هەوڵ بدەرەوە ئەگەر هەڵە ڕوویدا
      refetchOnWindowFocus: false, // دووبارە داتا مەهێنەرەوە کاتێک پەنجەرەکە چالاک دەبێتەوە
    },
  },
});

import { Redirect } from "wouter";

/**
 * پاراستنی ڕێڕەوەکان (Protected Routes)
 * ئەم بەشە ڕێگری دەکات لەو بەکارهێنەرانەی کە مۆڵەتیان نییە بۆ بینینی لاپەڕەکان
 */
function ProtectedRoute({ 
  component: Component, 
  roles = ["admin", "manager", "doctor", "nurse", "pharmacist", "cashier", "labtech", "radtech"] 
}: { 
  component: React.ComponentType<any>; 
  roles?: string[] 
}) {
  const user = useAuthStore((s) => s.user);
  
  // ئەگەر بەکارهێنەر نەچووبێتە ژوورەوە، بیگوازەرەوە بۆ لاپەڕەی Login
  if (!user) return <Redirect to="/login" />;
  
  // ئەگەر ڕۆڵی بەکارهێنەرەکە لە لیستی ڕێگەپێدراوەکاندا نەبوو، بیگەڕێنەرەوە بۆ لاپەڕەی سەرەکی
  if (!roles.includes(user.role)) return <Redirect to="/" />;
  
  return <Component />;
}

/**
 * سیستەمی ڕێڕەوکردن (Routing System)
 * پێناسەکردنی هەموو ناونیشانەکانی لاپەڕەکان و دیاریکردنی مۆڵەتی دەستپێگەیشتن
 */
function Router() {
  const token = useAuthStore((s) => s.token);
  
  // ئەگەر تۆکن نەبوو، تەنها لاپەڕەی چوونەژوورەوە نیشان بدە
  if (!token) return <Login />;
  
  return (
    <Layout>
      <Switch>
        {/* لاپەڕەی سەرەکی - داشبۆرد */}
        <Route path="/">
          <ProtectedRoute component={Dashboard} />
        </Route>
        
        {/* بەشی نەخۆشەکان */}
        <Route path="/patients">
          <ProtectedRoute component={Patients} />
        </Route>
        <Route path="/patients/:id">
          <ProtectedRoute component={PatientDetail} />
        </Route>
        
        {/* بەشی کارمەندان - تەنها بەڕێوەبەران */}
        <Route path="/staff">
          <ProtectedRoute component={Staff} roles={["admin", "manager"]} />
        </Route>
        
        {/* کاتەکانی نۆرینگەی دەرەکی */}
        <Route path="/opd">
          <ProtectedRoute component={OPD} roles={["admin", "manager", "doctor", "nurse"]} />
        </Route>
        
        {/* بەشی خەواندنی نەخۆش */}
        <Route path="/ipd">
          <ProtectedRoute component={IPD} roles={["admin", "manager", "doctor", "nurse"]} />
        </Route>
        
        {/* بەشی فریاگوزاری خێرا */}
        <Route path="/emergency">
          <ProtectedRoute component={Emergency} roles={["admin", "manager", "doctor", "nurse"]} />
        </Route>
        
        {/* بەشی نەشتەرگەری */}
        <Route path="/surgery">
          <ProtectedRoute component={Surgery} roles={["admin", "manager", "doctor", "nurse"]} />
        </Route>
        
        {/* بەشی تاقیگە */}
        <Route path="/lab">
          <ProtectedRoute component={Lab} roles={["admin", "manager", "doctor", "nurse", "labtech"]} />
        </Route>
        
        {/* بەشی تیشک و سۆنەر */}
        <Route path="/radiology">
          <ProtectedRoute component={Radiology} roles={["admin", "manager", "doctor", "nurse", "radtech"]} />
        </Route>
        
        {/* بەشی دەرمانخانە */}
        <Route path="/pharmacy">
          <ProtectedRoute component={Pharmacy} roles={["admin", "manager", "doctor", "pharmacist"]} />
        </Route>
        
        {/* بەشی ڕەچەتەکان */}
        <Route path="/prescriptions">
          <ProtectedRoute component={Prescriptions} roles={["admin", "manager", "doctor", "nurse", "pharmacist"]} />
        </Route>
        
        {/* بەشی حسابات و پسوولەکان */}
        <Route path="/billing">
          <ProtectedRoute component={Billing} roles={["admin", "manager", "cashier"]} />
        </Route>

        {/* نەخشەی جێگاکان و بانکی خوێن */}
        <Route path="/bed-map">
          <ProtectedRoute component={BedMap} roles={["admin", "manager", "doctor", "nurse"]} />
        </Route>
        <Route path="/blood-bank">
          <ProtectedRoute component={BloodBank} roles={["admin", "manager", "doctor", "nurse", "labtech", "radtech"]} />
        </Route>

        <Route path="/duty-roster">
          <ProtectedRoute component={DutyRoster} roles={["admin", "manager", "doctor", "nurse", "pharmacist", "cashier", "labtech", "radtech"]} />
        </Route>
        
        {/* بەشی کۆگای پێداویستییەکان */}
        <Route path="/inventory">
          <ProtectedRoute component={Inventory} roles={["admin", "manager", "pharmacist"]} />
        </Route>
        
        {/* پڕۆفایلی بەکارهێنەر */}
        <Route path="/profile">
          <ProtectedRoute component={Profile} />
        </Route>
        
        {/* لاپەڕەی هەڵە کاتێک ناونیشانەکە هەڵەیە */}
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

/**
 * پێکهاتەی سەرەکی ئەپڵیکەیشن (Root Component)
 */
function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
