import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { AffiliateShell } from './layout/AffiliateShell';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ReferralsScreen } from './screens/ReferralsScreen';
import { EarningsScreen } from './screens/EarningsScreen';
import { GoalsScreen } from './screens/GoalsScreen';
import { PromoScreen } from './screens/PromoScreen';
import { IncomeReportScreen } from './screens/IncomeReportScreen';

function RequireAuth() {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (!session) return <Navigate to="/login" replace />;
  return <AffiliateShell />;
}

function RedirectIfAuthed() {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (session) return <Navigate to="/" replace />;
  return <LoginScreen />;
}

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<RedirectIfAuthed />} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/indicacoes" element={<ReferralsScreen />} />
          <Route path="/ganhos" element={<EarningsScreen />} />
          <Route path="/metas" element={<GoalsScreen />} />
          <Route path="/divulgar" element={<PromoScreen />} />
          <Route path="/informe" element={<IncomeReportScreen />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
