import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import accountSlide from "./slice/accountSlide";

export const store = configureStore({
    reducer: {
        account: accountSlide,
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
