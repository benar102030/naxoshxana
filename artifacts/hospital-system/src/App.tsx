import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import { useAuthStore } from "@/lib/auth";

import Dashboard from "@/pages/dashboard";
import Patients from "@/pages/patients";
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
import Inventory from "@/pages/inventory";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Login />;
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/patients" component={Patients} />
        <Route path="/staff" component={Staff} />
        <Route path="/opd" component={OPD} />
        <Route path="/ipd" component={IPD} />
        <Route path="/emergency" component={Emergency} />
        <Route path="/surgery" component={Surgery} />
        <Route path="/lab" component={Lab} />
        <Route path="/radiology" component={Radiology} />
        <Route path="/pharmacy" component={Pharmacy} />
        <Route path="/prescriptions" component={Prescriptions} />
        <Route path="/billing" component={Billing} />
        <Route path="/inventory" component={Inventory} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
