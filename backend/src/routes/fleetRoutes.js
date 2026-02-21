const API = require("../utils/apiBuilder");
const VehicleController = require("../controllers/users/VehicleController");
const TripController = require("../controllers/users/TripController");
const MaintenanceController = require("../controllers/users/MaintenanceController");
const ExpenseController = require("../controllers/users/ExpenseController");
const DriverController = require("../controllers/users/DriverController");
const auth = require("../middleware/auth");

const router = API.configRoute("/fleet")
    // ─── Vehicles ────────────────────────────────────────────────────────────
    .addPath("/vehicles")
    .asGET(VehicleController.getAll)
    .userMiddlewares(auth)
    .build()

    .addPath("/vehicles")
    .asPOST(VehicleController.create)
    .userMiddlewares(auth)
    .build()

    .addPath("/vehicles/:id")
    .asUPDATE(VehicleController.update)
    .userMiddlewares(auth)
    .build()

    // ─── Trips ───────────────────────────────────────────────────────────────
    .addPath("/trips")
    .asGET(TripController.getAll)
    .userMiddlewares(auth)
    .build()

    .addPath("/trips")
    .asPOST(TripController.create)
    .userMiddlewares(auth)
    .build()

    .addPath("/trips/:id/complete")
    .asPOST(TripController.complete)
    .userMiddlewares(auth)
    .build()

    .addPath("/trips/:id/cancel")
    .asPOST(TripController.cancel)
    .userMiddlewares(auth)
    .build()

    // ─── Maintenance ─────────────────────────────────────────────────────────
    .addPath("/maintenance")
    .asGET(MaintenanceController.getAllLogs)
    .userMiddlewares(auth)
    .build()

    .addPath("/maintenance")
    .asPOST(MaintenanceController.logMaintenance)
    .userMiddlewares(auth)
    .build()

    .addPath("/maintenance/:id/complete")
    .asPOST(MaintenanceController.completeMaintenance)
    .userMiddlewares(auth)
    .build()

    // ─── Expenses ────────────────────────────────────────────────────────────
    .addPath("/expenses")
    .asGET(ExpenseController.getAllExpenses)
    .userMiddlewares(auth)
    .build()

    .addPath("/expenses/:vehicleId")
    .asGET(ExpenseController.getVehicleExpenses)
    .userMiddlewares(auth)
    .build()

    .addPath("/expenses")
    .asPOST(ExpenseController.logExpense)
    .userMiddlewares(auth)
    .build()

    .addPath("/expenses/summary/fuel")
    .asGET(ExpenseController.getFuelSummary)
    .userMiddlewares(auth)
    .build()

    // ─── Drivers ─────────────────────────────────────────────────────────────
    .addPath("/drivers")
    .asGET(DriverController.getAll)
    .userMiddlewares(auth)
    .build()

    .addPath("/drivers")
    .asPOST(DriverController.createProfile)
    .userMiddlewares(auth)
    .build()

    .addPath("/drivers/:id")
    .asUPDATE(DriverController.update)
    .userMiddlewares(auth)
    .build()

    .getRouter();

module.exports = router;
