/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { callFetchCountry } from "@/config/api";
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
export const fetchCountry = createAsyncThunk(
    "user/fetchCountry",
    async ({ query }: { query: string }) => {
        const response = await callFetchCountry(query);
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

export const countrySlide = createSlice({
    name: "country",
    initialState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {
        // Use the PayloadAction type to declare the contents of `action.payload`
        setActiveMenu: (state, action) => {
            // state.activeMenu = action.payload;
        },
    },
    extraReducers: (builder) => {
        // Add reducers for additional action types here, and handle loading state as needed
        builder.addCase(fetchCountry.pending, (state, action) => {
            state.isFetching = true;
            // Add user to the state array
            // state.courseOrder = action.payload;
        });

        builder.addCase(fetchCountry.rejected, (state, action) => {
            state.isFetching = false;
            // Add user to the state array
            // state.courseOrder = action.payload;
        });

        builder.addCase(fetchCountry.fulfilled, (state, action: any) => {
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

export const { setActiveMenu } = countrySlide.actions;

export default countrySlide.reducer;
