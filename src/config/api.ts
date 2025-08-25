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

export const callFetchUser = (query: string) => {
    return axios.get(`/api/accounts/users?${query}`);
};

export const callCreateUser = (user: any) => {
    return axios.post("/api/accounts/users/create/", { ...user });
};

export const callUpdateUser = (id: number, user: any) => {
    return axios.put(`/api/accounts/users/${id}/update/`, { ...user });
};

export const callDeleteUser = (id: number) => {
    return axios.delete(`/api/accounts/users/${id}/delete/`);
};

export const callUploadSingleImage = ({ file, type }: any) => {
    const bodyFormData = new FormData();
    bodyFormData.append("image", file);
    return axios({
        method: "post",
        url: `/api/images/upload-image/?type=${type}`,
        data: bodyFormData,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

/* Countries */
export const callFetchCountry = (query: string) => {
    return axios.get(`/api/countries/countries/?${query}`);
};

export const callCreateCountry = (data: any) => {
    return axios.post("/api/countries/countries/create/", { ...data });
};

export const callUpdateCountry = (id: number, data: any) => {
    return axios.put(`/api/countries/countries/${id}/update/`, { ...data });
};

export const callDeleteCountry = (id: number) => {
    return axios.delete(`/api/countries/${id}/delete/`);
};

// City
export const callFetchCity = (query: string) => {
    return axios.get(`/api/cities/cities/?${query}`);
};

export const callCreateCity = (data: any) => {
    return axios.post("/api/cities/cities/create/", { ...data });
};

export const callUpdateCity = (id: number, data: any) => {
    return axios.put(`/api/cities/cities/${id}/update/`, { ...data });
};

export const callDeleteCity = (id: number) => {
    return axios.delete(`/api/cities/${id}/delete/`);
};

// Hotel
export const callFetchHotel = (query: string) => {
    return axios.get(`/api/hotels/hotels/?${query}`);
};

export const callCreateHotel = (data: any) => {
    return axios.post("/api/hotels/hotels/create/", { ...data });
};

export const callUpdateHotel = (id: number, data: any) => {
    return axios.put(`/api/hotels/hotels/${id}/update/`, { ...data });
};

export const callDeleteHotel = (id: number) => {
    return axios.delete(`/api/hotels/hotels/${id}/delete/`);
};

export const callDeleteHotelImage = (id: number) => {
    return axios.delete(`/api/hotels/hotel-images/${id}/delete/`);
};
