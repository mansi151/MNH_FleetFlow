// TripService - Standalone Driver Logic (v2.1)
const Trip = require("../models/Trip");
const Vehicle = require("../models/Vehicle");
const Driver = require("../models/Driver");
const { TableFields, ValidationMsgs } = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");

// Associations — Trip.driverId → drivers.id (standalone driver profile)
Vehicle.hasMany(Trip, { foreignKey: "vehicleId", as: "trips" });
Trip.belongsTo(Vehicle, { foreignKey: "vehicleId", as: "vehicle" });

Driver.hasMany(Trip, { foreignKey: "driverId", as: "trips" });
Trip.belongsTo(Driver, { foreignKey: "driverId", as: "driver" });

class TripService {

    // ── Create ────────────────────────────────────────────────────────────────
    static createTrip = async (data) => {
        const vehicleId = data[TableFields.tripVehicleId] || data.vehicleId;
        const driverId = data[TableFields.tripDriverId] || data.driverId;

        // 1. Vehicle check
        const vehicle = await Vehicle.findByPk(vehicleId);
        if (!vehicle) throw new ValidationError("Vehicle not found");
        if (vehicle.status !== "Available")
            throw new ValidationError("Vehicle is not available for a new trip");

        // 2. Cargo weight
        const cargoWeight = Number(data[TableFields.cargoWeight] || data.cargoWeight);
        if (cargoWeight > vehicle.maxLoadCapacity)
            throw new ValidationError(ValidationMsgs.OverweightCargo);

        // 3. Driver check (standalone profile PK)
        const driverProfile = await Driver.findByPk(driverId);
        if (!driverProfile)
            throw new ValidationError("Driver profile not found. Please select a valid driver.");

        if (driverProfile.driverStatus === "Suspended")
            throw new ValidationError(`Driver "${driverProfile.name}" is Suspended.`);
        if (driverProfile.driverStatus === "On Trip")
            throw new ValidationError(`Driver "${driverProfile.name}" is already On Trip.`);

        // 3c. License check
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const expiry = new Date(driverProfile.licenseExpiry);
        if (expiry < today) {
            const exp = expiry.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
            throw new ValidationError(`Driver "${driverProfile.name}" — license expired on ${exp}.`);
        }

        const vehicleType = vehicle.vehicleType;
        const cats = Array.isArray(driverProfile.licenseCategory) ? driverProfile.licenseCategory : [];
        if (!cats.includes(vehicleType))
            throw new ValidationError(`Driver "${driverProfile.name}" is not licensed for "${vehicleType}".`);

        // 4. Create trip
        const trip = await Trip.create({
            vehicleId,
            driverId,
            cargoWeight,
            startLocation: data.startLocation,
            endLocation: data.endLocation,
            status: "Dispatched",
            dispatchDate: new Date(),
            startOdometer: vehicle.odometer || 0,
        });

        // 5. Update statuses
        await vehicle.update({ status: "On Trip" });
        await driverProfile.update({ driverStatus: "On Trip" });

        return trip;
    };

    // ── Cancel ────────────────────────────────────────────────────────────────
    static cancelTrip = async (tripId) => {
        const trip = await Trip.findByPk(tripId);
        if (!trip) throw new ValidationError("Trip not found");
        if (trip.status === "Completed") throw new ValidationError("Cannot cancel a completed trip.");
        if (trip.status === "Cancelled") throw new ValidationError("Already cancelled.");

        await trip.update({ status: "Cancelled" });
        const vehicle = await Vehicle.findByPk(trip.vehicleId);
        if (vehicle && vehicle.status === "On Trip") await vehicle.update({ status: "Available" });

        const driverProfile = await Driver.findByPk(trip.driverId);
        if (driverProfile && driverProfile.driverStatus === "On Trip")
            await driverProfile.update({ driverStatus: "Off Duty" });

        return trip;
    };

    // ── Complete ──────────────────────────────────────────────────────────────
    static completeTrip = async (tripId, odometerReading) => {
        const trip = await Trip.findByPk(tripId);
        if (!trip) throw new ValidationError("Trip not found");

        await trip.update({
            status: "Completed",
            completionDate: new Date(),
            endOdometer: odometerReading
        });
        const vehicle = await Vehicle.findByPk(trip.vehicleId);
        if (vehicle) await vehicle.update({ status: "Available", odometer: odometerReading });

        const driverProfile = await Driver.findByPk(trip.driverId);
        if (driverProfile) await driverProfile.update({ driverStatus: "Off Duty" });

        return trip;
    };

    // ── Read ──────────────────────────────────────────────────────────────────
    static getAllTrips = (filters = {}) =>
        new ProjectionBuilder(async () => {
            const where = {};
            if (filters.status) where.status = filters.status;
            return await Trip.findAll({
                where,
                include: [
                    { model: Vehicle, as: "vehicle" },
                    { model: Driver, as: "driver" },
                ],
                order: [["createdAt", "DESC"]],
            });
        });

    static getTripById = (id) =>
        new ProjectionBuilder(async () => {
            const trip = await Trip.findByPk(id, {
                include: [
                    { model: Vehicle, as: "vehicle" },
                    { model: Driver, as: "driver" },
                ],
            });
            if (!trip) throw new ValidationError("Trip not found");
            return trip;
        });
}

const ProjectionBuilder = class {
    constructor(methodToExecute) {
        this.withBasicInfo = () => this;
        this.execute = async () => {
            const result = await methodToExecute();
            if (!result) return result;
            if (Array.isArray(result)) return result.map(t => t.toJSON ? t.toJSON() : t);
            return result.toJSON ? result.toJSON() : result;
        };
    }
};

module.exports = TripService;
