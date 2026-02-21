import React, { useState, useEffect } from 'react';
import {
    Container, Card, Table, Button, Badge, Form,
    Row, Col, Alert, Modal
} from 'react-bootstrap';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { fetchVehicles, selectAllVehicles } from '../store/slices/vehicleSlice';
import type { Vehicle } from '../store/slices/vehicleSlice';
import { createTrip, fetchTrips, completeTrip, cancelTrip, selectAllTrips } from '../store/slices/tripSlice';
import type { Trip } from '../store/slices/tripSlice';
import {
    FiSend, FiAlertCircle, FiCheckCircle, FiXCircle,
    FiUser
} from 'react-icons/fi';
import APICallService from '../api/apiCallService';
import { DRIVERS } from '../api/apiEndPoints';

interface DriverProfile {
    _id?: string;
    id: number;
    name: string;
    driverStatus: string;
    licenseExpiry: string;
    licenseCategory: string[];
}

const PRIMARY = '#F26B8A';

const TripDispatcher: React.FC = () => {
    const dispatch: any = useAppDispatch();
    const vehicles = useAppSelector(selectAllVehicles);
    const trips = useAppSelector(selectAllTrips);

    const [drivers, setDrivers] = useState<DriverProfile[]>([]);
    const [search] = useState('');
    const [filterStatus] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Completion Odometer Modal
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [finishingTrip, setFinishingTrip] = useState<Trip | null>(null);
    const [finalOdo, setFinalOdo] = useState<number>(0);

    const [formData, setFormData] = useState<{
        vehicleId: string; driverId: string; cargoWeight: number;
        startLocation: string; endLocation: string; estimatedFuelCost: number;
    }>({
        vehicleId: '', driverId: '', cargoWeight: 0,
        startLocation: '', endLocation: '', estimatedFuelCost: 0,
    });

    useEffect(() => {
        dispatch(fetchVehicles());
        dispatch(fetchTrips());
        fetchDriversData();
    }, [dispatch]);

    const fetchDriversData = async () => {
        try {
            const data = await new APICallService(DRIVERS).callAPI();
            setDrivers(Array.isArray(data) ? data : []);
        } catch { /* silent */ }
    };

    const availableVehicles = vehicles.filter((v: Vehicle) => v.status === 'Available');
    const selectedVehicle = vehicles.find((v: Vehicle) =>
        String(v._id || v.id) === formData.vehicleId
    );

    // Only Off Duty drivers can be assigned
    const availableDrivers = drivers.filter(d => {
        if (d.driverStatus !== 'Off Duty') return false;
        if (selectedVehicle && d.licenseCategory) {
            return d.licenseCategory.includes(selectedVehicle.vehicleType ?? '');
        }
        return true;
    });

    const filteredTrips = trips
        .filter((t: Trip) => {
            const q = search.toLowerCase();
            return (
                !search ||
                (t.startLocation || '').toLowerCase().includes(q) ||
                (t.endLocation || '').toLowerCase().includes(q)
            );
        })
        .filter(t => !filterStatus || t.status === filterStatus);

    const handleCreateTrip = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (selectedVehicle && formData.cargoWeight > selectedVehicle.maxLoadCapacity) {
            setError(`Cargo (${formData.cargoWeight} kg) exceeds ${selectedVehicle.name}'s max capacity of ${selectedVehicle.maxLoadCapacity} kg`);
            return;
        }

        try {
            await dispatch(createTrip({
                vehicleId: formData.vehicleId,
                driverId: formData.driverId,
                cargoWeight: formData.cargoWeight,
                startLocation: formData.startLocation,
                endLocation: formData.endLocation,
                estimatedFuelCost: formData.estimatedFuelCost,
                status: 'Draft',
            })).unwrap();
            setFormData({ vehicleId: '', driverId: '', cargoWeight: 0, startLocation: '', endLocation: '', estimatedFuelCost: 0 });
            setShowForm(false);
            dispatch(fetchVehicles());
            dispatch(fetchTrips());
            fetchDriversData();
        } catch (err: any) {
            setError(err.message || 'Failed to dispatch trip');
        }
    };

    const handleComplete = (trip: Trip) => {
        const vId = typeof trip.vehicleId === 'object' ? (trip.vehicleId as any)?.id : trip.vehicleId;
        const v = vehicles.find(v => String(v.id || (v as any)._id) === String(vId));
        setFinalOdo(v?.odometer || 0);
        setFinishingTrip(trip);
        setShowCompleteModal(true);
    };

    const handleConfirmComplete = async () => {
        if (!finishingTrip) return;
        const tid = String(finishingTrip._id || finishingTrip.id);
        setActionLoading(tid);
        try {
            await dispatch(completeTrip({ id: tid, odometer: finalOdo })).unwrap();
            setShowCompleteModal(false);
            dispatch(fetchVehicles());
            fetchDriversData();
            dispatch(fetchTrips());
        } catch (err: any) {
            setError(err.message || 'Failed to complete trip');
        } finally { setActionLoading(null); }
    };

    const handleCancel = async (trip: Trip) => {
        const tid = String(trip._id || trip.id);
        setActionLoading(tid);
        try {
            await dispatch(cancelTrip(tid)).unwrap();
            dispatch(fetchVehicles());
            fetchDriversData();
            dispatch(fetchTrips());
        } catch (err: any) {
            setError(err.message || 'Failed to cancel trip');
        } finally { setActionLoading(null); }
    };

    const getTripDriver = (trip: Trip) => {
        if (typeof trip.driverId === 'object' && trip.driverId?.name)
            return trip.driverId.name;
        const dId = String(typeof trip.driverId === 'object' ? (trip.driverId?._id || trip.driverId?.id) : trip.driverId);
        const profile = drivers.find(d => String(d._id || d.id) === dId);
        return profile?.name || '—';
    };

    const getTripVehicle = (trip: Trip) => {
        if (typeof trip.vehicleId === 'object' && trip.vehicleId?.name)
            return trip.vehicleId.name;
        const vId = typeof trip.vehicleId === 'object' ? (trip.vehicleId as any)?._id || (trip.vehicleId as any)?.id : trip.vehicleId;
        const v = vehicles.find(v => String(v._id || v.id) === String(vId));
        return v?.name || '—';
    };

    const totalTrips = trips.length;
    const activeTrips = trips.filter(t => t.status === 'Dispatched').length;
    const completedTrips = trips.filter(t => t.status === 'Completed').length;
    const cancelledTrips = trips.filter(t => t.status === 'Cancelled').length;

    return (
        <Container fluid className="mt-4 px-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1" style={{ color: PRIMARY }}>Trip Dispatch &amp; Management</h2>
                    <p className="text-secondary small mb-0">Schedule, track and complete fleet trips</p>
                </div>
                <Button
                    className="rounded-3 px-4 shadow-sm border-0 fw-semibold"
                    style={{ background: PRIMARY, color: '#fff' }}
                    onClick={() => { setShowForm(!showForm); setError(null); }}
                >
                    <FiSend className="me-2" /> New Trip
                </Button>
            </div>

            {/* KPI strip */}
            <Row className="mb-4 g-3">
                {[
                    { label: 'Total Trips', value: totalTrips, color: '#6b7280' },
                    { label: 'Active', value: activeTrips, color: '#2563eb' },
                    { label: 'Completed', value: completedTrips, color: '#16a34a' },
                    { label: 'Cancelled', value: cancelledTrips, color: '#dc2626' },
                ].map(({ label, value, color }) => (
                    <Col xs={6} md={3} key={label}>
                        <Card className="border-0 shadow-sm rounded-4 text-center py-3">
                            <div className="fw-bold" style={{ fontSize: 28, color }}>{value}</div>
                            <div className="small text-secondary">{label}</div>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* New Trip Form */}
            {showForm && (
                <Card className="border-0 shadow rounded-4 mb-4" style={{ borderLeft: `4px solid ${PRIMARY}` }}>
                    <Card.Header className="bg-white border-0 pt-4 pb-0 px-4">
                        <div className="d-flex align-items-center gap-2">
                            <span className="fw-bold" style={{ color: PRIMARY }}>New Trip — Create &amp; Dispatch</span>
                        </div>
                    </Card.Header>
                    <Card.Body className="px-4 pb-4">
                        {error && <Alert variant="danger" className="rounded-3 border-0 py-2 mb-3"><FiAlertCircle className="me-2" /> {error}</Alert>}
                        <Form onSubmit={handleCreateTrip}>
                            <Row className="g-3">
                                <Col md={6}>
                                    <Form.Label className="fw-semibold text-secondary small">Vehicle *</Form.Label>
                                    <Form.Select className="rounded-3" value={formData.vehicleId} onChange={e => setFormData({ ...formData, vehicleId: e.target.value })} required>
                                        <option value="">Choose vehicle...</option>
                                        {availableVehicles.map(v => <option key={v.id} value={String(v.id)}>{v.name} ({v.licensePlate}) — {v.vehicleType}</option>)}
                                    </Form.Select>
                                </Col>
                                <Col md={6}>
                                    <Form.Label className="fw-semibold text-secondary small">Driver *</Form.Label>
                                    <Form.Select className="rounded-3" value={formData.driverId} onChange={e => setFormData({ ...formData, driverId: e.target.value })} required disabled={!formData.vehicleId}>
                                        <option value="">Choose driver...</option>
                                        {availableDrivers.map(d => <option key={d.id} value={String(d.id)}>{d.name} — [{d.licenseCategory.join(', ')}]</option>)}
                                    </Form.Select>
                                </Col>
                                <Col md={4}>
                                    <Form.Label className="fw-semibold text-secondary small">Cargo Weight (kg) *</Form.Label>
                                    <Form.Control type="number" value={formData.cargoWeight} onChange={e => setFormData({ ...formData, cargoWeight: parseInt(e.target.value) || 0 })} required />
                                </Col>
                                <Col md={4}>
                                    <Form.Label className="fw-semibold text-secondary small">Origin *</Form.Label>
                                    <Form.Control type="text" value={formData.startLocation} onChange={e => setFormData({ ...formData, startLocation: e.target.value })} required />
                                </Col>
                                <Col md={4}>
                                    <Form.Label className="fw-semibold text-secondary small">Destination *</Form.Label>
                                    <Form.Control type="text" value={formData.endLocation} onChange={e => setFormData({ ...formData, endLocation: e.target.value })} required />
                                </Col>
                                <Col xs={12} className="mt-3">
                                    <Button type="submit" style={{ background: PRIMARY, color: '#fff' }} className="rounded-3 px-4 border-0"><FiSend className="me-2" /> Confirm &amp; Dispatch</Button>
                                    <Button type="button" variant="light" className="rounded-3 px-4 ms-2" onClick={() => setShowForm(false)}>Cancel</Button>
                                </Col>
                            </Row>
                        </Form>
                    </Card.Body>
                </Card>
            )}

            {/* Trips Table */}
            <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                <Card.Body className="p-0">
                    <Table responsive hover className="mb-0 align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4 py-3 fw-semibold small" style={{ color: PRIMARY }}>#</th>
                                <th className="py-3 fw-semibold small" style={{ color: PRIMARY }}>Vehicle</th>
                                <th className="py-3 fw-semibold small" style={{ color: PRIMARY }}>Driver</th>
                                <th className="py-3 fw-semibold small" style={{ color: PRIMARY }}>Route</th>
                                <th className="py-3 fw-semibold small" style={{ color: PRIMARY }}>Cargo</th>
                                <th className="py-3 fw-semibold small" style={{ color: PRIMARY }}>Status</th>
                                <th className="py-3 pe-4 fw-semibold small" style={{ color: PRIMARY }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTrips.map((trip, idx) => {
                                const tid = String(trip._id || trip.id);
                                const busy = actionLoading === tid;
                                return (
                                    <tr key={tid}>
                                        <td className="ps-4 text-secondary">{idx + 1}</td>
                                        <td><div className="fw-semibold">{getTripVehicle(trip)}</div></td>
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 30, height: 30, background: '#f3f4f6' }}>
                                                    <FiUser size={13} className="text-secondary" />
                                                </div>
                                                <span className="fw-semibold small">{getTripDriver(trip)}</span>
                                            </div>
                                        </td>
                                        <td>{trip.startLocation} → {trip.endLocation}</td>
                                        <td>{trip.cargoWeight} kg</td>
                                        <td>
                                            <Badge bg={
                                                trip.status === 'Dispatched' ? 'primary' :
                                                    trip.status === 'Completed' ? 'success' :
                                                        trip.status === 'Cancelled' ? 'danger' :
                                                            'secondary'
                                            } className="rounded-pill px-3">
                                                {trip.status}
                                            </Badge>
                                        </td>
                                        <td className="pe-4">
                                            {trip.status === 'Dispatched' && (
                                                <div className="d-flex gap-2">
                                                    <Button size="sm" variant="success" className="rounded-pill px-3" onClick={() => handleComplete(trip)} disabled={busy}><FiCheckCircle className="me-1" /> Finish</Button>
                                                    <Button size="sm" variant="danger" className="rounded-pill px-3" onClick={() => handleCancel(trip)} disabled={busy}><FiXCircle className="me-1" /> Cancel</Button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Completion Odometer Modal */}
            <Modal show={showCompleteModal} onHide={() => setShowCompleteModal(false)} centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold">Complete Trip</Modal.Title>
                </Modal.Header>
                <Modal.Body className="px-4">
                    <p className="text-secondary small">Please enter the final odometer reading for the vehicle to mark this trip as completed.</p>
                    <Form.Group>
                        <Form.Label className="small fw-bold">Final Odometer Reading (km)</Form.Label>
                        <Form.Control
                            type="number"
                            value={finalOdo}
                            onChange={(e) => setFinalOdo(parseInt(e.target.value) || 0)}
                            className="rounded-3 bg-light border-0"
                            autoFocus
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="border-0 px-4 pb-4">
                    <Button variant="light" onClick={() => setShowCompleteModal(false)}>Cancel</Button>
                    <Button style={{ background: PRIMARY, color: '#fff' }} className="border-0 px-4 shadow-sm" onClick={handleConfirmComplete} disabled={!finalOdo}>
                        Complete Trip
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default TripDispatcher;
