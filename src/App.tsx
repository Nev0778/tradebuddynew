import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppShell } from './components/AppShell';
import { InboxPage } from './pages/InboxPage';
import { ThreadPage } from './pages/ThreadPage';
import { SettingsPage } from './pages/SettingsPage';
import { BusinessProfilePage } from './pages/BusinessProfilePage';
import { QuickRepliesPage } from './pages/QuickRepliesPage';
import { AutoReplyPage } from './pages/AutoReplyPage';
import { CredentialsPage } from './pages/CredentialsPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter basename="/tradebuddynew">
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
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
