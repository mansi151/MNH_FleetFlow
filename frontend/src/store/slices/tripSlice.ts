import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { ActionReducerMapBuilder, PayloadAction } from '@reduxjs/toolkit';
import APICallService from '../../api/apiCallService';
import { TRIPS, CREATE_TRIP, COMPLETE_TRIP, CANCEL_TRIP } from '../../api/apiEndPoints';

export interface Trip {
    _id: string;
    id?: number;
    vehicleId: any;
    driverId: any;
    cargoWeight: number;
    status: 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled';
    startLocation: string;
    endLocation: string;
    estimatedFuelCost?: number;
    dispatchDate?: string;
    completionDate?: string;
    vehicle?:any;
}

interface TripState {
    trips: Trip[];
    loading: boolean;
    error: string | null;
}

const initialState: TripState = {
    trips: [],
    loading: false,
    error: null,
};

export const fetchTrips = createAsyncThunk('trips/fetchTrips', async () => {
    const apiService = new APICallService(TRIPS);
    return await apiService.callAPI();
});

export const createTrip = createAsyncThunk('trips/createTrip', async (data: Partial<Trip>) => {
    const apiService = new APICallService(CREATE_TRIP, data);
    return await apiService.callAPI();
});

export const completeTrip = createAsyncThunk(
    'trips/completeTrip',
    async ({ id, odometer }: { id: string; odometer?: number }) => {
        const apiService = new APICallService(COMPLETE_TRIP, { odometer }, { id: `${id}/complete` });
        return await apiService.callAPI();
    }
);

export const cancelTrip = createAsyncThunk(
    'trips/cancelTrip',
    async (id: string) => {
        const apiService = new APICallService(CANCEL_TRIP, {}, { id: `${id}/cancel` });
        return await apiService.callAPI();
    }
);

const tripSlice = createSlice({
    name: 'trips',
    initialState,
    reducers: {},
    extraReducers: (builder: ActionReducerMapBuilder<TripState>) => {
        builder
            .addCase(fetchTrips.pending, (state) => { state.loading = true; })
            .addCase(fetchTrips.fulfilled, (state, action: PayloadAction<Trip[]>) => {
                state.loading = false;
                state.trips = action.payload;
            })
            .addCase(fetchTrips.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch trips';
            })
            .addCase(createTrip.fulfilled, (state, action: PayloadAction<Trip>) => {
                state.trips.push(action.payload);
            })
            .addCase(completeTrip.fulfilled, (state, action: PayloadAction<Trip>) => {
                const idx = state.trips.findIndex(t =>
                    (t._id || String(t.id)) === (action.payload._id || String(action.payload.id))
                );
                if (idx >= 0) state.trips[idx] = { ...state.trips[idx], status: 'Completed' };
            })
            .addCase(cancelTrip.fulfilled, (state, action: PayloadAction<Trip>) => {
                const idx = state.trips.findIndex(t =>
                    (t._id || String(t.id)) === (action.payload._id || String(action.payload.id))
                );
                if (idx >= 0) state.trips[idx] = { ...state.trips[idx], status: 'Cancelled' };
            });
    },
});

export default tripSlice.reducer;
export const selectAllTrips = (state: { trips: TripState }) => state.trips.trips;
