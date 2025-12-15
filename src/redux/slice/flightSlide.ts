/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { callFetchFlight } from "@/config/api";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
interface IState {
    isFetching: boolean;
    meta: {
        itemsPerPage: number;
        totalItems: number;
        currentPage: number;
        totalPages: number;
    };
    data: any;
}
// First, create the thunk
export const fetchFlight = createAsyncThunk(
    "flight/fetchFlight",
    async ({ query }: { query: string }) => {
        const response = await callFetchFlight(query);
        return response;
    }
);

const initialState: IState = {
    isFetching: true,
    meta: {
        currentPage: 1,
        itemsPerPage: 10,
        totalPages: 0,
        totalItems: 0,
    },
    data: [],
};

export const flightSlide = createSlice({
    name: "flight",
    initialState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {
        // Use the PayloadAction type to declare the contents of `action.payload`
        setActiveMenu: (_state, _action) => {
            // state.activeMenu = action.payload;
        },
    },
    extraReducers: (builder) => {
        // Add reducers for additional action types here, and handle loading state as needed
        builder.addCase(fetchFlight.pending, (state, _action) => {
            state.isFetching = true;
            // Add user to the state array
            // state.courseOrder = action.payload;
        });

        builder.addCase(fetchFlight.rejected, (state, _action) => {
            state.isFetching = false;
            // Add user to the state array
            // state.courseOrder = action.payload;
        });

        builder.addCase(fetchFlight.fulfilled, (state, action: any) => {
            if (action.payload?.isSuccess) {
                state.isFetching = false;
                state.meta = action.payload.meta;
                state.data = action.payload.data;
            }
            // Add user to the state array

            // state.courseOrder = action.payload;
        });
    },
});

export const { setActiveMenu } = flightSlide.actions;

export default flightSlide.reducer;
