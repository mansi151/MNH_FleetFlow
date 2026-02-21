import React, { useState } from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import APICallService from '../api/apiCallService';
import { FiLock, FiEye, FiEyeOff, FiTruck, FiCheckCircle } from 'react-icons/fi';
import { useStaticText } from '../utils/staticJSON';
import { success } from '../utils/toast';

const PRIMARY = '#F26B8A';
const PRIMARY_D = '#e04d6e';
const PRIMARY_T = '#fde8ed';

const ResetPassword: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const staticText = useStaticText();
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resetComplete, setResetComplete] = useState(false);

    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    const validationSchema = Yup.object().shape({
        password: Yup.string().min(7, "Password must be at least 7 characters").required(staticText.auth.validation.passwordRequired),
        confirmPassword: Yup.string().oneOf([Yup.ref('password')], 'Passwords must match').required('Please confirm your password'),
    });

    const formik = useFormik({
        initialValues: { password: '', confirmPassword: '' },
        validationSchema,
        onSubmit: async (values) => {
            if (!token) return;
            setLoading(true);
            try {
                const response = await new APICallService('user/reset-password', {
                    token,
                    newPassword: values.password
                }).callAPI();
                if (response) {
                    success("Password reset successful!");
                    setResetComplete(true);
                }
            } catch (err: any) {
                console.error('Reset Password Error:', err);
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
                <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
                    <div style={{ background: 'rgba(255,255,255,0.20)', borderRadius: 14, padding: '10px 12px', display: 'flex' }}>
                        <FiTruck size={28} color="#fff" />
                    </div>
                    <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px' }}>FleetFlow</span>
                </div>

                <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16, lineHeight: 1.2, textAlign: 'center' }}>
                    Welcome back,<br />Captain!
                </h2>
                <p style={{ opacity: 0.85, fontSize: 15, textAlign: 'center', lineHeight: 1.7, marginBottom: 40 }}>
                    Enter your new secret combination.<br />
                    Make it strong, make it memorable.
                </p>
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

                    <div className="d-flex d-md-none align-items-center gap-2 mb-4">
                        <div style={{ background: PRIMARY, borderRadius: 10, padding: '6px 8px', display: 'flex' }}>
                            <FiTruck size={18} color="#fff" />
                        </div>
                        <span style={{ fontSize: 20, fontWeight: 800, color: PRIMARY }}>FleetFlow</span>
                    </div>

                    {!resetComplete ? (
                        <>
                            <div style={{ marginBottom: 32 }}>
                                <h1 style={{ fontSize: 30, fontWeight: 800, color: PRIMARY, marginBottom: 6, letterSpacing: '-0.5px' }}>
                                    Create New Password
                                </h1>
                                <p style={{ color: '#6b7280', fontSize: 15, margin: 0 }}>
                                    Set your new secure password below
                                </p>
                            </div>

                            <Form onSubmit={formik.handleSubmit}>
                                {/* New Password */}
                                <Form.Group className="mb-4">
                                    <Form.Label style={{ fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>
                                        New Password
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
                                            placeholder="Enter new password"
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

                                {/* Confirm Password */}
                                <Form.Group className="mb-4">
                                    <Form.Label style={{ fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>
                                        Confirm New Password
                                    </Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text style={{
                                            background: PRIMARY_T,
                                            border: `1.5px solid ${formik.touched.confirmPassword && formik.errors.confirmPassword ? '#dc2626' : '#f1c1cc'}`,
                                            borderRight: 'none',
                                            color: PRIMARY,
                                            borderRadius: '10px 0 0 10px',
                                        }}>
                                            <FiLock size={17} />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="password"
                                            placeholder="Repeat new password"
                                            style={{
                                                border: `1.5px solid ${formik.touched.confirmPassword && formik.errors.confirmPassword ? '#dc2626' : '#f1c1cc'}`,
                                                borderLeft: 'none',
                                                borderRadius: '0 10px 10px 0',
                                                background: '#fff',
                                                fontSize: 14,
                                                padding: '11px 14px',
                                            }}
                                            {...formik.getFieldProps('confirmPassword')}
                                        />
                                    </InputGroup>
                                    {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                                        <div className="text-danger small mt-1">{formik.errors.confirmPassword}</div>
                                    )}
                                </Form.Group>

                                <Button
                                    type="submit"
                                    disabled={loading || !formik.isValid || !token}
                                    style={{
                                        width: '100%',
                                        background: loading || !formik.isValid || !token
                                            ? '#f7a8bc'
                                            : `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_D} 100%)`,
                                        border: 'none',
                                        borderRadius: 10,
                                        padding: '13px 0',
                                        fontWeight: 700,
                                        fontSize: 15,
                                        color: '#fff',
                                        boxShadow: '0 4px 14px rgba(242,107,138,0.35)',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {loading ? (
                                        <span className="spinner-border spinner-border-sm" />
                                    ) : "Reset Password"}
                                </Button>
                                {!token && <div className="text-danger small mt-2 text-center">Invalid or missing reset token.</div>}
                            </Form>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: PRIMARY, marginBottom: 20 }}>
                                <FiCheckCircle size={60} />
                            </div>
                            <h2 style={{ fontSize: 26, fontWeight: 800, color: PRIMARY, marginBottom: 12 }}>Password Reset!</h2>
                            <p style={{ color: '#6b7280', fontSize: 15, lineHeight: 1.6, marginBottom: 30 }}>
                                Your password has been successfully updated.<br />
                                You can now sign in with your new credentials.
                            </p>
                            <Button
                                onClick={() => navigate('/login')}
                                style={{
                                    width: '100%',
                                    background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_D} 100%)`,
                                    border: 'none',
                                    borderRadius: 10,
                                    padding: '13px 0',
                                    fontWeight: 700,
                                    fontSize: 15,
                                    color: '#fff',
                                    boxShadow: '0 4px 14px rgba(242,107,138,0.35)',
                                }}
                            >
                                Back to Login
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
