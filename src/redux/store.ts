import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import accountReducer from "./slice/accountSlide";
import userReducer from "./slice/userSlide";
import countryReducer from "./slice/countrySlide";
import cityReducer from "./slice/citySlide";
import hotelReducer from "./slice/hotelSlide";

export const store = configureStore({
    reducer: {
        account: accountReducer,
        user: userReducer,
        country: countryReducer,
        city: cityReducer,
        hotel: hotelReducer,
    },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>;
