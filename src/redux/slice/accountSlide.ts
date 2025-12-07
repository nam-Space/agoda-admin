/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { createAsyncThunk, createSlice, Reducer } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { callGetAccount } from "../../config/api";

// First, create the thunk
export const fetchAccount = createAsyncThunk(
    "account/fetchAccount",
    async () => {
        const response = await callGetAccount();
        return response;
    }
);

interface IState {
    isAuthenticated: boolean;
    isLoading: boolean;
    isRefreshToken: boolean;
    errorRefreshToken: string;
    user: {
        id: number;
        username: string;
        email: string;
        first_name: string;
        last_name: string;
        birthDay: null | Date | string;
        phone_number: string;
        gender: string;
        avatar: string;
        role: string;
        manager?: {
            id: number;
            username: string;
            first_name: string;
            last_name: string;
            email: string;
            avatar: string;
            role: string;
            gender: string;
            phone_number: string;
            birthday: string;
        };
        hotel_staffs?: {
            id: number;
            username: string;
            first_name: string;
            last_name: string;
            email: string;
            avatar: string;
            role: string;
            gender: string;
            phone_number: string;
            birthday: string;
        }[];
        hotel?: any;
        flight_operation_manager?: {
            id: number;
            username: string;
            first_name: string;
            last_name: string;
            email: string;
            avatar: string;
            role: string;
            gender: string;
            phone_number: string;
            birthday: string;
        };
        flight_staffs?: {
            id: number;
            username: string;
            first_name: string;
            last_name: string;
            email: string;
            avatar: string;
            role: string;
            gender: string;
            phone_number: string;
            birthday: string;
        }[];
        airline?: any;
    };
    activeMenu: string;
}

const initialState: IState = {
    isAuthenticated: false,
    isLoading: true,
    isRefreshToken: false,
    errorRefreshToken: "",
    user: {
        id: 0,
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        birthDay: null,
        phone_number: "",
        gender: "",
        avatar: "",
        role: "",
        manager: undefined,
        hotel: undefined,
        hotel_staffs: [],
        flight_operation_manager: undefined,
        airline: undefined,
        flight_staffs: [],
    },

    activeMenu: "home",
};

export const accountSlide = createSlice({
    name: "account",
    initialState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {
        // Use the PayloadAction type to declare the contents of `action.payload`
        setActiveMenu: (state, action) => {
            state.activeMenu = action.payload;
        },
        setUserLoginInfo: (state, action) => {
            state.isAuthenticated = true;
            state.isLoading = false;
            state.user.id = action?.payload?.id;
            state.user.username = action?.payload?.username;
            state.user.email = action.payload.email;
            state.user.first_name = action.payload.first_name;
            state.user.last_name = action.payload.last_name;
            state.user.birthDay = action.payload.birthDay;
            state.user.phone_number = action.payload.phone_number;
            state.user.gender = action.payload.gender;
            state.user.avatar = action.payload?.avatar;
            state.user.role = action.payload.role;
            state.user.manager = action.payload.manager;
            state.user.hotel = action.payload.hotel;
            state.user.hotel_staffs = action.payload.hotel_staffs;
            state.user.flight_operation_manager =
                action.payload.flight_operation_manager;
            state.user.airline = action.payload.airline;
            state.user.flight_staffs = action.payload.flight_staffs;
        },
        setLogoutAction: (state, action) => {
            localStorage.removeItem("access_token_agoda_admin");
            Cookies.remove("refresh_token_agoda_admin");
            state.isAuthenticated = false;
            state.user = {
                id: 0,
                username: "",
                email: "",
                first_name: "",
                last_name: "",
                birthDay: null,
                phone_number: "",
                gender: "",
                avatar: "",
                role: "",
                manager: undefined,
                hotel: undefined,
                hotel_staffs: [],
                flight_operation_manager: undefined,
                airline: undefined,
                flight_staffs: [],
            };
        },
        setRefreshTokenAction: (state, action) => {
            state.isRefreshToken = action.payload?.status ?? false;
            state.errorRefreshToken = action.payload?.message ?? "";
        },
    },
    extraReducers: (builder) => {
        // Add reducers for additional action types here, and handle loading state as needed
        builder.addCase(fetchAccount.pending, (state, action) => {
            state.isAuthenticated = false;
            state.isLoading = true;
        });

        builder.addCase(fetchAccount.fulfilled, (state, action: any) => {
            if (action.payload?.isSuccess) {
                state.isAuthenticated = true;
                state.isLoading = false;
                state.user.id = action.payload.data?.id;
                state.user.username = action.payload.data?.username;
                state.user.email = action.payload.data?.email;
                state.user.first_name = action.payload.data?.first_name;
                state.user.last_name = action.payload.data?.last_name;
                state.user.birthDay = action.payload.data?.birthDay;
                state.user.phone_number = action.payload.data?.phone_number;
                state.user.gender = action.payload.data?.gender;
                state.user.avatar = action.payload.data?.avatar;
                state.user.role = action.payload.data?.role;
                state.user.manager = action.payload.data?.manager;
                state.user.hotel = action.payload.data?.hotel;
                state.user.hotel_staffs = action.payload.data?.hotel_staffs;
                state.user.flight_operation_manager =
                    action.payload.data?.flight_operation_manager;
                state.user.airline = action.payload.data?.airline;
                state.user.flight_staffs = action.payload.data?.flight_staffs;
            } else {
                state.isAuthenticated = false;
                state.isLoading = false;
            }
        });

        builder.addCase(fetchAccount.rejected, (state, action) => {
            if (action.payload) {
                state.isAuthenticated = false;
                state.isLoading = false;
            }
        });
    },
});

export const {
    setActiveMenu,
    setUserLoginInfo,
    setLogoutAction,
    setRefreshTokenAction,
} = accountSlide.actions;

export default accountSlide.reducer as Reducer<typeof initialState>;
