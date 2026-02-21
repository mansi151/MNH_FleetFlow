import React, { useState, useEffect } from 'react';
import {
    Container, Card, Table, Button, Badge, Form,
    InputGroup, Modal, ProgressBar, Alert, Row, Col, Spinner
} from 'react-bootstrap';
import { FiSearch, FiUser, FiAlertTriangle, FiPlus, FiShield, FiClock, FiFileText } from 'react-icons/fi';
import APICallService from '../api/apiCallService';
import { DRIVERS, CREATE_DRIVER, UPDATE_DRIVER } from '../api/apiEndPoints';
import { error as showError, success as showSuccess } from '../utils/toast';

interface DriverProfile {
    _id?: string;
    id: number;
    name: string;
    licenseNumber?: string;
    licenseExpiry: string;
    safetyScore: number;
    driverStatus: 'On Duty' | 'Off Duty' | 'Suspended' | 'On Trip';
    licenseCategory: string[];
    completionRate: number;
    complaints: number;
}

const PRIMARY = '#F26B8A';

const DriverProfiles: React.FC = () => {
    const [drivers, setDrivers] = useState<DriverProfile[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState('');
    const [groupBy, setGroupBy] = useState('');
    const [sortBy, setSortBy] = useState('');

    // ── Add Driver form state ──────────────────────────────────────────────────
    const [name, setName] = useState('');
    const [licenseNumber, setLicenseNumber] = useState('');
    const [licenseExpiry, setLicenseExpiry] = useState('');
    const [licenseCategory, setLicenseCategory] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const fetchDrivers = async () => {
        setLoading(true);
        try {
            const data = await new APICallService(DRIVERS).callAPI();
            setDrivers(Array.isArray(data) ? data : []);
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchDrivers(); }, []);

    const isExpired = (d: string) => new Date(d) < new Date();
    const isNearExpiry = (d: string) => {
        const ms = new Date(d).getTime() - Date.now();
        return ms >= 0 && ms <= 30 * 24 * 60 * 60 * 1000;
    };

    const handleCreate = async () => {
        if (!name.trim()) { showError('Driver name is required'); return; }
        if (!licenseExpiry) { showError('License expiry is required'); return; }
        if (licenseCategory.length === 0) { showError('Select at least one license category'); return; }

        setSubmitting(true);
        try {
            await new APICallService(CREATE_DRIVER, {
                name: name.trim(),
                licenseNumber: licenseNumber.trim() || undefined,
                licenseExpiry,
                licenseCategory,
                driverStatus: 'Off Duty',
            }).callAPI();
            showSuccess('Driver profile created successfully');
            resetModal();
            fetchDrivers();
        } catch (e: any) {
            showError(e?.message || 'Failed to create driver profile');
        } finally { setSubmitting(false); }
    };

    const resetModal = () => {
        setShowModal(false);
        setName('');
        setLicenseNumber('');
        setLicenseExpiry('');
        setLicenseCategory([]);
    };



    const getSafetyVariant = (s: number) => s >= 80 ? 'success' : s >= 50 ? 'warning' : 'danger';

    const getStatusBadge = (driver: DriverProfile) => {
        if (isExpired(driver.licenseExpiry))
            return <Badge bg="danger" className="rounded-pill px-2">Expired</Badge>;
        const map: Record<string, string> = {
            'On Duty': 'success', 'Off Duty': 'secondary', Suspended: 'danger', 'On Trip': 'primary'
        };
        return (
            <Badge bg={map[driver.driverStatus] || 'secondary'} className="rounded-pill px-2">
                {driver.driverStatus}
            </Badge>
        );
    };

    // ── Filter / sort ──────────────────────────────────────────────────────────
    let filtered = drivers.filter(d => {
        const q = search.toLowerCase();
        return !q ||
            (d.name || '').toLowerCase().includes(q) ||
            (d.licenseNumber || '').toLowerCase().includes(q);
    });

    if (sortBy === 'safety') filtered = [...filtered].sort((a, b) => b.safetyScore - a.safetyScore);
    if (sortBy === 'expiry') filtered = [...filtered].sort((a, b) => new Date(a.licenseExpiry).getTime() - new Date(b.licenseExpiry).getTime());
    if (sortBy === 'name') filtered = [...filtered].sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    const expiredCount = drivers.filter(d => isExpired(d.licenseExpiry)).length;
    const nearCount = drivers.filter(d => !isExpired(d.licenseExpiry) && isNearExpiry(d.licenseExpiry)).length;
    const activeCount = drivers.filter(d => d.driverStatus === 'On Duty' || d.driverStatus === 'On Trip').length;

    return (
        <Container fluid className="mt-4 px-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1" style={{ color: PRIMARY }}>Driver Performance &amp; Safety Profiles</h2>
                    <p className="text-secondary small mb-0">Monitor license compliance, safety scores &amp; trip completion</p>
                </div>
                <Button
                    className="rounded-3 px-4 shadow-sm border-0 fw-semibold"
                    style={{ background: PRIMARY, color: '#fff' }}
                    onClick={() => setShowModal(true)}
                >
                    <FiPlus className="me-2" /> Add Driver
                </Button>
            </div>

            {/* KPI cards */}
            <Row className="mb-4 g-3">
                {[
                    { label: 'Active Drivers', value: activeCount, icon: <FiUser size={20} />, accent: '#16a34a', bg: '#f0fdf4', textColor: '#15803d' },
                    { label: 'Expiring <30 days', value: nearCount, icon: <FiClock size={20} />, accent: '#d97706', bg: '#fffbeb', textColor: '#b45309' },
                    { label: 'Expired Licenses', value: expiredCount, icon: <FiAlertTriangle size={20} />, accent: '#dc2626', bg: '#fff1f2', textColor: '#b91c1c' },
                ].map(({ label, value, icon, accent, bg, textColor }) => (
                    <Col md={4} key={label}>
                        <Card className="border-0 shadow-sm rounded-4 h-100" style={{ background: bg }}>
                            <Card.Body className="d-flex align-items-center p-4" style={{ borderLeft: `4px solid ${accent}`, borderRadius: 16 }}>
                                <div className="rounded-circle p-3 me-3 d-flex align-items-center justify-content-center"
                                    style={{ background: accent + '1a', color: accent, flexShrink: 0, width: 50, height: 50 }}>
                                    {icon}
                                </div>
                                <div>
                                    <div className="small fw-semibold mb-1" style={{ color: textColor, opacity: 0.8 }}>{label}</div>
                                    <h3 className="fw-bold mb-0" style={{ color: textColor }}>{value}</h3>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {expiredCount > 0 && (
                <Alert variant="danger" className="rounded-4 border-0 shadow-sm mb-3">
                    <FiAlertTriangle className="me-2" />
                    <strong>{expiredCount} driver(s)</strong> have expired licenses and are blocked from dispatch.
                </Alert>
            )}

            {/* Toolbar */}
            <Card className="border-0 shadow-sm rounded-4 mb-3">
                <Card.Body className="py-3 px-4">
                    <div className="d-flex gap-3 align-items-center flex-wrap">
                        <div className="d-flex gap-2">
                            {['All', 'On Duty', 'Off Duty', 'On Trip', 'Suspended'].map(s => (
                                <Button key={s} size="sm"
                                    variant={groupBy === s || (s === 'All' && !groupBy) ? 'dark' : 'outline-secondary'}
                                    className="rounded-pill px-3"
                                    onClick={() => setGroupBy(s === 'All' ? '' : s)}>
                                    {s}
                                </Button>
                            ))}
                        </div>
                        <InputGroup style={{ maxWidth: 280 }}>
                            <InputGroup.Text className="bg-light border-0 text-secondary"><FiSearch /></InputGroup.Text>
                            <Form.Control className="bg-light border-0 shadow-none"
                                placeholder="Search driver name or license..."
                                value={search} onChange={e => setSearch(e.target.value)} />
                        </InputGroup>
                        <div className="d-flex gap-2 ms-auto">
                            <Form.Select size="sm" className="rounded-3 border border-secondary-subtle bg-light" style={{ width: 130 }}
                                value={sortBy} onChange={e => setSortBy(e.target.value)}>
                                <option value="">Sort by...</option>
                                <option value="name">Name</option>
                                <option value="safety">Safety Score</option>
                                <option value="expiry">Expiry Date</option>
                            </Form.Select>
                        </div>
                    </div>
                </Card.Body>
            </Card>

            {/* Table */}
            <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                <Card.Body className="p-0">
                    <Table responsive hover className="mb-0 align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4 py-3 fw-semibold small" style={{ color: PRIMARY }}>Driver</th>
                                <th className="py-3 fw-semibold small" style={{ color: PRIMARY }}>License Categories</th>
                                <th className="py-3 fw-semibold small" style={{ color: PRIMARY }}>Expiry</th>
                                <th className="py-3 fw-semibold small" style={{ color: PRIMARY }}>Completion Rate</th>
                                <th className="py-3 fw-semibold small" style={{ color: PRIMARY }}>Safety Score</th>
                                <th className="py-3 fw-semibold small" style={{ color: PRIMARY }}>Complaints</th>
                                <th className="py-3 pe-4 fw-semibold small" style={{ color: PRIMARY }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered
                                .filter(d => !groupBy || d.driverStatus === groupBy)
                                .map(driver => {
                                    const expired = isExpired(driver.licenseExpiry);
                                    const expNear = isNearExpiry(driver.licenseExpiry);
                                    const expDate = new Date(driver.licenseExpiry);
                                    const expStr = expDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });
                                    const completion = driver.completionRate ?? 100;
                                    const complaints = driver.complaints ?? 0;
                                    return (
                                        <tr key={driver.id} className={expired ? 'table-danger' : ''}>
                                            <td className="ps-4">
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="rounded-circle d-flex align-items-center justify-content-center"
                                                        style={{ width: 34, height: 34, background: PRIMARY + '20', flexShrink: 0 }}>
                                                        <FiUser style={{ color: PRIMARY }} size={14} />
                                                    </div>
                                                    <div>
                                                        <div className="fw-semibold">{driver.name || 'N/A'}</div>
                                                        <div className="small text-secondary">{driver.licenseNumber || 'No License #'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex gap-1 flex-wrap">
                                                    {(driver.licenseCategory || []).map(cat => (
                                                        <Badge key={cat} bg="light" text="dark" className="rounded-pill border small px-2">{cat}</Badge>
                                                    ))}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`fw-semibold small ${expired ? 'text-danger' : expNear ? 'text-warning' : ''}`}>
                                                    {expired && <FiAlertTriangle className="me-1" />}
                                                    {expStr}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <ProgressBar now={completion} variant="success" style={{ width: 60, height: 5 }} className="rounded-pill flex-grow-0" />
                                                    <span className="small fw-bold">{completion}%</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <ProgressBar now={driver.safetyScore} variant={getSafetyVariant(driver.safetyScore)} style={{ width: 60, height: 5 }} className="rounded-pill flex-grow-0" />
                                                    <span className="small fw-bold">{driver.safetyScore}%</span>
                                                </div>
                                            </td>
                                            <td>
                                                <Badge bg={complaints > 4 ? 'danger' : complaints > 1 ? 'warning' : 'success'}
                                                    text={complaints <= 4 && complaints > 1 ? 'dark' : undefined}
                                                    className="rounded-pill px-2">
                                                    {complaints}
                                                </Badge>
                                            </td>
                                            <td className="pe-4">{getStatusBadge(driver)}</td>
                                        </tr>
                                    );
                                })}
                            {filtered.filter(d => !groupBy || d.driverStatus === groupBy).length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-5 text-secondary">
                                        {loading ? <Spinner animation="border" size="sm" /> : 'No driver profiles found.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* ── Add Driver Modal ──────────────────────────────────────────────── */}
            <Modal show={showModal} onHide={resetModal} centered>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold d-flex align-items-center gap-2">
                        <FiShield style={{ color: PRIMARY }} /> Register Driver Profile
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="px-4 pt-3">
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-secondary">Driver Full Name *</Form.Label>
                        <InputGroup>
                            <InputGroup.Text style={{ background: '#fde8ed', border: '1px solid #f1c1cc', color: PRIMARY }}>
                                <FiUser size={13} />
                            </InputGroup.Text>
                            <Form.Control
                                type="text"
                                className="rounded-3"
                                placeholder="Enter driver's full name"
                                style={{ borderLeft: 'none' }}
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                            />
                        </InputGroup>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-secondary">License Number</Form.Label>
                        <InputGroup>
                            <InputGroup.Text style={{ background: '#fde8ed', border: '1px solid #f1c1cc', color: PRIMARY }}>
                                <FiFileText size={13} />
                            </InputGroup.Text>
                            <Form.Control
                                type="text"
                                className="rounded-3"
                                placeholder="Enter license number"
                                style={{ borderLeft: 'none' }}
                                value={licenseNumber}
                                onChange={e => setLicenseNumber(e.target.value)}
                            />
                        </InputGroup>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-secondary">License Expiry Date *</Form.Label>
                        <Form.Control
                            type="date"
                            className="rounded-3 bg-light border-0"
                            value={licenseExpiry}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={e => setLicenseExpiry(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label className="small fw-bold text-secondary">License Categories *</Form.Label>
                        <div className="d-flex gap-3">
                            {['Van', 'Truck', 'Bike'].map(cat => (
                                <Form.Check key={cat} type="checkbox" label={cat} id={`cat-${cat}`}
                                    checked={licenseCategory.includes(cat)}
                                    onChange={e => {
                                        const cats = e.target.checked
                                            ? [...licenseCategory, cat]
                                            : licenseCategory.filter(c => c !== cat);
                                        setLicenseCategory(cats);
                                    }}
                                />
                            ))}
                        </div>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0 mt-3">
                    <Button variant="light" className="rounded-3" onClick={resetModal}>Cancel</Button>
                    <Button
                        className="rounded-3 px-4 shadow-sm border-0"
                        style={{ background: PRIMARY, color: '#fff' }}
                        onClick={handleCreate}
                        disabled={!name || !licenseExpiry || licenseCategory.length === 0 || submitting}
                    >
                        {submitting ? <><Spinner size="sm" animation="border" className="me-2" />Creating...</> : 'Create Profile'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default DriverProfiles;
