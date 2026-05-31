import { BrowserRouter, Route, Routes } from 'react-router-dom';

import {
  OwnerOnlyRoute,
  PublicOnlyRoute,
  VolunteerOnlyRoute,
} from '@/common/components/routes/ProtectedRoutes';
import { UserProvider } from '@/common/contexts/UserContext';
import AuthCallback from '@/pages/account/AuthCallback';
import Login from '@/pages/account/Login';
import RequestPasswordReset from '@/pages/account/RequestPasswordReset';
import ResetPassword from '@/pages/account/ResetPassword';
import SignUp from '@/pages/account/SignUp';
import ActivityLogPage from '@/pages/activity/ActivityLogPage';
import BarcodeGeneratorPage from '@/pages/barcode/BarcodeGeneratorPage';
import InventoryPage from '@/pages/inventory/InventoryPage';
import LandingPage from '@/pages/landing/LandingPage';
import NotFound from '@/pages/not-found/NotFound';
import ScanInPage from '@/pages/scan-in/ScanInPage';
import ScanOutPage from '@/pages/scan-out/ScanOutPage';
import VolunteerEntryPage from '@/pages/volunteer/VolunteerEntryPage';
import VolunteersPage from '@/pages/volunteers/VolunteersPage';

import './App.css';

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<LandingPage />} />

          {/* Volunteer entry: public-only (no mobile restriction — any device can enter a code) */}
          <Route element={<PublicOnlyRoute />}>
            <Route path='volunteer/entry' element={<VolunteerEntryPage />} />
          </Route>

          {/* Scan-in: volunteer-only guard so owners/guests can't access it directly */}
          <Route element={<VolunteerOnlyRoute />}>
            <Route path='scan-in' element={<ScanInPage />} />
          </Route>

          <Route element={<OwnerOnlyRoute />}>
            <Route path='inventory' element={<InventoryPage />} />
            <Route
              path='barcode-generator'
              element={<BarcodeGeneratorPage />}
            />
            <Route path='activity' element={<ActivityLogPage />} />
            <Route path='scan-out' element={<ScanOutPage />} />
            <Route path='volunteers' element={<VolunteersPage />} />
          </Route>

          <Route element={<PublicOnlyRoute />}>
            <Route path='login' element={<Login />} />
            <Route path='signup' element={<SignUp />} />
            <Route path='forgot-password' element={<RequestPasswordReset />} />
          </Route>
          <Route path='auth/callback' element={<AuthCallback />} />
          <Route path='auth/reset-password' element={<ResetPassword />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}
