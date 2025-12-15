/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { callFetchConversation } from "@/config/api";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// First, create the thunk
export const fetchConversation = createAsyncThunk(
    "conversation/fetchConversation",
    async ({ query }: any) => {
        const response = await callFetchConversation(query);
        return response;
    }
);

const initialState = {
    isFetching: true,
    meta: {
        currentPage: 1,
        itemsPerPage: 10,
        totalPages: 0,
        totalItems: 0,
    },
    data: [],
};

export const conversationSlide = createSlice({
    name: "conversation",
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
        builder.addCase(fetchConversation.pending, (state, _action) => {
            state.isFetching = true;
            // Add user to the state array
            // state.courseOrder = action.payload;
        });

        builder.addCase(fetchConversation.rejected, (state, _action) => {
            state.isFetching = false;
            // Add user to the state array
            // state.courseOrder = action.payload;
        });

        builder.addCase(fetchConversation.fulfilled, (state, action: any) => {
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

export const { setActiveMenu } = conversationSlide.actions;

export default conversationSlide.reducer;
