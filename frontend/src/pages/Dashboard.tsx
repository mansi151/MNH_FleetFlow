import React, { useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Table, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { fetchVehicles, selectAllVehicles } from '../store/slices/vehicleSlice';
import type { Vehicle } from '../store/slices/vehicleSlice';
import { fetchTrips, selectAllTrips } from '../store/slices/tripSlice';
import type { Trip } from '../store/slices/tripSlice';
import { FiTruck, FiTool, FiActivity, FiPackage } from 'react-icons/fi';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const dispatch: any = useAppDispatch();
    const vehicles = useAppSelector(selectAllVehicles);
    const trips = useAppSelector(selectAllTrips);

    useEffect(() => {
        dispatch(fetchVehicles());
        dispatch(fetchTrips());
    }, [dispatch]);

    const activeFleetCount = vehicles.filter((v: Vehicle) => v.status === 'On Trip').length;
    const maintenanceCount = vehicles.filter((v: Vehicle) => v.status === 'In Shop').length;
    const utilizationRate = vehicles.length > 0
        ? Math.round((vehicles.filter((v: Vehicle) => v.status === 'On Trip' || v.status === 'In Shop').length / vehicles.length) * 100)
        : 0;
    const pendingCargo = trips.filter((t: Trip) => t.status === 'Draft').length;

    return (
        <Container fluid className="mt-4 px-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold mb-0" style={{ color: '#F26B8A' }}>Dashboard</h2>
                <div className="d-flex gap-2">
                    <Button variant="outline-primary" className="rounded-3 shadow-sm" onClick={() => navigate('/vehicles')}>
                        <FiTruck className="me-2" />Add Vehicle
                    </Button>
                    <Button variant="primary" className="rounded-3 shadow-sm px-4" onClick={() => navigate('/dispatcher')}>
                        <FiActivity className="me-2" />Add Trip
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <Row className="mb-4 g-4">
                {[
                    {
                        label: 'Active Fleet',
                        value: activeFleetCount,
                        icon: <FiTruck size={22} />,
                        accent: '#F26B8A',
                        bg: '#fde8ed',
                        textColor: '#9b1e3c',
                    },
                    {
                        label: 'Maintenance Alerts',
                        value: maintenanceCount,
                        icon: <FiTool size={22} />,
                        accent: '#dc2626',
                        bg: '#fff1f2',
                        textColor: '#b91c1c',
                    },
                    {
                        label: 'Utilization Rate',
                        value: `${utilizationRate}%`,
                        icon: <FiActivity size={22} />,
                        accent: '#16a34a',
                        bg: '#f0fdf4',
                        textColor: '#15803d',
                    },
                    {
                        label: 'Pending Cargo',
                        value: pendingCargo,
                        icon: <FiPackage size={22} />,
                        accent: '#d97706',
                        bg: '#fffbeb',
                        textColor: '#b45309',
                    },
                ].map(({ label, value, icon, accent, bg, textColor }) => (
                    <Col md={3} key={label}>
                        <Card
                            className="border-0 shadow-sm rounded-4 h-100"
                            style={{ background: bg, borderLeft: `4px solid ${accent} !important` }}
                        >
                            <Card.Body className="d-flex align-items-center p-4" style={{ borderLeft: `4px solid ${accent}`, borderRadius: 16 }}>
                                <div
                                    className="rounded-circle p-3 me-3 d-flex align-items-center justify-content-center"
                                    style={{ background: accent + '1a', color: accent, flexShrink: 0, width: 52, height: 52 }}
                                >
                                    {icon}
                                </div>
                                <div>
                                    <div className="small fw-semibold mb-1" style={{ color: textColor, opacity: 0.8 }}>{label}</div>
                                    <h3 className="mb-0 fw-bold" style={{ color: textColor }}>{value}</h3>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row>
                {/* Recent Trips Table */}
                <Col lg={8}>
                    <Card className="border-0 shadow-sm rounded-4 mb-4">
                        <Card.Header className="bg-transparent border-0 py-3">
                            <h5 className="mb-0 fw-bold">Recent Fleet Activity</h5>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table responsive hover className="mb-0 align-middle">
                                <thead className="bg-light text-secondary small text-uppercase">
                                    <tr>
                                        <th className="ps-4">Vehicle</th>
                                        <th>Route</th>
                                        <th>Status</th>
                                        <th>Load</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trips.slice(0, 5).map((trip: Trip) => (
                                        <tr key={trip._id}>
                                            <td className="ps-4">
                                                <div className="d-flex align-items-center">
                                                    <div className="fw-bold">{(trip.vehicleId as any)?.name || 'N/A'}</div>
                                                    <div className="ms-2 badge bg-light text-dark border">{(trip.vehicleId as any)?.licensePlate}</div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="small text-truncate" style={{ maxWidth: '150px' }}>
                                                    {trip.startLocation} → {trip.endLocation}
                                                </div>
                                            </td>
                                            <td>
                                                <Badge bg={
                                                    trip.status === 'Dispatched' ? 'primary' :
                                                        trip.status === 'Completed' ? 'success' :
                                                            'secondary'
                                                } className="rounded-pill px-3">
                                                    {trip.status}
                                                </Badge>
                                            </td>
                                            <td>{trip.cargoWeight} kg</td>
                                        </tr>
                                    ))}
                                    {trips.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="text-center py-4 text-secondary">No active trips found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Filters sidebar / small summary */}
                <Col lg={4}>
                    <Card className="border-0 shadow-sm rounded-4 h-100">
                        <Card.Header className="bg-transparent border-0 py-3">
                            <h5 className="mb-0 fw-bold">Vehicle Distribution</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="mt-4">
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="small">Trucks</span>
                                    <span className="small fw-bold">{vehicles.filter((v: Vehicle) => v.vehicleType === 'Truck').length}</span>
                                </div>
                                <div className="progress rounded-pill overflow-hidden" style={{ height: '6px' }}>
                                    <div className="progress-bar bg-primary" style={{ width: '65%' }} role="progressbar"></div>
                                </div>
                            </div>

                            <div className="mt-4">
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="small">Vans</span>
                                    <span className="small fw-bold">{vehicles.filter((v: Vehicle) => v.vehicleType === 'Van').length}</span>
                                </div>
                                <div className="progress rounded-pill overflow-hidden" style={{ height: '6px' }}>
                                    <div className="progress-bar bg-success" style={{ width: '45%' }} role="progressbar"></div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Dashboard;
