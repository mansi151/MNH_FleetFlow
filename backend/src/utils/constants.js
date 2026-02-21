const ResponseStatus = (function () {
    function ResponseStatus() { }
    ResponseStatus.Failed = 0;
    ResponseStatus.Success = 200;
    ResponseStatus.BadRequest = 400;
    ResponseStatus.Unauthorized = 401;
    ResponseStatus.NotFound = 404;
    ResponseStatus.InternalServerError = 500;
    ResponseStatus.ServiceUnavailable = 503;

    return ResponseStatus;
})();

const UserRoles = (function () {
    function UserRoles() { }
    UserRoles.Manager = "manager";
    UserRoles.Dispatcher = "dispatcher";
    UserRoles.SafetyOfficer = "safety_officer";
    UserRoles.FinancialAnalyst = "financial_analyst";
    UserRoles.Driver = "driver";

    return UserRoles;
})();

const TableNames = (function () {
    function TableNames() { }
    TableNames.User = "users";
    TableNames.Vehicle = "vehicles";
    TableNames.DriverProfile = "driver_profiles";
    TableNames.Trip = "trips";
    TableNames.MaintenanceLog = "maintenance_logs";
    TableNames.ExpenseLog = "expense_logs";

    return TableNames;
})();

const TableFields = (function () {
    function TableFields() { }
    TableFields.ID = "id";
    TableFields.username = "username";
    TableFields.email = "email";
    TableFields.password = "password";
    TableFields.role = "role";
    TableFields.tokens = "tokens";
    TableFields.token = "token";
    TableFields._createdAt = "createdAt";
    TableFields._updatedAt = "updatedAt";

    // Vehicle
    TableFields.vehicleName = "name";
    TableFields.vehicleModel = "model";
    TableFields.licensePlate = "licensePlate";
    TableFields.maxLoadCapacity = "maxLoadCapacity";
    TableFields.odometer = "odometer";
    TableFields.vehicleStatus = "status"; // Available, On Trip, In Shop, Retired
    TableFields.vehicleType = "vehicleType"; // Truck, Van, Bike

    // Driver Profile
    TableFields.userId = "userId";
    TableFields.licenseExpiry = "licenseExpiry";
    TableFields.safetyScore = "safetyScore";
    TableFields.driverStatus = "status"; // On Duty, Off Duty, Suspended, On Trip
    TableFields.licenseCategory = "licenseCategory"; // Van, Truck, etc.

    // Trip
    TableFields.tripVehicleId = "vehicleId";
    TableFields.tripDriverId = "driverId";
    TableFields.cargoWeight = "cargoWeight";
    TableFields.tripStatus = "status"; // Draft, Dispatched, Completed, Cancelled
    TableFields.startLocation = "startLocation";
    TableFields.endLocation = "endLocation";
    TableFields.dispatchDate = "dispatchDate";
    TableFields.completionDate = "completionDate";

    // Maintenance Log
    TableFields.maintenanceVehicleId = "vehicleId";
    TableFields.serviceDate = "serviceDate";
    TableFields.description = "description";
    TableFields.maintenanceCost = "cost";

    // Expense Log
    TableFields.expenseVehicleId = "vehicleId";
    TableFields.expenseTripId = "tripId";
    TableFields.expenseType = "expenseType"; // Fuel, Maintenance, Toll, Other
    TableFields.amount = "amount";
    TableFields.miscAmount = "miscAmount";
    TableFields.distance = "distance";
    TableFields.driverName = "driverName";
    TableFields.liters = "liters";
    TableFields.expenseDate = "date";
    TableFields.expenseStatus = "status"; // Done, Pending, Cancelled

    return TableFields;
})();

const ValidationMsgs = (function () {
    function ValidationMsgs() { }
    ValidationMsgs.EmailEmpty = "Email is required!";
    ValidationMsgs.EmailInvalid = "Provided email address is invalid.";
    ValidationMsgs.PasswordEmpty = "Password cannot be blank.";
    ValidationMsgs.PasswordInvalid = "Password is invalid.";
    ValidationMsgs.DuplicateEmail = "This email address is already in use.";
    ValidationMsgs.UserNotFound = "User not found.";
    ValidationMsgs.UnableToLogin = "Incorrect email and/or password.";
    ValidationMsgs.NameEmpty = "Name is required!";
    ValidationMsgs.ParametersError = "Invalid parameters.";
    ValidationMsgs.OverweightCargo = "Cargo weight exceeds vehicle capacity!";
    ValidationMsgs.ExpiredLicense = "Driver license has expired!";

    return ValidationMsgs;
})();

module.exports = {
    ResponseStatus,
    UserRoles,
    TableNames,
    TableFields,
    ValidationMsgs
};
