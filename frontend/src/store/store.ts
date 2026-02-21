import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import vehicleReducer from './slices/vehicleSlice';
import tripReducer from './slices/tripSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        vehicles: vehicleReducer,
        trips: tripReducer,
    },
    middleware: (getDefaultMiddleware: any) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {auth: AuthState, vehicles: VehicleState, trips: TripState}
export type AppDispatch = typeof store.dispatch;
