import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppShell } from './components/AppShell';
import { AuthPage } from './pages/AuthPage';
import { InboxPage } from './pages/InboxPage';
import { ThreadPage } from './pages/ThreadPage';
import { SettingsPage } from './pages/SettingsPage';
import { BusinessProfilePage } from './pages/BusinessProfilePage';
import { QuickRepliesPage } from './pages/QuickRepliesPage';
import { AutoReplyPage } from './pages/AutoReplyPage';
import { CredentialsPage } from './pages/CredentialsPage';
import { FacebookOAuthCallbackPage } from './pages/FacebookOAuthCallbackPage';

function AuthGate() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--navy)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 12,
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: 'var(--amber)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: 24,
        }}>💬</div>
        <p style={{ color: 'var(--slate)', fontSize: 13 }}>Loading…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Navigate to="/inbox" replace />} />
          <Route path="inbox" element={<InboxPage />} />
          <Route path="inbox/:id" element={<ThreadPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="settings/business-profile" element={<BusinessProfilePage />} />
          <Route path="settings/quick-replies" element={<QuickRepliesPage />} />
          <Route path="settings/auto-reply" element={<AutoReplyPage />} />
          <Route path="settings/credentials" element={<CredentialsPage />} />
        </Route>
        <Route path="oauth/facebook" element={<FacebookOAuthCallbackPage />} />
      </Routes>
    </AppProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/tradebuddynew">
        <AuthGate />
      </BrowserRouter>
    </AuthProvider>
  );
}
