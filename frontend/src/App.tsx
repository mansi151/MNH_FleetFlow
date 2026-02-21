import React from 'react';
import type { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import VehicleRegistry from './pages/VehicleRegistry';
import TripDispatcher from './pages/TripDispatcher';
import MaintenanceLogs from './pages/MaintenanceLogs';
import DriverProfiles from './pages/DriverProfiles';
import ExpenseLog from './pages/ExpenseLog';
import Analytics from './pages/Analytics';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Navigation from './components/Navigation';
import { useAppSelector } from './store/hooks';
import { selectIsAuthenticated, selectUserRole } from './store/slices/authSlice';

// ─── Protected Route ─────────────────────────────────────────────────────────
interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const role = useAppSelector(selectUserRole);

    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (allowedRoles && role && !allowedRoles.includes(role)) {
        return <Navigate to="/dashboard" replace />;
    }
    return <>{children}</>;
};

// ─── Layout ──────────────────────────────────────────────────────────────────
const Layout: React.FC<{ children: ReactNode }> = ({ children }) => (
    <div className="d-flex flex-column min-vh-100 bg-light">
        <Navigation />
        <main className="flex-grow-1">
            {children}
        </main>
    </div>
);

// ─── App ─────────────────────────────────────────────────────────────────────
const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                {/* Public */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Protected – all authenticated users */}
                <Route path="/dashboard" element={
                    <ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>
                } />

                {/* Manager, Dispatcher, Safety Officer */}
                <Route path="/vehicles" element={
                    <ProtectedRoute allowedRoles={['manager', 'dispatcher', 'safety_officer']}>
                        <Layout><VehicleRegistry /></Layout>
                    </ProtectedRoute>
                } />

                {/* Manager, Dispatcher */}
                <Route path="/dispatcher" element={
                    <ProtectedRoute allowedRoles={['manager', 'dispatcher']}>
                        <Layout><TripDispatcher /></Layout>
                    </ProtectedRoute>
                } />

                {/* Manager, Safety Officer */}
                <Route path="/maintenance" element={
                    <ProtectedRoute allowedRoles={['manager', 'safety_officer']}>
                        <Layout><MaintenanceLogs /></Layout>
                    </ProtectedRoute>
                } />

                {/* Manager, Safety Officer, Dispatcher */}
                <Route path="/drivers" element={
                    <ProtectedRoute allowedRoles={['manager', 'safety_officer', 'dispatcher']}>
                        <Layout><DriverProfiles /></Layout>
                    </ProtectedRoute>
                } />

                {/* Manager, Financial Analyst */}
                <Route path="/expenses" element={
                    <ProtectedRoute allowedRoles={['manager', 'financial_analyst']}>
                        <Layout><ExpenseLog /></Layout>
                    </ProtectedRoute>
                } />

                {/* Manager, Financial Analyst */}
                <Route path="/analytics" element={
                    <ProtectedRoute allowedRoles={['manager', 'financial_analyst']}>
                        <Layout><Analytics /></Layout>
                    </ProtectedRoute>
                } />

                {/* Fallback */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>

            <ToastContainer position="bottom-right" autoClose={3500} theme="colored" />
        </Router>
    );
};

export default App;
