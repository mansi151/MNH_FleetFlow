import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Modal, Form, Badge, Row, Col, InputGroup } from 'react-bootstrap';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { fetchVehicles, addVehicle, selectAllVehicles, selectVehiclesLoading } from '../store/slices/vehicleSlice';
import type { Vehicle } from '../store/slices/vehicleSlice';
import { FiPlus, FiDownload, FiTruck, FiEdit2, FiSearch } from 'react-icons/fi';
import APICallService from '../api/apiCallService';
import { UPDATE_VEHICLE } from '../api/apiEndPoints';

type FilterType = 'All' | 'Truck' | 'Van' | 'Bike';

const EMPTY_FORM: Partial<Vehicle> = {
    name: '', model: '', licensePlate: '',
    maxLoadCapacity: 0, vehicleType: 'Van', status: 'Available'
};

const VehicleRegistry: React.FC = () => {
    const dispatch: any = useAppDispatch();
    const vehicles = useAppSelector(selectAllVehicles);
    const loading = useAppSelector(selectVehiclesLoading);

    // ── modal state ──────────────────────────────────────────────────────────
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);          // true = editing existing
    const [editId, setEditId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<Partial<Vehicle>>(EMPTY_FORM);

    // ── filter / search state ─────────────────────────────────────────────────
    const [filter, setFilter] = useState<FilterType>('All');
    const [search, setSearch] = useState('');

    useEffect(() => { dispatch(fetchVehicles()); }, [dispatch]);

    // ── derived list ──────────────────────────────────────────────────────────
    const displayed = vehicles.filter((v: Vehicle) => {
        const matchType = filter === 'All' || v.vehicleType === filter;
        const q = search.toLowerCase();
        const matchSearch = !q ||
            v.name.toLowerCase().includes(q) ||
            v.licensePlate.toLowerCase().includes(q) ||
            v.model.toLowerCase().includes(q);
        return matchType && matchSearch;
    });

    // ── open add modal ────────────────────────────────────────────────────────
    const openAdd = () => {
        setEditMode(false);
        setEditId(null);
        setFormData(EMPTY_FORM);
        setShowModal(true);
    };

    // ── open edit modal ───────────────────────────────────────────────────────
    const openEdit = (v: Vehicle) => {
        setEditMode(true);
        setEditId(String(v.id || (v as any)._id));
        setFormData({
            name: v.name,
            model: v.model,
            licensePlate: v.licensePlate,
            maxLoadCapacity: v.maxLoadCapacity,
            vehicleType: v.vehicleType,
            status: v.status,
            odometer: v.odometer
        });
        setShowModal(true);
    };

    // ── save (create or update) ───────────────────────────────────────────────
    const handleSave = async () => {
        setSaving(true);
        try {
            if (editMode && editId) {
                await new APICallService(UPDATE_VEHICLE, formData, { id: editId }).callAPI();
                dispatch(fetchVehicles());          // refresh list
            } else {
                await dispatch(addVehicle(formData));
            }
            setShowModal(false);
            setFormData(EMPTY_FORM);
        } finally {
            setSaving(false);
        }
    };

    // ── export CSV ────────────────────────────────────────────────────────────
    const exportCSV = () => {
        const header = 'Name,License Plate,Model,Type,Capacity (kg),Odometer (km),Status\n';
        const rows = vehicles.map(v =>
            `${v.name},${v.licensePlate},${v.model},${v.vehicleType},${v.maxLoadCapacity},${v.odometer},${v.status}`
        ).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'vehicle_registry.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    // ── badge ─────────────────────────────────────────────────────────────────
    const statusBadge = (status: string) => {
        const map: Record<string, string> = {
            Available: 'success', 'On Trip': 'primary', 'In Shop': 'danger', Retired: 'secondary'
        };
        return <Badge bg={map[status] || 'secondary'} className="rounded-pill px-2">{status}</Badge>;
    };

    const filterTabs: FilterType[] = ['All', 'Truck', 'Van', 'Bike'];

    return (
        <Container fluid className="mt-4 px-4">
            {/* ── Header ── */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold mb-0" style={{ color: '#F26B8A' }}>Vehicle Registry</h2>
                <div className="d-flex gap-2">
                    <Button variant="light" className="shadow-sm rounded-3" onClick={exportCSV}>
                        <FiDownload className="me-2" />Export
                    </Button>
                    <Button variant="primary" className="shadow-sm rounded-3 px-4" onClick={openAdd}>
                        <FiPlus className="me-2" />Add Asset
                    </Button>
                </div>
            </div>

            {/* ── Table card ── */}
            <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                <Card.Header className="bg-white border-0 py-3 px-4">
                    <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
                        <h5 className="mb-0 fw-bold">Active Assets</h5>

                        {/* Search + filter row */}
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                            {/* Search */}
                            <InputGroup style={{ width: 230 }}>
                                <InputGroup.Text className="bg-light border-0 text-secondary">
                                    <FiSearch size={13} />
                                </InputGroup.Text>
                                <Form.Control
                                    className="bg-light border-0 shadow-none"
                                    style={{ fontSize: 13 }}
                                    placeholder="Search..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </InputGroup>

                            {/* Filter tabs */}
                            <div
                                className="d-flex gap-1 p-1 rounded-3"
                                style={{ background: '#f3f4f6' }}
                            >
                                {filterTabs.map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setFilter(tab)}
                                        style={{
                                            border: 'none',
                                            borderRadius: 6,
                                            padding: '4px 14px',
                                            fontSize: 13,
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all 0.15s',
                                            background: filter === tab ? '#F26B8A' : 'transparent',
                                            color: filter === tab ? '#fff' : '#6b7280',
                                            boxShadow: filter === tab ? '0 1px 4px rgba(242,107,138,0.30)' : 'none',
                                        }}
                                    >
                                        {tab === 'All' ? 'All' : `${tab}s`}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card.Header>

                <Card.Body className="p-0">
                    <Table responsive hover className="mb-0 align-middle">
                        <thead className="bg-light text-secondary small text-uppercase">
                            <tr>
                                <th className="ps-4 py-3">Identifier</th>
                                <th className="py-3">Model &amp; Type</th>
                                <th className="py-3">Max Capacity</th>
                                <th className="py-3">Odometer</th>
                                <th className="py-3">Status</th>
                                <th className="pe-4 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayed.map((vehicle: Vehicle) => (
                                <tr key={vehicle.id || (vehicle as any)._id}>
                                    <td className="ps-4">
                                        <div className="fw-bold">{vehicle.name}</div>
                                        <div className="small text-secondary">{vehicle.licensePlate}</div>
                                    </td>
                                    <td>
                                        <div className="small">{vehicle.model}</div>
                                        <Badge bg="light" text="dark" className="border small fw-normal">
                                            {vehicle.vehicleType}
                                        </Badge>
                                    </td>
                                    <td>{vehicle.maxLoadCapacity} kg</td>
                                    <td>{vehicle.odometer} km</td>
                                    <td>{statusBadge(vehicle.status)}</td>
                                    <td className="pe-4 text-center">
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            className="rounded-3 px-3 d-inline-flex align-items-center gap-1"
                                            style={{ fontSize: 12 }}
                                            onClick={() => openEdit(vehicle)}
                                        >
                                            <FiEdit2 size={12} /> Edit
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {displayed.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-5 text-secondary">
                                        {loading
                                            ? 'Loading assets…'
                                            : filter !== 'All'
                                                ? `No ${filter}s found.`
                                                : 'No vehicles registered in the fleet.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* ── Add / Edit Modal ── */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold">
                        {editMode ? (
                            <><FiEdit2 className="me-2 text-primary" />Edit Vehicle</>
                        ) : (
                            <><FiTruck className="me-2 text-primary" />Register New Vehicle</>
                        )}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body className="px-4">
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-bold">Identification Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="e.g. Van-05"
                                    className="rounded-3 bg-light border-0"
                                    value={formData.name || ''}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-bold">License Plate</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="G-1234-ZY"
                                    className="rounded-3 bg-light border-0"
                                    value={formData.licensePlate || ''}
                                    onChange={e => setFormData({ ...formData, licensePlate: e.target.value })}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-bold">Vehicle Model</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Toyota Hiace 2023"
                                    className="rounded-3 bg-light border-0"
                                    value={formData.model || ''}
                                    onChange={e => setFormData({ ...formData, model: e.target.value })}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-bold">Vehicle Type</Form.Label>
                                <Form.Select
                                    className="rounded-3 bg-light border-0"
                                    value={formData.vehicleType || 'Van'}
                                    onChange={e => setFormData({ ...formData, vehicleType: e.target.value as Vehicle['vehicleType'] })}
                                >
                                    <option value="Van">Van</option>
                                    <option value="Truck">Truck</option>
                                    <option value="Bike">Bike</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-bold">Max Load Capacity (kg)</Form.Label>
                                <Form.Control
                                    type="number"
                                    placeholder="500"
                                    className="rounded-3 bg-light border-0"
                                    value={formData.maxLoadCapacity || ''}
                                    onChange={e => setFormData({ ...formData, maxLoadCapacity: parseInt(e.target.value) || 0 })}
                                />
                            </Form.Group>
                        </Col>
                        {editMode && (
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold">Status</Form.Label>
                                    <Form.Select
                                        className="rounded-3 bg-light border-0"
                                        value={formData.status || 'Available'}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as Vehicle['status'] })}
                                    >
                                        <option value="Available">Available</option>
                                        <option value="On Trip">On Trip</option>
                                        <option value="In Shop">In Shop</option>
                                        <option value="Retired">Retired</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        )}
                    </Row>
                </Modal.Body>

                <Modal.Footer className="border-0 px-4 pb-4">
                    <Button variant="light" className="rounded-3" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        className="rounded-3 px-4 shadow-sm"
                        onClick={handleSave}
                        disabled={saving || !formData.name || !formData.licensePlate}
                    >
                        {saving ? 'Saving…' : editMode ? 'Save Changes' : 'Initialize Asset'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default VehicleRegistry;
