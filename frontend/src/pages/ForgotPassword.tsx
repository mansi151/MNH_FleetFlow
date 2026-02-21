import React, { useState } from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import APICallService from '../api/apiCallService';
import { FiMail, FiTruck, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { useStaticText } from '../utils/staticJSON';
import { success } from '../utils/toast';
import { FORGOTPASSWORD } from '../api/apiEndPoints';

const PRIMARY = '#F26B8A';
const PRIMARY_D = '#e04d6e';
const PRIMARY_T = '#fde8ed';

const ForgotPassword: React.FC = () => {
    const navigate = useNavigate();
    const staticText = useStaticText();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [resetToken, setResetToken] = useState<string | null>(null);

    const validationSchema = Yup.object().shape({
        email: Yup.string().email(staticText.auth.validation.emailInvalid).required(staticText.auth.validation.emailRequired),
    });

    const formik = useFormik({
        initialValues: { email: '' },
        validationSchema,
        onSubmit: async (values) => {
            setLoading(true);
            try {
                const response = await new APICallService(FORGOTPASSWORD, { email: values.email }).callAPI();
                if (response) {
                    success("Reset link generated successfully!");
                    setSubmitted(true);
                    setResetToken(response.token); // In real app, this would be in the email
                }
            } catch (err: any) {
                console.error('Forgot Password Error:', err);
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
                    Securing your fleet<br />is our priority
                </h2>
                <p style={{ opacity: 0.85, fontSize: 15, textAlign: 'center', lineHeight: 1.7, marginBottom: 40 }}>
                    Forgot your password? No worries.<br />
                    We'll help you get back into your cockpit in no time.
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

                    {!submitted ? (
                        <>
                            <div style={{ marginBottom: 32 }}>
                                <h1 style={{ fontSize: 30, fontWeight: 800, color: PRIMARY, marginBottom: 6, letterSpacing: '-0.5px' }}>
                                    Reset Password
                                </h1>
                                <p style={{ color: '#6b7280', fontSize: 15, margin: 0 }}>
                                    Enter your registered email and we'll send you a reset token
                                </p>
                            </div>

                            <Form onSubmit={formik.handleSubmit}>
                                <Form.Group className="mb-4">
                                    <Form.Label style={{ fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>
                                        Registered Email
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
                                            Verifying...
                                        </>
                                    ) : (
                                        <>Send Reset Link <FiArrowRight size={16} /></>
                                    )}
                                </Button>
                            </Form>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: PRIMARY, marginBottom: 20 }}>
                                <FiCheckCircle size={60} />
                            </div>
                            <h2 style={{ fontSize: 26, fontWeight: 800, color: PRIMARY, marginBottom: 12 }}>Token Generated!</h2>
                            <p style={{ color: '#6b7280', fontSize: 15, lineHeight: 1.6, marginBottom: 30 }}>
                                Since this is a demo, we've generated a reset token for you.<br />
                                <strong>Token: {resetToken}</strong>
                            </p>
                            <Button
                                onClick={() => navigate(`/reset-password?token=${resetToken}`)}
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
                                Proceed to Reset Password
                            </Button>
                        </div>
                    )}

                    <div style={{ textAlign: 'center', marginTop: 28 }}>
                        <Link
                            to="/login"
                            style={{ color: '#6b7280', fontWeight: 600, textDecoration: 'none', fontSize: 14 }}
                        >
                            ← Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
