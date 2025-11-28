import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import accountReducer from "./slice/accountSlide";
import userReducer from "./slice/userSlide";
import countryReducer from "./slice/countrySlide";
import cityReducer from "./slice/citySlide";
import hotelReducer from "./slice/hotelSlide";
import airportReducer from "./slice/airportSlide";
import carReducer from "./slice/carSlide";
import activityReducer from "./slice/activitySlide";
import activityPackageReducer from "./slice/activityPackageSlide";
import activityDateReducer from "./slice/activityDateSlide";
import conversationReducer from "./slice/conversationSlide";
import paymentReducer from "./slice/paymentSlide";
import handbookReducer from "./slice/handbookSlide";
import airlineReducer from "./slice/airlineSlide";
import aircraftReducer from "./slice/aircraftSlide";
import flightReducer from "./slice/flightSlide";
import flightLegReducer from "./slice/flightLegSlide";
import roomReducer from "./slice/roomSlide";

export const store = configureStore({
    reducer: {
        account: accountReducer,
        user: userReducer,
        country: countryReducer,
        city: cityReducer,
        hotel: hotelReducer,
        airport: airportReducer,
        car: carReducer,
        activity: activityReducer,
        activityPackage: activityPackageReducer,
        activityDate: activityDateReducer,
        conversation: conversationReducer,
        payment: paymentReducer,
        handbook: handbookReducer,
        airline: airlineReducer,
        aircraft: aircraftReducer,
        flight: flightReducer,
        flightLeg: flightLegReducer,
        room: roomReducer,
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
