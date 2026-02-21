import React, { useState } from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import APICallService from '../api/apiCallService';
import { LOGIN } from '../api/apiEndPoints';
import { FiMail, FiLock, FiEye, FiEyeOff, FiTruck, FiArrowRight } from 'react-icons/fi';
import { useStaticText } from '../utils/staticJSON';
import { success } from '../utils/toast';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../store/slices/authSlice';

const PRIMARY = '#F26B8A';
const PRIMARY_D = '#e04d6e';
const PRIMARY_T = '#fde8ed';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const staticText = useStaticText();
    const dispatch = useAppDispatch();
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const validationSchema = Yup.object().shape({
        email: Yup.string().email(staticText.auth.validation.emailInvalid).required(staticText.auth.validation.emailRequired),
        password: Yup.string().required(staticText.auth.validation.passwordRequired),
    });

    const formik = useFormik({
        initialValues: { email: '', password: '' },
        validationSchema,
        onSubmit: async (values) => {
            setLoading(true);
            try {
                const response = await new APICallService(LOGIN, { email: values.email, password: values.password }).callAPI();
                if (response) {
                    dispatch(setCredentials({ user: response.user, token: response.token }));
                    success(staticText.toast.auth.login);
                    navigate('/dashboard');
                }
            } catch (err: any) {
                console.error('Login Error:', err);
            } finally {
                setLoading(false);
            }
        },
    });

    return (
        <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Inter, sans-serif' }}>

            {/* ── Left Brand Panel ───────────────────────────────────────────── */}
            <div
                style={{
                    width: '42%',
                    background: `linear-gradient(145deg, ${PRIMARY} 0%, ${PRIMARY_D} 100%)`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '60px 48px',
                    color: '#fff',
                    position: 'relative',
                    overflow: 'hidden',
                }}
                className="d-none d-md-flex"
            >
                {/* decorative blobs */}
                <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

                {/* Brand logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
                    <div style={{ background: 'rgba(255,255,255,0.20)', borderRadius: 14, padding: '10px 12px', display: 'flex' }}>
                        <FiTruck size={28} color="#fff" />
                    </div>
                    <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px' }}>FleetFlow</span>
                </div>

                <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16, lineHeight: 1.2, textAlign: 'center' }}>
                    Manage your fleet<br />smarter & faster
                </h2>
                <p style={{ opacity: 0.85, fontSize: 15, textAlign: 'center', lineHeight: 1.7, marginBottom: 40 }}>
                    Real-time tracking, dispatch management,<br />
                    maintenance alerts and analytics — all in one place.
                </p>

                {/* feature pills */}
                {['Live Fleet Tracking', 'Smart Dispatch', 'Safety Monitoring', 'Financial Analytics'].map(f => (
                    <div key={f} style={{
                        background: 'rgba(255,255,255,0.15)',
                        borderRadius: 40,
                        padding: '8px 20px',
                        fontSize: 13,
                        fontWeight: 600,
                        margin: '4px 0',
                        backdropFilter: 'blur(4px)',
                    }}>
                        {f}
                    </div>
                ))}
            </div>

            {/* ── Right Form Panel ───────────────────────────────────────────── */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 24px',
                background: '#fafafa',
            }}>
                <div style={{ width: '100%', maxWidth: 420 }}>

                    {/* Mobile brand */}
                    <div className="d-flex d-md-none align-items-center gap-2 mb-4">
                        <div style={{ background: PRIMARY, borderRadius: 10, padding: '6px 8px', display: 'flex' }}>
                            <FiTruck size={18} color="#fff" />
                        </div>
                        <span style={{ fontSize: 20, fontWeight: 800, color: PRIMARY }}>FleetFlow</span>
                    </div>

                    {/* Heading */}
                    <div style={{ marginBottom: 32 }}>
                        <h1 style={{ fontSize: 30, fontWeight: 800, color: PRIMARY, marginBottom: 6, letterSpacing: '-0.5px' }}>
                            Welcome Back
                        </h1>
                        <p style={{ color: '#6b7280', fontSize: 15, margin: 0 }}>
                            Sign in to manage your fleet assets
                        </p>
                    </div>

                    <Form onSubmit={formik.handleSubmit}>

                        {/* Email */}
                        <Form.Group className="mb-4">
                            <Form.Label style={{ fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>
                                {staticText.auth.emailLabel}
                            </Form.Label>
                            <InputGroup>
                                <InputGroup.Text style={{
                                    background: PRIMARY_T,
                                    border: `1.5px solid ${formik.touched.email && formik.errors.email ? '#dc2626' : '#f1c1cc'}`,
                                    borderRight: 'none',
                                    color: PRIMARY,
                                    borderRadius: '10px 0 0 10px',
                                }}>
                                    <FiMail size={17} />
                                </InputGroup.Text>
                                <Form.Control
                                    type="email"
                                    placeholder="Enter your email"
                                    style={{
                                        border: `1.5px solid ${formik.touched.email && formik.errors.email ? '#dc2626' : '#f1c1cc'}`,
                                        borderLeft: 'none',
                                        borderRadius: '0 10px 10px 0',
                                        background: '#fff',
                                        fontSize: 14,
                                        padding: '11px 14px',
                                    }}
                                    {...formik.getFieldProps('email')}
                                />
                            </InputGroup>
                            {formik.touched.email && formik.errors.email && (
                                <div className="text-danger small mt-1">{formik.errors.email}</div>
                            )}
                        </Form.Group>

                        {/* Password */}
                        <Form.Group className="mb-4">
                            <Form.Label style={{ fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>
                                {staticText.auth.passwordLabel}
                            </Form.Label>
                            <InputGroup>
                                <InputGroup.Text style={{
                                    background: PRIMARY_T,
                                    border: `1.5px solid ${formik.touched.password && formik.errors.password ? '#dc2626' : '#f1c1cc'}`,
                                    borderRight: 'none',
                                    color: PRIMARY,
                                    borderRadius: '10px 0 0 10px',
                                }}>
                                    <FiLock size={17} />
                                </InputGroup.Text>
                                <Form.Control
                                    type={passwordVisible ? 'text' : 'password'}
                                    placeholder={staticText.auth.passwordPlaceholder}
                                    style={{
                                        border: `1.5px solid ${formik.touched.password && formik.errors.password ? '#dc2626' : '#f1c1cc'}`,
                                        borderLeft: 'none',
                                        borderRight: 'none',
                                        background: '#fff',
                                        fontSize: 14,
                                        padding: '11px 14px',
                                        borderRadius: 0,
                                    }}
                                    {...formik.getFieldProps('password')}
                                />
                                <InputGroup.Text
                                    onClick={() => setPasswordVisible(!passwordVisible)}
                                    style={{
                                        background: PRIMARY_T,
                                        border: `1.5px solid ${formik.touched.password && formik.errors.password ? '#dc2626' : '#f1c1cc'}`,
                                        borderLeft: 'none',
                                        color: PRIMARY,
                                        borderRadius: '0 10px 10px 0',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {passwordVisible ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                                </InputGroup.Text>
                            </InputGroup>
                            {formik.touched.password && formik.errors.password && (
                                <div className="text-danger small mt-1">{formik.errors.password}</div>
                            )}
                        </Form.Group>

                        {/* Submit */}
                        <Button
                            type="submit"
                            disabled={loading || !formik.isValid}
                            style={{
                                width: '100%',
                                background: loading || !formik.isValid
                                    ? '#f7a8bc'
                                    : `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_D} 100%)`,
                                border: 'none',
                                borderRadius: 10,
                                padding: '13px 0',
                                fontWeight: 700,
                                fontSize: 15,
                                letterSpacing: '0.3px',
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                boxShadow: '0 4px 14px rgba(242,107,138,0.35)',
                                transition: 'all 0.2s',
                            }}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                                    Please wait...
                                </>
                            ) : (
                                <>Login <FiArrowRight size={16} /></>
                            )}
                        </Button>
                    </Form>

                    {/* Sign-up link */}
                    <div style={{ textAlign: 'center', marginTop: 28 }}>
                        <span style={{ color: '#6b7280', fontSize: 14 }}>{staticText.auth.noAccountQuestion} </span>
                        <Link
                            to="/register"
                            style={{ color: PRIMARY, fontWeight: 700, textDecoration: 'none', fontSize: 14 }}
                        >
                            Sign Up →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
