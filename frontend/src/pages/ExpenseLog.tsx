import React, { useState, useEffect } from 'react';
import {
    Container, Card, Table, Button, Badge, Form,
    InputGroup, Modal, Row, Col
} from 'react-bootstrap';
import { FiSearch, FiPlusCircle, FiDownload } from 'react-icons/fi';
import APICallService from '../api/apiCallService';
import { EXPENSES, LOG_EXPENSE, TRIPS } from '../api/apiEndPoints';

interface TripExpense {
    id: string;
    tripId: {
        id: string; startLocation: string; endLocation: string; cargoWeight?: number;
        startOdometer?: any;
        endOdometer?: any
    } | any;
    vehicleId: { id: string; name: string; licensePlate: string } | string | null;
    driverName?: string;
    distance?: number;
    expenseType: 'Fuel' | 'Maintenance' | 'Toll' | 'Other';
    amount: number;
    miscAmount?: number;
    liters?: number;
    date: string;
    status: 'Done' | 'Pending' | 'Cancelled';
}

interface TripOption {
    id: string;
    startLocation: string;
    endLocation: string;
    driver?: { name: string };
    vehicleId?: string;
}

const ExpenseLog: React.FC = () => {
    const [expenses, setExpenses] = useState<TripExpense[]>([]);
    const [trips, setTrips] = useState<TripOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState('');

    const [formData, setFormData] = useState({
        vehicleId: '',
        tripId: '',
        expenseType: 'Fuel',
        amount: '',
        miscAmount: '',
        distance: '',
        driverName: '',
        liters: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Done',
    });

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const api = new APICallService(EXPENSES);
            const data = await api.callAPI();
            setExpenses(Array.isArray(data) ? data : []);
        } finally { setLoading(false); }
    };

    const fetchOptions = async () => {
        try {
            const tData = await new APICallService(TRIPS).callAPI();
            setTrips(Array.isArray(tData) ? tData : []);
        } catch { /* silent */ }
    };

    useEffect(() => {
        fetchExpenses();
        fetchOptions();
    }, []);

    const handleLogExpense = async () => {
        const payload: any = {
            vehicleId: formData.vehicleId || undefined,
            tripId: formData.tripId || undefined,
            expenseType: formData.expenseType,
            amount: parseFloat(formData.amount),
            miscAmount: formData.miscAmount ? parseFloat(formData.miscAmount) : undefined,
            distance: formData.distance ? parseFloat(formData.distance) : undefined,
            driverName: formData.driverName || undefined,
            liters: formData.liters ? parseFloat(formData.liters) : undefined,
            date: formData.date,
            status: formData.status,
        };
        try {
            await new APICallService(LOG_EXPENSE, payload).callAPI();
            setShowModal(false);
            setFormData({ vehicleId: '', tripId: '', expenseType: 'Fuel', amount: '', miscAmount: '', distance: '', driverName: '', liters: '', date: new Date().toISOString().split('T')[0], status: 'Done' });
            fetchExpenses();
        } catch { /* toast handled */ }
    };

    // KPIs
    const totalFuelCost = expenses.filter(e => e.expenseType === 'Fuel').reduce((s, e) => s + e.amount, 0);
    const totalMiscCost = expenses.reduce((s, e) => s + (e.miscAmount || 0), 0);
    const totalCost = expenses.reduce((s, e) => s + e.amount, 0);

    // Filter & search
    const filtered = expenses
        .filter(e => {
            const q = search.toLowerCase();
            if (!q) return true;
            const trip = e.tripId;
            const tripStr = trip ? `${trip.startLocation} ${trip.endLocation}` : '';
            const driver = (e.driverName || '').toLowerCase();
            return tripStr.toLowerCase().includes(q) || driver.includes(q);
        });

    const getStatusBadge = (status: string) => {
        const map: Record<string, string> = { Done: 'success', Pending: 'warning', Cancelled: 'danger' };
        return (
            <Badge bg={map[status] || 'secondary'} text={status === 'Pending' ? 'dark' : undefined} className="rounded-pill px-3">
                {status}
            </Badge>
        );
    };

    const exportCSV = () => {
        const headers = 'Trip ID,Driver,Distance,Fuel Expense,Misc Expense,Status\n';
        const rows = filtered.map(e => {
            const tripId = e.tripId?.id?.slice(-5).toUpperCase() || '—';
            return `${tripId},${e.driverName || '—'},${e.distance || 0} km,${e.amount},${e.miscAmount || 0},${e.status}`;
        }).join('\n');
        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'expenses.csv'; a.click();
    };

    return (
        <Container fluid className="mt-4 px-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1" style={{ color: '#F26B8A' }}>Expense &amp; Fuel Logging</h2>
                    <p className="text-secondary small mb-0">Track per-trip costs, fuel spend &amp; misc. expenses</p>
                </div>
                <div className="d-flex gap-2">
                    <Button variant="light" className="rounded-3 shadow-sm" onClick={exportCSV}>
                        <FiDownload className="me-2" /> Export CSV
                    </Button>
                </div>
            </div>

            {/* KPI row */}
            <Row className="mb-4 g-3">
                {[
                    { label: 'Total Fuel Cost', value: `₹${totalFuelCost.toLocaleString()}`, color: 'warning' },
                    { label: 'Total Misc Expenses', value: `₹${totalMiscCost.toLocaleString()}`, color: 'primary' },
                    { label: 'Total Operational', value: `₹${totalCost.toLocaleString()}`, color: 'success' },
                    { label: 'Total Entries', value: expenses.length.toString(), color: 'secondary' },
                ].map(({ label, value, color }) => (
                    <Col sm={6} lg={3} key={label}>
                        <Card className="border-0 shadow-sm rounded-4 h-100">
                            <Card.Body className="p-4">
                                <div className={`text-${color} small fw-semibold mb-1`}>{label}</div>
                                <h4 className="fw-bold mb-0">{value}</h4>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* ── Toolbar ── */}
            <Card className="border-0 shadow-sm rounded-4 mb-3">
                <Card.Body className="py-3 px-4">
                    <div className="d-flex gap-3 align-items-center flex-wrap">
                        <InputGroup style={{ maxWidth: 340 }}>
                            <InputGroup.Text className="bg-light border-0 text-secondary">
                                <FiSearch />
                            </InputGroup.Text>
                            <Form.Control
                                className="bg-light border-0 shadow-none"
                                placeholder="Search by route or driver..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </InputGroup>

                        <div className="d-flex gap-2 ms-auto align-items-center">
                            <Button
                                variant="outline-primary"
                                className="rounded-3 px-4 fw-semibold shadow-sm"
                                onClick={() => setShowModal(true)}
                                style={{ borderColor: '#F26B8A', color: '#F26B8A' }}
                            >
                                <FiPlusCircle className="me-2" /> Log New Expense
                            </Button>
                        </div>
                    </div>
                </Card.Body>
            </Card>

            {/* ── Table ── */}
            <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                <Card.Body className="p-0">
                    <Table responsive hover className="mb-0 align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4 py-3 text-danger fw-semibold small">Trip ID</th>
                                <th className="py-3 text-danger fw-semibold small">Driver</th>
                                <th className="py-3 text-danger fw-semibold small">Distance</th>
                                <th className="py-3 text-danger fw-semibold small">Fuel Expense</th>
                                <th className="py-3 text-danger fw-semibold small">Misc. Expen.</th>
                                <th className="py-3 pe-4 text-danger fw-semibold small">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(exp => {
                                return (
                                    <tr key={exp.id}>
                                        <td className="ps-4 fw-semibold text-secondary">{exp.id}</td>
                                        <td className="fw-semibold">{exp.driverName || '—'}</td>
                                        <td className="text-secondary">{exp.tripId.startOdometer || exp.tripId.endOdometer ? `${exp.tripId.startOdometer || exp.tripId.endOdometer} km` : '—'}</td>
                                        <td className="fw-semibold text-warning">₹{exp.amount.toLocaleString()}</td>
                                        <td className="text-secondary">
                                            {exp.miscAmount ? `₹${exp.miscAmount.toLocaleString()}` : '—'}
                                        </td>
                                        <td className="pe-4">{getStatusBadge(exp.status || 'Done')}</td>
                                    </tr>
                                );
                            })}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-5 text-secondary">
                                        {loading ? 'Loading expenses...' : 'No expense records found.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* ── Log Expense Modal ── */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold">New Expense</Modal.Title>
                </Modal.Header>
                <Modal.Body className="px-4">
                    <Row className="g-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-secondary">Trip ID:</Form.Label>
                                <Form.Select
                                    className="rounded-3 bg-light border-0"
                                    value={formData.tripId}
                                    onChange={e => {
                                        const tid = e.target.value;
                                        const selectedTrip = trips.find(t => String(t.id) === tid);
                                        setFormData({
                                            ...formData,
                                            tripId: tid,
                                            driverName: (selectedTrip as any)?.driver?.name || (selectedTrip as any)?.driverName || '',
                                            vehicleId: (selectedTrip as any)?.vehicleId?.id || (selectedTrip as any)?.vehicleId || ''
                                        });
                                        console.log("selectedTripselectedTrip", e.target.value)
                                    }}
                                >
                                    <option value="">Select trip ID...</option>
                                    {trips.map(t => (
                                        <option key={t.id} value={t.id}>
                                            {t.startLocation} → {t.endLocation}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-secondary">Driver:</Form.Label>
                                <Form.Control
                                    className="rounded-3 bg-light border-0"
                                    placeholder="Driver name"
                                    value={formData.driverName}
                                    onChange={e => setFormData({ ...formData, driverName: e.target.value })}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-secondary">Fuel Cost (₹):</Form.Label>
                                <Form.Control
                                    type="number"
                                    className="rounded-3 bg-light border-0"
                                    placeholder="e.g. 19000"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-secondary">Fuel Quantity (Liters):</Form.Label>
                                <Form.Control
                                    type="number"
                                    className="rounded-3 bg-light border-0"
                                    placeholder="e.g. 150"
                                    value={formData.liters}
                                    onChange={e => setFormData({ ...formData, liters: e.target.value })}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={12}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-secondary">Misc Expense (₹):</Form.Label>
                                <Form.Control
                                    type="number"
                                    className="rounded-3 bg-light border-0"
                                    placeholder="e.g. 3000"
                                    value={formData.miscAmount}
                                    onChange={e => setFormData({ ...formData, miscAmount: e.target.value })}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="light" className="rounded-3 px-4" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" className="rounded-3 px-4 shadow-sm" onClick={handleLogExpense} disabled={!formData.amount}>
                        Create
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ExpenseLog;
