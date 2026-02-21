import React, { useState } from 'react';
import { Form, Button, InputGroup, Row, Col } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import APICallService from '../api/apiCallService';
import { SIGNUP } from '../api/apiEndPoints';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiBriefcase, FiTruck, FiArrowRight } from 'react-icons/fi';
import { useStaticText } from '../utils/staticJSON';
import { success } from '../utils/toast';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../store/slices/authSlice';

const PRIMARY = '#F26B8A';
const PRIMARY_D = '#e04d6e';
const PRIMARY_T = '#fde8ed';

/* reusable styled input-group helper */
const inputGroupStyle = (hasError: boolean) => ({
    border: `1.5px solid ${hasError ? '#dc2626' : '#f1c1cc'}`,
});

const Register: React.FC = () => {
    const navigate = useNavigate();
    const staticText = useStaticText();
    const dispatch = useAppDispatch();
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const roleOptions = [
        { value: 'manager', label: 'Fleet Manager' },
        { value: 'dispatcher', label: 'Dispatcher' },
        { value: 'safety_officer', label: 'Safety Officer' },
        { value: 'financial_analyst', label: 'Financial Analyst' },
    ];

    const validationSchema = Yup.object().shape({
        name: Yup.string().required(staticText.auth.validation.usernameRequired).min(3, staticText.auth.validation.usernameMinLength),
        email: Yup.string().email(staticText.auth.validation.emailInvalid).required(staticText.auth.validation.emailRequired),
        password: Yup.string()
            .required(staticText.auth.validation.passwordRequired)
            .min(8, staticText.auth.validation.passwordMinLength)
            .matches(/[a-z]/, staticText.auth.validation.passwordLowercase)
            .matches(/[A-Z]/, staticText.auth.validation.passwordUppercase)
            .matches(/[0-9]/, staticText.auth.validation.passwordNumber)
            .matches(/[^\w]/, staticText.auth.validation.passwordSpecialChar),
        role: Yup.string().required('Role is required'),
    });

    const formik = useFormik({
        initialValues: { name: '', email: '', password: '', role: '' },
        validationSchema,
        onSubmit: async (values) => {
            setLoading(true);
            try {
                const response = await new APICallService(SIGNUP, {
                    username: values.name,
                    email: values.email,
                    password: values.password,
                    role: values.role,
                }).callAPI();
                if (response) {
                    dispatch(setCredentials({ user: response.user, token: response.token }));
                    success(staticText.toast.auth.registerSuccess);
                    navigate('/dashboard');
                }
            } catch (err: any) {
                console.error('Register Error:', err);
            } finally {
                setLoading(false);
            }
        },
    });

    const fieldStyle = (hasError: boolean) => ({
        border: `1.5px solid ${hasError ? '#dc2626' : '#f1c1cc'}`,
        background: '#fff',
        fontSize: 14,
        padding: '10px 14px',
    });

    return (
        <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Inter, sans-serif' }}>

            {/* ── Left Brand Panel ───────────────────────────────────────────── */}
            <div
                className="d-none d-lg-flex"
                style={{
                    width: '38%',
                    background: `linear-gradient(145deg, ${PRIMARY} 0%, ${PRIMARY_D} 100%)`,
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '60px 40px',
                    color: '#fff',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <div style={{ position: 'absolute', top: -80, right: -80, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ position: 'absolute', bottom: -60, left: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
                    <div style={{ background: 'rgba(255,255,255,0.20)', borderRadius: 14, padding: '10px 12px', display: 'flex' }}>
                        <FiTruck size={28} color="#fff" />
                    </div>
                    <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px' }}>FleetFlow</span>
                </div>

                <h2 style={{ fontSize: 30, fontWeight: 800, marginBottom: 16, lineHeight: 1.25, textAlign: 'center' }}>
                    Join the fleet<br />revolution today
                </h2>
                <p style={{ opacity: 0.85, fontSize: 14, textAlign: 'center', lineHeight: 1.7, marginBottom: 36 }}>
                    Create your account and start managing<br />
                    your fleet smarter from day one.
                </p>

                {['No credit card required', 'Full feature access', 'Dedicated support', 'Real-time analytics'].map(f => (
                    <div key={f} style={{
                        background: 'rgba(255,255,255,0.15)',
                        borderRadius: 40,
                        padding: '7px 18px',
                        fontSize: 13,
                        fontWeight: 600,
                        margin: '4px 0',
                        backdropFilter: 'blur(4px)',
                    }}>
                        ✓ &nbsp;{f}
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
                overflowY: 'auto',
            }}>
                <div style={{ width: '100%', maxWidth: 500 }}>

                    {/* Mobile brand */}
                    <div className="d-flex d-lg-none align-items-center gap-2 mb-4">
                        <div style={{ background: PRIMARY, borderRadius: 10, padding: '6px 8px', display: 'flex' }}>
                            <FiTruck size={18} color="#fff" />
                        </div>
                        <span style={{ fontSize: 20, fontWeight: 800, color: PRIMARY }}>FleetFlow</span>
                    </div>

                    {/* Heading */}
                    <div style={{ marginBottom: 28 }}>
                        <h1 style={{ fontSize: 28, fontWeight: 800, color: PRIMARY, marginBottom: 6, letterSpacing: '-0.4px' }}>
                            Create Account
                        </h1>
                        <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>
                            Start optimizing your fleet logistics today
                        </p>
                    </div>

                    <Form onSubmit={formik.handleSubmit}>

                        {/* Name + Role row */}
                        <Row className="mb-3">
                            <Col md={6} className="mb-3 mb-md-0">
                                <Form.Label style={{ fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6, display: 'block' }}>
                                    {staticText.auth.usernameLabel} <span style={{ color: '#dc2626' }}>*</span>
                                </Form.Label>
                                <InputGroup>
                                    <InputGroup.Text style={{
                                        background: PRIMARY_T, color: PRIMARY,
                                        borderRadius: '10px 0 0 10px',
                                        ...inputGroupStyle(Boolean(formik.touched.name && formik.errors.name)),
                                        borderRight: 'none',
                                    }}>
                                        <FiUser size={16} />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        placeholder="Full Name"
                                        style={{
                                            ...fieldStyle(Boolean(formik.touched.name && formik.errors.name)),
                                            borderLeft: 'none',
                                            borderRadius: '0 10px 10px 0',
                                        }}
                                        {...formik.getFieldProps('name')}
                                    />
                                </InputGroup>
                                {formik.touched.name && formik.errors.name && (
                                    <div className="text-danger small mt-1">{formik.errors.name}</div>
                                )}
                            </Col>

                            <Col md={6}>
                                <Form.Label style={{ fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6, display: 'block' }}>
                                    Your Role <span style={{ color: '#dc2626' }}>*</span>
                                </Form.Label>
                                <InputGroup>
                                    <InputGroup.Text style={{
                                        background: PRIMARY_T, color: PRIMARY,
                                        borderRadius: '10px 0 0 10px',
                                        ...inputGroupStyle(Boolean(formik.touched.role && formik.errors.role)),
                                        borderRight: 'none',
                                    }}>
                                        <FiBriefcase size={16} />
                                    </InputGroup.Text>
                                    <Form.Select
                                        style={{
                                            ...fieldStyle(Boolean(formik.touched.role && formik.errors.role)),
                                            borderLeft: 'none',
                                            borderRadius: '0 10px 10px 0',
                                            color: formik.values.role ? '#111' : '#9ca3af',
                                        }}
                                        value={formik.values.role}
                                        onChange={e => formik.setFieldValue('role', e.target.value)}
                                        onBlur={formik.handleBlur}
                                        name="role"
                                    >
                                        <option value="">Select Department</option>
                                        {roleOptions.map(o => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
                                        ))}
                                    </Form.Select>
                                </InputGroup>
                                {formik.touched.role && formik.errors.role && (
                                    <div className="text-danger small mt-1">{formik.errors.role}</div>
                                )}
                            </Col>
                        </Row>

                        {/* Email */}
                        <Form.Group className="mb-3">
                            <Form.Label style={{ fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6, display: 'block' }}>
                                {staticText.auth.emailLabel} <span style={{ color: '#dc2626' }}>*</span>
                            </Form.Label>
                            <InputGroup>
                                <InputGroup.Text style={{
                                    background: PRIMARY_T, color: PRIMARY,
                                    borderRadius: '10px 0 0 10px',
                                    ...inputGroupStyle(Boolean(formik.touched.email && formik.errors.email)),
                                    borderRight: 'none',
                                }}>
                                    <FiMail size={16} />
                                </InputGroup.Text>
                                <Form.Control
                                    type="email"
                                    placeholder={staticText.auth.emailPlaceholder}
                                    style={{
                                        ...fieldStyle(Boolean(formik.touched.email && formik.errors.email)),
                                        borderLeft: 'none',
                                        borderRadius: '0 10px 10px 0',
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
                            <Form.Label style={{ fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6, display: 'block' }}>
                                {staticText.auth.passwordLabel} <span style={{ color: '#dc2626' }}>*</span>
                            </Form.Label>
                            <InputGroup>
                                <InputGroup.Text style={{
                                    background: PRIMARY_T, color: PRIMARY,
                                    borderRadius: '10px 0 0 10px',
                                    ...inputGroupStyle(Boolean(formik.touched.password && formik.errors.password)),
                                    borderRight: 'none',
                                }}>
                                    <FiLock size={16} />
                                </InputGroup.Text>
                                <Form.Control
                                    type={passwordVisible ? 'text' : 'password'}
                                    placeholder={staticText.auth.passwordPlaceholder}
                                    style={{
                                        ...fieldStyle(Boolean(formik.touched.password && formik.errors.password)),
                                        borderLeft: 'none',
                                        borderRight: 'none',
                                        borderRadius: 0,
                                    }}
                                    {...formik.getFieldProps('password')}
                                />
                                <InputGroup.Text
                                    onClick={() => setPasswordVisible(!passwordVisible)}
                                    style={{
                                        background: PRIMARY_T, color: PRIMARY,
                                        borderRadius: '0 10px 10px 0',
                                        ...inputGroupStyle(Boolean(formik.touched.password && formik.errors.password)),
                                        borderLeft: 'none',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {passwordVisible ? <FiEyeOff size={16} /> : <FiEye size={16} />}
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
                            }}>
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                                    Creating Account...
                                </>
                            ) : (
                                <>Initialize Access <FiArrowRight size={16} /></>
                            )}
                        </Button>
                    </Form>

                    {/* Login link */}
                    <div style={{ textAlign: 'center', marginTop: 24 }}>
                        <span style={{ color: '#6b7280', fontSize: 14 }}>{staticText.auth.alreadyAccountQuestion} </span>
                        <Link to="/login" style={{ color: PRIMARY, fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>
                            Log In →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
