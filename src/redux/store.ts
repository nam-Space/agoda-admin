import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import accountReducer from "./slice/accountSlide";
import userReducer from "./slice/userSlide";
import countryReducer from "./slice/countrySlide";
import cityReducer from "./slice/citySlide";
import hotelReducer from "./slice/hotelSlide";
import airportReducer from "./slice/airportSlide";
import carReducer from "./slice/carSlide";

export const store = configureStore({
    reducer: {
        account: accountReducer,
        user: userReducer,
        country: countryReducer,
        city: cityReducer,
        hotel: hotelReducer,
        airport: airportReducer,
        car: carReducer,
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
