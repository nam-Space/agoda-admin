/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "./axios.customize";
// user
export const callLogin = ({
    username,
    password,
}: {
    username: string;
    password: string;
}) => {
    return axios.post(`/api/accounts/login/`, {
        username,
        password,
    });
};

export const callRegister = (data: any) => {
    return axios.post(`/api/accounts/register/`, {
        ...data,
    });
};

export const callGetAccount = () => {
    return axios.get(`/api/accounts/profile/`);
};

export const callRefreshToken = (data: any) => {
    return axios.post(`/api/accounts/refresh-token/`, { ...data });
};

export const callLogout = (data: any) => {
    return axios.post(`/api/accounts/logout/`, { ...data });
};
