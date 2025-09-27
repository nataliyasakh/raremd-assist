import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/header";
import MainSidebar from "@/components/main-sidebar";
import Dashboard from "@/pages/dashboard";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import KnowledgeBasePage from "@/pages/knowledge-base";
import TestCases from "@/pages/test-cases";
import PhysicianProfile from "@/pages/physician-profile";
import HelpPage from "@/pages/help";
import CommunityRepository from "@/pages/community-repository";
import GlobalPhenotypeMapping from "@/pages/global-phenotype-mapping";
import DiagnosticChallenges from "@/pages/diagnostic-challenges";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <Header />
      <MainSidebar />
      <main className="pt-20 px-4 md:px-6">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/settings" component={Settings} />
          <Route path="/knowledge-base" component={KnowledgeBasePage} />
          <Route path="/test-cases" component={TestCases} />
          <Route path="/physician-profile" component={PhysicianProfile} />
          <Route path="/help" component={HelpPage} />
          {/* iGEM 2025 Community Features */}
          <Route path="/community/repository" component={CommunityRepository} />
          <Route path="/community/phenotype-mapping" component={GlobalPhenotypeMapping} />
          <Route path="/community/challenges" component={DiagnosticChallenges} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
