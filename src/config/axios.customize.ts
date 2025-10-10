/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { callRefreshToken } from "./api";
import Cookies from "js-cookie";
import { emitEvent } from "../utils/eventEmitter";
import { toast } from "react-toastify";

const instance = axios.create({
    baseURL: import.meta.env.VITE_BE_URL,
    timeout: 60 * 1000, //60s
});

// Add a request interceptor
instance.interceptors.request.use(
    function (config) {
        // Do something before request is sent
        // config.headers["delay"] = 3000;
        const access_token = localStorage.getItem("access_token_agoda_admin");
        if (access_token) {
            config.headers["Authorization"] = `Bearer ${access_token}`;
        }
        return config;
    },
    function (error) {
        // Do something with request error
        return Promise.reject(error);
    }
);

// Add a response interceptor
instance.interceptors.response.use(
    function (response) {
        // Any status code that lie within the range of 2xx cause this function to trigger
        // Do something with response data
        if (response.data) return response.data;
        return response;
    },
    async function (error) {
        if (error.response.status === 500) {
            toast.error(error?.message, {
                position: "bottom-right",
            });
        }

        if (
            error.response.status === 401 &&
            error.config.url !== "/api/accounts/login/"
        ) {
            const refresh_token_agoda = Cookies.get(
                "refresh_token_agoda_admin"
            );
            const res: any = await callRefreshToken({
                refresh: refresh_token_agoda,
            });

            if (res.isSuccess) {
                error.config.headers[
                    "Authorization"
                ] = `Bearer ${res.data.access}`;
                localStorage.setItem(
                    "access_token_agoda_admin",
                    res.data.access
                );

                return instance.request(error.config);
            }
        }

        if (
            error.response.status === 400 &&
            error.config.url === "/api/accounts/refresh-token/"
        ) {
            const message =
                error?.response?.data?.message ??
                "Có lỗi xảy ra, vui lòng login.";
            emitEvent("REFRESH_TOKEN_FAILED", message);
        }

        if (error?.response?.data) return error?.response?.data;
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        // Do something with response error
        return Promise.reject(error);
    }
);

/**
 * Replaces main `axios` instance with the custom-one.
 *
 * @param cfg - Axios configuration object.
 * @returns A promise object of a response of the HTTP request with the 'data' object already
 * destructured.
 */
// const axios = <T>(cfg: AxiosRequestConfig) => instance.request<any, T>(cfg);

// export default axios;

export default instance;
