import React, { useState, useEffect } from 'react';
import {
    Container, Card, Table, Button, Badge, Form,
    InputGroup, Modal, Alert
} from 'react-bootstrap';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { fetchVehicles, selectAllVehicles } from '../store/slices/vehicleSlice';
import type { Vehicle } from '../store/slices/vehicleSlice';
import APICallService from '../api/apiCallService';
import { MAINTENANCE, LOG_MAINTENANCE } from '../api/apiEndPoints';
import { FiSearch, FiTool, FiAlertCircle } from 'react-icons/fi';

interface MaintenanceLog {
    id: string;
    vehicleId: { _id: string; name: string; licensePlate: string };
    description: string;
    serviceDate: string;
    cost: number;
    status: string;
}

const MaintenanceLogs: React.FC = () => {
    const dispatch: any = useAppDispatch();
    const vehicles = useAppSelector(selectAllVehicles);
    const [logs, setLogs] = useState<MaintenanceLog[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [formData, setFormData] = useState({ vehicleId: '', description: '', cost: 0 });

    const fetchLogs = async () => {
        try {
            const api = new APICallService(MAINTENANCE);
            const data = await api.callAPI();
            setLogs(Array.isArray(data) ? data : []);
        } catch { /* silent */ }
    };

    useEffect(() => {
        dispatch(fetchVehicles());
        fetchLogs();
    }, [dispatch]);

    const handleLogService = async () => {
        try {
            const api = new APICallService(LOG_MAINTENANCE, formData);
            await api.callAPI();
            setShowModal(false);
            setFormData({ vehicleId: '', description: '', cost: 0 });
            fetchLogs();
            dispatch(fetchVehicles());
        } catch { /* toast handled */ }
    };

    const filteredLogs = logs
        .filter(l => {
            const q = search.toLowerCase();
            return !search ||
                (l.vehicleId?.name || '').toLowerCase().includes(q) ||
                (l.description || '').toLowerCase().includes(q);
        })
        .filter(l => !filterStatus || l.status === filterStatus);

    const getStatusBadge = (status: string) => {
        const map: Record<string, { bg: string; label: string }> = {
            New: { bg: 'warning', label: 'New' },
            'In Progress': { bg: 'primary', label: 'In Progress' },
            Completed: { bg: 'success', label: 'Completed' },
        };
        const c = map[status] || { bg: 'secondary', label: status };
        return <Badge bg={c.bg} text={c.bg === 'warning' ? 'dark' : undefined} className="rounded-pill px-3">{c.label}</Badge>;
    };


    return (
        <Container fluid className="mt-4 px-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1" style={{ color: '#F26B8A' }}>Maintenance &amp; Service Logs</h2>
                    <p className="text-secondary small mb-0">Track vehicle service issues, costs &amp; repair status</p>
                </div>
            </div>

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
                                placeholder="Search bar ......"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </InputGroup>

                        <div className="d-flex gap-2 ms-auto align-items-center">
                            {/* <Form.Select
                                size="sm"
                                className="rounded-3 border border-secondary-subtle bg-light"
                                style={{ width: 130 }}
                                value={sortField}
                                onChange={e => setSortField(e.target.value)}
                            >
                                <option value="">Group by</option>
                                <option value="vehicle">Vehicle</option>
                                <option value="status">Status</option>
                            </Form.Select> */}

                            <Form.Select
                                size="sm"
                                className="rounded-3 border border-secondary-subtle bg-light"
                                style={{ width: 130 }}
                                value={filterStatus}
                                onChange={e => setFilterStatus(e.target.value)}
                            >
                                <option value="">Filter</option>
                                <option value="New">New</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </Form.Select>

                            {/* <Button
                                size="sm"
                                variant="outline-secondary"
                                className="rounded-3 px-3 d-flex align-items-center gap-1"
                                onClick={() => { setSortField(''); setFilterStatus(''); setSearch(''); }}
                            >
                                Sort by <FiChevronDown />
                            </Button> */}

                            <Button
                                variant="outline-primary"
                                className="rounded-3 px-4 fw-semibold ms-2"
                                onClick={() => setShowModal(true)}
                            >
                                <FiTool className="me-2" /> Create New Service
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
                                <th className="ps-4 py-3 text-danger fw-semibold small">Log ID</th>
                                <th className="py-3 text-danger fw-semibold small">Vehicle</th>
                                <th className="py-3 text-danger fw-semibold small">Issue / Service</th>
                                <th className="py-3 text-danger fw-semibold small">Date</th>
                                <th className="py-3 text-danger fw-semibold small">Cost</th>
                                <th className="py-3 pe-4 text-danger fw-semibold small">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map(log => (
                                <tr key={log.id}>
                                    <td className="ps-4 text-primary fw-semibold">{log.id}</td>
                                    <td className="text-primary fw-semibold">{log.vehicleId?.name || '—'}</td>
                                    <td className="text-primary">{log.description || '—'}</td>
                                    <td className="text-secondary small">
                                        {log.serviceDate ? new Date(log.serviceDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit' }) : '—'}
                                    </td>
                                    <td className="fw-semibold">₹{(log.cost || 0).toLocaleString()}</td>
                                    <td className="pe-4">{getStatusBadge(log.status || 'New')}</td>
                                </tr>
                            ))}
                            {filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-5 text-secondary">
                                        No maintenance records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* ── Create Service Modal ── */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold">
                        <FiTool className="me-2 text-danger" />New Service Entry
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="px-4">
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-secondary">Select Vehicle</Form.Label>
                        <Form.Select
                            className="rounded-3 bg-light border-0"
                            value={formData.vehicleId}
                            onChange={e => setFormData({ ...formData, vehicleId: e.target.value })}
                        >
                            <option value="">Select vehicle...</option>
                            {vehicles.filter((v: Vehicle) => v.status !== 'In Shop').map((v: Vehicle) => (
                                <option key={v.id || (v as any)._id} value={String(v.id || (v as any)._id)}>{v.name} ({v.licensePlate})</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-secondary">Issue / Service Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            className="rounded-3 bg-light border-0"
                            placeholder="e.g. Engine Issue, Oil Change, Brake pad replacement..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-secondary">Estimated Cost (₹)</Form.Label>
                        <Form.Control
                            type="number"
                            className="rounded-3 bg-light border-0"
                            placeholder="e.g. 10000"
                            value={formData.cost || ''}
                            onChange={e => setFormData({ ...formData, cost: parseInt(e.target.value) || 0 })}
                        />
                    </Form.Group>
                    <Alert variant="warning" className="small border-0 rounded-3">
                        <FiAlertCircle className="me-2" />
                        This will mark the vehicle as <strong>In Shop</strong> immediately.
                    </Alert>
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="light" className="rounded-3" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button
                        variant="danger"
                        className="rounded-3 px-4 shadow-sm"
                        onClick={handleLogService}
                        disabled={!formData.vehicleId || !formData.description}
                    >
                        Initialize Maintenance
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default MaintenanceLogs;
