import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout, selectCurrentToken, selectCurrentUser, selectUserRole } from '../store/slices/authSlice';
import {
    FiHome, FiTruck, FiMap, FiTool,
    FiUser, FiBarChart2, FiLogOut
} from 'react-icons/fi';
import { TbCurrencyRupee } from 'react-icons/tb';

interface NavItem {
    path: string;
    label: string;
    icon: React.ReactNode;
    roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: <FiHome size={14} /> },
    { path: '/vehicles', label: 'Registry', icon: <FiTruck size={14} />, roles: ['manager', 'dispatcher', 'safety_officer'] },
    { path: '/dispatcher', label: 'Dispatcher', icon: <FiMap size={14} />, roles: ['manager', 'dispatcher'] },
    { path: '/maintenance', label: 'Maintenance', icon: <FiTool size={14} />, roles: ['manager', 'safety_officer'] },
    { path: '/drivers', label: 'Drivers', icon: <FiUser size={14} />, roles: ['manager', 'safety_officer', 'dispatcher'] },
    { path: '/expenses', label: 'Expenses', icon: <TbCurrencyRupee size={16} />, roles: ['manager', 'financial_analyst'] },
    { path: '/analytics', label: 'Analytics', icon: <FiBarChart2 size={14} />, roles: ['manager', 'financial_analyst'] },
];

const ROLE_META: Record<string, { label: string; bg: string; text: string }> = {
    manager: { label: 'Manager', bg: '#2563eb', text: '#fff' },
    dispatcher: { label: 'Dispatcher', bg: '#0ea5e9', text: '#fff' },
    safety_officer: { label: 'Safety Officer', bg: '#f59e0b', text: '#fff' },
    financial_analyst: { label: 'Financial Analyst', bg: '#10b981', text: '#fff' },
    driver: { label: 'Driver', bg: '#6b7280', text: '#fff' },
};

const Navigation: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const token = useAppSelector(selectCurrentToken);
    const user = useAppSelector(selectCurrentUser);
    const role = useAppSelector(selectUserRole);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    if (!token) return null;

    const isActive = (path: string) => location.pathname === path;
    const roleMeta = ROLE_META[role || ''] || { label: role || 'User', bg: '#6b7280', text: '#fff' };
    const initials = (user?.username || 'U').slice(0, 2).toUpperCase();

    const visibleItems = NAV_ITEMS.filter(item =>
        !item.roles || !role || item.roles.includes(role)
    );

    return (
        <>
            {/* ── Custom global styles injected once ── */}
            <style>{`
                .ff-nav-link {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #4b5563;
                    text-decoration: none;
                    transition: background 0.15s, color 0.15s;
                    white-space: nowrap;
                }
                .ff-nav-link:hover {
                    background: #f3f4f6;
                    color: #111827;
                }
                .ff-nav-link.active {
                    background: #F26B8A;
                    color: #fff !important;
                    box-shadow: 0 2px 8px rgba(242,107,138,0.30);
                }
                .ff-avatar {
                    width: 34px;
                    height: 34px;
                    border-radius: 50%;
                    background: #F26B8A;
                    color: #fff;
                    font-size: 12px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .ff-role-chip {
                    padding: 2px 10px;
                    border-radius: 999px;
                    font-size: 11px;
                    font-weight: 600;
                    line-height: 1.6;
                    display: inline-block;
                }
                .ff-logout-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 7px 14px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    border: 1.5px solid #fca5a5;
                    background: #fff5f5;
                    color: #dc2626;
                    cursor: pointer;
                    transition: background 0.15s, color 0.15s;
                    white-space: nowrap;
                }
                .ff-logout-btn:hover {
                    background: #dc2626;
                    color: #fff;
                    border-color: #dc2626;
                }
            `}</style>

            <Navbar
                expand="lg"
                style={{
                    background: '#ffffff',
                    borderBottom: '1px solid #e5e7eb',
                    padding: '0 0',
                    minHeight: 56,
                    position: 'sticky',
                    top: 0,
                    zIndex: 1030,
                    boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
                }}
            >
                <Container fluid className="px-4" style={{ minHeight: 56, gap: 0 }}>

                    {/* ── Brand ── */}
                    <Navbar.Brand
                        as={Link}
                        to="/dashboard"
                        style={{
                            fontWeight: 800,
                            fontSize: 17,
                            color: '#F26B8A',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            marginRight: 20,
                            textDecoration: 'none',
                            letterSpacing: '-0.3px',
                        }}
                    >
                        <div style={{
                            background: '#F26B8A',
                            borderRadius: 8,
                            padding: '5px 7px',
                            display: 'flex',
                            alignItems: 'center',
                        }}>
                            <FiTruck size={16} color="#fff" />
                        </div>
                        FleetFlow
                    </Navbar.Brand>

                    <Navbar.Toggle aria-controls="ff-nav" className="border-0 shadow-none" />

                    <Navbar.Collapse id="ff-nav">
                        {/* ── Nav links ── */}
                        <Nav className="me-auto align-items-center" style={{ gap: 2 }}>
                            {visibleItems.map(item => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`ff-nav-link${isActive(item.path) ? ' active' : ''}`}
                                >
                                    {item.icon}
                                    {item.label}
                                </Link>
                            ))}
                        </Nav>

                        {/* ── Right side ── */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

                            {/* User info card */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                // background: '#ffffff',
                                // border: '1px solid #e2e8f0',
                                borderRadius: '12px',
                                padding: '6px 14px 6px 6px',
                                // boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}>
                                {/* Avatar circle - using user's initials */}
                                <div style={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: '50%',
                                    background: '#F26B8A',
                                    color: '#fff',
                                    fontSize: '14px',
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textTransform: 'uppercase'
                                }}>
                                    {initials}
                                </div>

                                {/* Name + role */}
                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', lineHeight: 1.1 }}>
                                        {user?.username || 'User Profile'}
                                    </div>
                                    <div style={{ marginTop: 2 }}>
                                        <span
                                            style={{
                                                background: '#4f46e5', // Royal Blue for Manager style
                                                color: '#fff',
                                                padding: '1px 12px',
                                                borderRadius: '20px',
                                                fontSize: '11px',
                                                fontWeight: 600,
                                                display: 'inline-block'
                                            }}
                                        >
                                            {roleMeta.label}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Logout */}
                            <button className="ff-logout-btn p-2" onClick={handleLogout}>
                                <FiLogOut size={16} />
                            </button>
                        </div>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>
    );
};

export default Navigation;
