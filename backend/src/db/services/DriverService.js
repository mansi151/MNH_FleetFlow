const Driver = require("../models/Driver");
const ValidationError = require("../../utils/ValidationError");

const VALID_CATEGORIES = ["Truck", "Van", "Bike"];
const VALID_STATUSES = ["On Duty", "Off Duty", "Suspended", "On Trip"];

class DriverService {

    // ── Create ────────────────────────────────────────────────────────────────
    static createProfile = async (data) => {
        // 1. Name required
        if (!data.name || !data.name.trim())
            throw new ValidationError("Driver name is required");

        // 2. License expiry — must be a future date
        const expiry = new Date(data.licenseExpiry);
        if (isNaN(expiry.getTime()))
            throw new ValidationError("A valid license expiry date is required");

        const today = new Date(); today.setHours(0, 0, 0, 0);
        if (expiry < today) {
            const expiryStr = expiry.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
            throw new ValidationError(
                `License expiry (${expiryStr}) is already in the past. ` +
                "Please provide a valid, non-expired license."
            );
        }

        // 3. License categories — must be valid + at least one
        const categories = Array.isArray(data.licenseCategory) ? data.licenseCategory : [];
        if (categories.length === 0)
            throw new ValidationError("At least one license category (Truck, Van, or Bike) is required");

        const invalid = categories.filter(c => !VALID_CATEGORIES.includes(c));
        if (invalid.length > 0)
            throw new ValidationError(
                `Invalid license categories: [${invalid.join(", ")}]. ` +
                `Allowed values: ${VALID_CATEGORIES.join(", ")}.`
            );

        return await Driver.create({
            name: data.name.trim(),
            licenseNumber: data.licenseNumber || null,
            licenseExpiry: data.licenseExpiry,
            licenseCategory: categories,
            safetyScore: data.safetyScore ?? 100,
            completionRate: data.completionRate ?? 100,
            complaints: data.complaints ?? 0,
            driverStatus: data.driverStatus || "Off Duty",
        });
    };

    // ── Read ──────────────────────────────────────────────────────────────────
    static getAllProfiles = () =>
        new ProjectionBuilder(async () => {
            return await Driver.findAll({ order: [["createdAt", "DESC"]] });
        });

    static getProfileById = (id) =>
        new ProjectionBuilder(async () => {
            const profile = await Driver.findByPk(id);
            if (!profile) throw new ValidationError("Driver profile not found");
            return profile;
        });

    // ── Update ────────────────────────────────────────────────────────────────
    static updateProfile = async (id, updates) => {
        const profile = await Driver.findByPk(id);
        if (!profile) throw new ValidationError("Driver profile not found");

        // Validate status if being updated
        if (updates.driverStatus && !VALID_STATUSES.includes(updates.driverStatus))
            throw new ValidationError(`Invalid status. Allowed: ${VALID_STATUSES.join(", ")}`);

        return await profile.update(updates);
    };

    // ── Compliance check (called by TripService) ──────────────────────────────
    /**
     * Returns { compliant: bool, reasons: string[] }
     * vehicleType: "Van" | "Truck" | "Bike"
     */
    static checkCompliance = async (driverProfileId, vehicleType) => {
        const profile = await Driver.findByPk(driverProfileId);
        if (!profile) return { compliant: false, reasons: ["Driver profile not found"] };

        const reasons = [];

        if (profile.driverStatus === "Suspended")
            reasons.push("Driver is Suspended");

        if (profile.driverStatus === "On Trip")
            reasons.push("Driver is already On Trip");

        const today = new Date(); today.setHours(0, 0, 0, 0);
        const expiry = new Date(profile.licenseExpiry);
        if (expiry < today) {
            const exp = expiry.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
            reasons.push(`License expired on ${exp}`);
        }

        const cats = Array.isArray(profile.licenseCategory) ? profile.licenseCategory : [];
        if (vehicleType && !cats.includes(vehicleType))
            reasons.push(`Not licensed for "${vehicleType}" (has: [${cats.join(", ") || "none"}])`);

        return { compliant: reasons.length === 0, reasons };
    };
}

// ── Minimal ProjectionBuilder — returns plain objects ─────────────────────────
class ProjectionBuilder {
    constructor(fn) {
        this.withBasicInfo = () => this;
        this.execute = async () => {
            const result = await fn();
            if (!result) return result;
            if (Array.isArray(result)) return result.map(r => r.toJSON ? r.toJSON() : r);
            return result.toJSON ? result.toJSON() : result;
        };
    }
}

module.exports = DriverService;
