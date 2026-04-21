import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Onboarding from "./pages/Onboarding";
import CandidateProfile from "./pages/CandidateProfile";
import CandidateDashboard from "./pages/CandidateDashboard";
import EmployerDashboard from "./pages/EmployerDashboard";
import EmployerProfile from "./pages/EmployerProfile";
import JobPostings from "./pages/JobPostings";
import CreateJob from "./pages/CreateJob";
import Matches from "./pages/Matches";
import Interview from "./pages/Interview";
import Pricing from "./pages/Pricing";
import GdprCenter from "./pages/GdprCenter";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookieConsent from "./components/CookieConsent";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/onboarding" component={Onboarding} />
      {/* Candidate routes */}
      <Route path="/kandidats" component={CandidateDashboard} />
      <Route path="/kandidats/profils" component={CandidateProfile} />
      <Route path="/kandidats/atbilstibas" component={Matches} />
      <Route path="/kandidats/gdpr" component={GdprCenter} />
      {/* Employer routes */}
      <Route path="/darbadevetajs" component={EmployerDashboard} />
      <Route path="/darbadevetajs/profils" component={EmployerProfile} />
      <Route path="/darbadevetajs/vakances" component={JobPostings} />
      <Route path="/darbadevetajs/vakances/jauna" component={CreateJob} />
      <Route path="/darbadevetajs/atbilstibas/:jobId" component={Matches} />
      {/* Shared routes */}
      <Route path="/intervija/:matchId" component={Interview} />
      <Route path="/cenas" component={Pricing} />
      <Route path="/gdpr" component={GdprCenter} />
      <Route path="/privatuma-politika" component={PrivacyPolicy} />
      <Route path="/lietosanas-noteikumi" component={TermsOfService} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <CookieConsent />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
