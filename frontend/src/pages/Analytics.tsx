import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, ProgressBar, Button, Spinner } from 'react-bootstrap';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { FiTrendingUp, FiDownload, FiRefreshCw } from 'react-icons/fi';
import APICallService from '../api/apiCallService';
import { VEHICLES, TRIPS, EXPENSES } from '../api/apiEndPoints';
import type { Vehicle } from '../store/slices/vehicleSlice';

interface Expense {
    _id: string;
    vehicleId: { _id: string; name: string; licensePlate: string } | string;
    expenseType: string;
    amount: number;
    liters?: number;
    date: string;
}

// Months abbreviations
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const fmt = (n: number) => {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(1)}k`;
    return `₹${(n || 0).toFixed(0)}`;
};

const Analytics: React.FC = () => {
    const [trips, setTrips] = useState<any[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [vData, tData, eData] = await Promise.all([
                new APICallService(VEHICLES).callAPI(),
                new APICallService(TRIPS).callAPI(),
                new APICallService(EXPENSES).callAPI()
            ]);
            setVehicles(Array.isArray(vData) ? vData : []);
            setTrips(Array.isArray(tData) ? tData : []);
            setExpenses(Array.isArray(eData) ? eData : []);
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchAll(); }, []);

    // ── DATA PROCESSING (DYNAMIC) ────────────────────────────────────────────
    const completedTrips = trips.filter(t => t.status === 'Completed' && t.endOdometer > t.startOdometer);

    // Dynamic Revenue: ₹45 per KM + ₹0.2 per KG cargo
    const calcRevenue = (t: any) => {
        const d = (t.endOdometer - t.startOdometer) || 0;
        return (d * 45) + (t.cargoWeight * 0.2);
    };

    const totalDistance = completedTrips.reduce((s, t) => s + (t.endOdometer - t.startOdometer), 0);
    const totalRev = completedTrips.reduce((s, t) => s + calcRevenue(t), 0);
    const totalExp = expenses.reduce((s, e) => s + (e.amount || 0), 0);
    const fuelCost = expenses.filter(e => e.expenseType === 'Fuel').reduce((s, e) => s + (e.amount || 0), 0);

    const costPerKm = totalDistance > 0 ? (fuelCost / totalDistance).toFixed(2) : '0.00';
    const profitMargin = totalRev > 0 ? (((totalRev - totalExp) / totalRev) * 100).toFixed(1) : '0.0';

    const inShopVehicles = vehicles.filter(v => v.status === 'In Shop').length;

    // ── Monthly Aggregation ──────────────────────────────────────────────────
    const monthStats = MONTHS.map((_m, i) => {
        const mTrips = completedTrips.filter(t => t.completionDate && new Date(t.completionDate).getMonth() === i);
        const mExpenses = expenses.filter(e => e.date && new Date(e.date).getMonth() === i);

        const dist = mTrips.reduce((s, t) => s + (t.endOdometer - t.startOdometer), 0);
        const revenue = mTrips.reduce((s, t) => s + calcRevenue(t), 0);
        const fuel = mExpenses.filter(e => e.expenseType === 'Fuel').reduce((s, e) => s + (e.amount || 0), 0);
        const liters = mExpenses.filter(e => e.expenseType === 'Fuel').reduce((s, e) => s + (e.liters || 0), 0);
        const maint = mExpenses.filter(e => e.expenseType === 'Maintenance').reduce((s, e) => s + (e.amount || 0), 0);
        const totalMExp = mExpenses.reduce((s, e) => s + (e.amount || 0), 0);

        return {
            month: _m,
            distance: dist,
            revenue,
            fuel,
            liters,
            maintenance: maint,
            net: revenue - totalMExp,
            efficiency: liters > 0 ? Math.round((dist / liters) * 10) / 10 : 0
        };
    });

    const activeMonths = monthStats.filter(m => m.revenue > 0 || m.distance > 0 || m.fuel > 0);

    // ── Chart Series ─────────────────────────────────────────────────────────
    const efficiencySeries = [{
        name: 'Efficiency (km/L)',
        data: monthStats.map(m => m.efficiency)
    }];

    const efficiencyChart: ApexOptions = {
        chart: { type: 'line', toolbar: { show: false } },
        stroke: { curve: 'smooth', width: 3 },
        colors: ['#F26B8A'],
        markers: { size: 4, strokeColors: '#fff', strokeWidth: 2 },
        xaxis: { categories: MONTHS, labels: { style: { colors: '#6c757d' } } },
        yaxis: { labels: { style: { colors: '#6c757d' } } },
        grid: { borderColor: '#f1f1f1' },
        tooltip: { y: { formatter: (v) => `${v} km/L` } }
    };

    // Vehicle Distribution
    const vCostMap: Record<string, number> = {};
    expenses.forEach(e => {
        const vid = typeof e.vehicleId === 'object' ? (e.vehicleId as any)._id || (e.vehicleId as any).id : e.vehicleId;
        if (vid) vCostMap[vid] = (vCostMap[vid] || 0) + (e.amount || 0);
    });

    const topVehicles = vehicles
        .map(v => ({ name: v.licensePlate || v.name, cost: vCostMap[String(v._id || v.id)] || 0 }))
        .sort((a, b) => b.cost - a.cost)
        .slice(0, 5);

    const costliesSeries = [{
        name: 'Total Cost',
        data: topVehicles.length > 0 ? topVehicles.map(v => v.cost) : [0]
    }];

    const costliesChart: ApexOptions = {
        chart: { type: 'bar', toolbar: { show: false } },
        plotOptions: { bar: { borderRadius: 4, horizontal: true, barHeight: '60%' } },
        colors: ['#198754'],
        xaxis: { categories: topVehicles.length > 0 ? topVehicles.map(v => v.name) : ['No Data'], labels: { style: { colors: '#6c757d' } } },
        yaxis: { labels: { style: { colors: '#6c757d' } } },
        grid: { show: false },
        tooltip: { y: { formatter: (v) => `₹${v.toLocaleString()}` } }
    };

    const exportCSV = () => {
        const rows = topVehicles.map(v => `${v.name},${v.cost}`);
        const blob = new Blob(['Vehicle,TotalCost\n' + rows.join('\n')], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'analytics.csv'; a.click();
    };

    return (
        <Container fluid className="mt-4 px-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1" style={{ color: '#F26B8A' }}>Operational Analytics &amp; Financial Reports</h2>
                    <p className="text-secondary small mb-0">Fleet ROI, fuel efficiency trends &amp; financial summaries</p>
                </div>
                <div className="d-flex gap-2">
                    <Button variant="light" className="rounded-3 shadow-sm" onClick={fetchAll} disabled={loading}>
                        <FiRefreshCw className={`me-2 ${loading ? 'spin' : ''}`} />Refresh
                    </Button>
                    <Button variant="primary" className="rounded-3 shadow-sm" onClick={exportCSV}>
                        <FiDownload className="me-2" />Export CSV
                    </Button>
                </div>
            </div>

            {loading && (
                <div className="text-center py-4">
                    <Spinner animation="border" variant="primary" />
                </div>
            )}

            <Row className="mb-4 g-3 text-center">
                <Col md={3}>
                    <Card className="border-0 shadow-sm rounded-4 bg-white border-start border-4 border-primary">
                        <Card.Body className="p-3">
                            <div className="small text-secondary fw-semibold mb-1" style={{ fontSize: '11px' }}>Estimated Revenue</div>
                            <h4 className="fw-bold mb-0 text-dark">{fmt(totalRev)}</h4>
                            <div className="small text-primary mt-1" style={{ fontSize: '11px' }}>↑ Driven by cargo & distance</div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm rounded-4 bg-white border-start border-4 border-success">
                        <Card.Body className="p-3">
                            <div className="small text-secondary fw-semibold mb-1" style={{ fontSize: '11px' }}>Fuel Cost / KM</div>
                            <h4 className="fw-bold mb-0 text-success">₹{costPerKm}</h4>
                            <div className="small text-success mt-1" style={{ fontSize: '11px' }}>Fleet efficiency metric</div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm rounded-4 bg-white border-start border-4 border-info">
                        <Card.Body className="p-3">
                            <div className="small text-secondary fw-semibold mb-1" style={{ fontSize: '11px' }}>Profit Margin</div>
                            <h4 className="fw-bold mb-0 text-info">{profitMargin}%</h4>
                            <div className="small text-info mt-1" style={{ fontSize: '11px' }}>Net operational ROI</div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm rounded-4 bg-white border-start border-4 border-dark">
                        <Card.Body className="p-3">
                            <div className="small text-secondary fw-semibold mb-1" style={{ fontSize: '11px' }}>Total Distance</div>
                            <h4 className="fw-bold mb-0 text-dark">{totalDistance.toLocaleString()} km</h4>
                            <div className="small text-secondary mt-1" style={{ fontSize: '11px' }}>Closed trip odometers</div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* ── Charts Row ─────────────────────────────────────────────────── */}
            <Row className="mb-4 g-3">
                <Col lg={7}>
                    <Card className="border-0 shadow-sm rounded-4 h-100">
                        <Card.Body className="p-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="fw-bold mb-0">Fuel Efficiency Trend (km/L)</h6>
                                <span className="small text-secondary fw-normal" style={{ fontSize: '10px' }}>*Based on liters logged in expenses</span>
                            </div>
                            {totalDistance > 0 ? (
                                <ReactApexChart options={efficiencyChart} series={efficiencySeries} type="line" height={260} />
                            ) : (
                                <div className="text-center py-5 text-secondary opacity-50">No distance data logged yet</div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={5}>
                    <Card className="border-0 shadow-sm rounded-4 h-100">
                        <Card.Body className="p-4">
                            <h6 className="fw-bold mb-3">Top 5 Costliest Vehicles</h6>
                            {expenses.length > 0 ? (
                                <ReactApexChart options={costliesChart} series={costliesSeries} type="bar" height={260} />
                            ) : (
                                <div className="text-center py-5 text-secondary opacity-50">No expense logs found</div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* ── Financial Summary Table ──────────────────────────────────── */}
            <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                <Card.Header className="bg-white border-0 text-center py-3">
                    <h5 className="fw-bold mb-0 border rounded-pill d-inline-block px-4 py-1"
                        style={{ color: '#F26B8A', borderColor: '#F26B8A' }}>
                        Financial Summary of Month
                    </h5>
                </Card.Header>
                <Card.Body className="p-0">
                    <Table responsive className="mb-0 align-middle">
                        <thead className="bg-light text-primary">
                            <tr>
                                <th className="ps-4">Month</th>
                                <th>Revenue</th>
                                <th>Fuel Cost</th>
                                <th>Maint.</th>
                                <th>Distance</th>
                                <th className="pe-4">Net Profit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeMonths.length > 0 ? activeMonths.map(row => (
                                <tr key={row.month}>
                                    <td className="ps-4 fw-semibold">{row.month}</td>
                                    <td className="text-success fw-bold">{fmt(row.revenue)}</td>
                                    <td>{fmt(row.fuel)}</td>
                                    <td>{fmt(row.maintenance)}</td>
                                    <td>{row.distance.toLocaleString()} km</td>
                                    <td className={`pe-4 fw-bold ${row.net >= 0 ? 'text-success' : 'text-danger'}`}>
                                        {fmt(row.net)}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-5 text-secondary">No data available for the current period</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* ── Fleet Status Overview ────────────────────────────────────── */}
            <Card className="border-0 shadow-sm rounded-4 my-4">
                <Card.Body className="p-4">
                    <h6 className="fw-bold mb-3"><FiTrendingUp className="me-2 text-primary" />Fleet Status Overview</h6>
                    <Row className="g-3">
                        {[
                            { label: 'Available', count: vehicles.filter(v => v.status === 'Available').length, color: 'success' },
                            { label: 'On Trip', count: vehicles.filter(v => v.status === 'On Trip').length, color: 'primary' },
                            { label: 'In Shop', count: inShopVehicles, color: 'danger' },
                            { label: 'Retired', count: vehicles.filter(v => v.status === 'Retired').length, color: 'secondary' },
                        ].map(({ label, count, color }) => (
                            <Col sm={6} lg={3} key={label}>
                                <div className="d-flex justify-content-between small mb-1">
                                    <span className="text-secondary">{label}</span>
                                    <span className="fw-bold">{count} / {vehicles.length || 1}</span>
                                </div>
                                <ProgressBar now={vehicles.length ? (count / vehicles.length) * 100 : 0} variant={color} style={{ height: 8 }} className="rounded-pill" />
                            </Col>
                        ))}
                    </Row>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Analytics;
