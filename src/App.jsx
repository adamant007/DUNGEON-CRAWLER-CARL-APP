import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
// Add page imports here
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import RulesSystems from './pages/RulesSystems';
import Tapestry from './pages/Tapestry';
import Library from './pages/Library';
import CharacterSheet from './pages/CharacterSheet';
import ComingSoon from './pages/ComingSoon';
import Campaign from './pages/Campaign';
import GmTools from './pages/GmTools';
import ClaimCharacter from './pages/ClaimCharacter';
import NavLayout from './components/NavLayout';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <>
    <Routes>
    {/* Add your page Route elements here */}
    <Route path="/" element={<Home />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="/claim" element={<ClaimCharacter />} />
    {/* Legacy start experience — preserved until the new home page is approved. */}
    <Route path="/legacy/tapestry" element={<Tapestry />} />
    <Route path="/library" element={<Library />} />
    {/* Toolbar-backed destinations share one persistent shell so the nav
        artwork never remounts (and never replays its blur-up) on navigation. */}
    <Route element={<NavLayout />}>
      <Route path="/character" element={<CharacterSheet />} />
      <Route path="/rules" element={<RulesSystems />} />
      <Route path="/maps" element={<ComingSoon title="Maps & Dungeons" />} />
      <Route path="/help" element={<ComingSoon title="Tutorial & Help" />} />
      <Route path="/spells" element={<ComingSoon title="Spells" />} />
      <Route path="/gear" element={<ComingSoon title="Gear" />} />
      <Route path="/campaign" element={<Campaign />} />
      <Route path="/party" element={<ComingSoon title="Party" />} />
      <Route path="/gm-tools" element={<GmTools />} />
      <Route path="/leaderboard" element={<ComingSoon title="Leaderboard" />} />
      <Route path="/notes" element={<ComingSoon title="Notes" />} />
      <Route path="/dice-roller" element={<ComingSoon title="Dice Roller" />} />
      <Route path="/loot-generator" element={<ComingSoon title="Loot Generator" />} />
      <Route path="/initiative-tracker" element={<ComingSoon title="Initiative Tracker" />} />
      <Route path="/dungeon-ai" element={<ComingSoon title="Dungeon AI" />} />
      <Route path="/settings" element={<ComingSoon title="Settings" />} />
    </Route>
    <Route path="*" element={<PageNotFound />} />
    </Routes>
    </>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App