import * as constants from "../utils/constants";

// ─── Auth ────────────────────────────────────────────────────────────────────
export const LOGIN = "user/login" + " " + constants.POST_RAW;
export const LOGOUT = "user/logout" + " " + constants.POST_RAW;
export const SIGNUP = "user/register" + " " + constants.POST_RAW;
export const FORGOTPASSWORD = "user/forgot-password" + " " + constants.POST_RAW;
export const RESETPASSWORD = "user/reset-password" + " " + constants.POST_RAW;

// ─── Vehicles ────────────────────────────────────────────────────────────────
export const VEHICLES = "fleet/vehicles" + " " + constants.GET;
export const CREATE_VEHICLE = "fleet/vehicles" + " " + constants.POST_RAW;
export const UPDATE_VEHICLE = "fleet/vehicles" + " " + constants.PATCH_ID;

// ─── Trips ───────────────────────────────────────────────────────────────────
export const TRIPS = "fleet/trips" + " " + constants.GET;
export const CREATE_TRIP = "fleet/trips" + " " + constants.POST_RAW;
export const COMPLETE_TRIP = "fleet/trips" + " " + constants.POST_ID_PARAMS;
export const CANCEL_TRIP = "fleet/trips" + " " + constants.POST_ID_PARAMS;

// ─── Maintenance ─────────────────────────────────────────────────────────────
export const MAINTENANCE = "fleet/maintenance" + " " + constants.GET;
export const LOG_MAINTENANCE = "fleet/maintenance" + " " + constants.POST_RAW;
export const COMPLETE_MAINTENANCE = "fleet/maintenance" + " " + constants.POST_ID_PARAMS;

// ─── Expenses ────────────────────────────────────────────────────────────────
export const EXPENSES = "fleet/expenses" + " " + constants.GET;
export const VEHICLE_EXPENSES = "fleet/expenses" + " " + constants.GET_URL_ID_PARAMS;
export const LOG_EXPENSE = "fleet/expenses" + " " + constants.POST_RAW;
export const FUEL_SUMMARY = "fleet/expenses/summary/fuel" + " " + constants.GET;

// ─── Drivers ─────────────────────────────────────────────────────────────────
export const DRIVERS = "fleet/drivers" + " " + constants.GET;
export const CREATE_DRIVER = "fleet/drivers" + " " + constants.POST_RAW;
export const UPDATE_DRIVER = "fleet/drivers" + " " + constants.PATCH_ID;
