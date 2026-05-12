import { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './lib/store';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Siswa from './pages/Siswa';
import Transaksi from './pages/Transaksi';
import Laporan from './pages/Laporan';
import Pengaturan from './pages/Pengaturan';

function PrivateRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <PrivateRoute>
            <Layout><Dashboard /></Layout>
          </PrivateRoute>
        } />
        
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Layout><Dashboard /></Layout>
          </PrivateRoute>
        } />

        <Route path="/siswa" element={
          <PrivateRoute>
            <Layout><Siswa /></Layout>
          </PrivateRoute>
        } />

        <Route path="/transaksi/setoran" element={
          <PrivateRoute>
            <Layout><Transaksi type="SETORAN" /></Layout>
          </PrivateRoute>
        } />

        <Route path="/transaksi/penarikan" element={
          <PrivateRoute>
            <Layout><Transaksi type="PENARIKAN" /></Layout>
          </PrivateRoute>
        } />

        <Route path="/laporan" element={
          <PrivateRoute>
            <Layout><Laporan /></Layout>
          </PrivateRoute>
        } />

        <Route path="/pengaturan" element={
          <PrivateRoute>
            <Layout><Pengaturan /></Layout>
          </PrivateRoute>
        } />

        {/* Catch all to Dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}
