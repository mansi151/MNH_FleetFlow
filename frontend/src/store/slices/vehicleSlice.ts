import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { ActionReducerMapBuilder, PayloadAction } from '@reduxjs/toolkit';
import APICallService from '../../api/apiCallService';
import { VEHICLES, CREATE_VEHICLE } from '../../api/apiEndPoints';

export interface Vehicle {
    id: number;
    name: string;
    model: string;
    licensePlate: string;
    maxLoadCapacity: number;
    odometer: number;
    status: 'Available' | 'On Trip' | 'In Shop' | 'Retired';
    vehicleType: 'Truck' | 'Van' | 'Bike';
}

interface VehicleState {
    vehicles: Vehicle[];
    loading: boolean;
    error: string | null;
}

const initialState: VehicleState = {
    vehicles: [],
    loading: false,
    error: null,
};

export const fetchVehicles = createAsyncThunk('vehicles/fetchVehicles', async () => {
    const apiService = new APICallService(VEHICLES);
    return await apiService.callAPI();
});

export const addVehicle = createAsyncThunk('vehicles/addVehicle', async (data: Partial<Vehicle>) => {
    const apiService = new APICallService(CREATE_VEHICLE, data);
    return await apiService.callAPI();
});

const vehicleSlice = createSlice({
    name: 'vehicles',
    initialState,
    reducers: {},
    extraReducers: (builder: ActionReducerMapBuilder<VehicleState>) => {
        builder
            .addCase(fetchVehicles.pending, (state) => { state.loading = true; })
            .addCase(fetchVehicles.fulfilled, (state, action: PayloadAction<Vehicle[]>) => {
                state.loading = false;
                state.vehicles = action.payload;
            })
            .addCase(fetchVehicles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch vehicles';
            })
            .addCase(addVehicle.fulfilled, (state, action: PayloadAction<Vehicle>) => {
                state.vehicles.push(action.payload);
            });
    },
});

export default vehicleSlice.reducer;
export const selectAllVehicles = (state: { vehicles: VehicleState }) => state.vehicles.vehicles;
export const selectVehiclesLoading = (state: { vehicles: VehicleState }) => state.vehicles.loading;
