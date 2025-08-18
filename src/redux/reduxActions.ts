// redux/reduxActions.ts
import { store } from "./store";
import { setRefreshTokenAction } from "./slice/accountSlide";

export const dispatchRefreshTokenAction = (
    status: boolean,
    message: string
) => {
    store.dispatch(setRefreshTokenAction({ status, message }));
};
