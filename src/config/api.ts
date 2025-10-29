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
    return axios.delete(`/api/countries/countries/${id}/delete/`);
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
    return axios.delete(`/api/cities/cities/${id}/delete/`);
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

/* Airport */
export const callFetchAirport = (query: string) => {
    return axios.get(`/api/airports/airports/?${query}`);
};

export const callCreateAirport = (data: any) => {
    return axios.post("/api/airports/airports/create/", { ...data });
};

export const callUpdateAirport = (id: number, data: any) => {
    return axios.put(`/api/airports/airports/${id}/update/`, { ...data });
};

export const callDeleteAirport = (id: number) => {
    return axios.delete(`/api/airports/airports/${id}/delete/`);
};

// Car
export const callFetchCar = (query: string) => {
    return axios.get(`/api/cars/cars/?${query}`);
};

export const callCreateCar = (data: any) => {
    return axios.post("/api/cars/cars/create/", { ...data });
};

export const callUpdateCar = (id: number, data: any) => {
    return axios.put(`/api/cars/cars/${id}/update/`, { ...data });
};

export const callDeleteCar = (id: number) => {
    return axios.delete(`/api/cars/cars/${id}/delete/`);
};

// Activity
export const callFetchActivity = (query: string) => {
    return axios.get(`/api/activities/activities/?${query}`);
};

export const callCreateActivity = (data: any) => {
    return axios.post("/api/activities/activities/create/", { ...data });
};

export const callUpdateActivity = (id: number, data: any) => {
    return axios.put(`/api/activities/activities/${id}/update/`, { ...data });
};

export const callDeleteActivity = (id: number) => {
    return axios.delete(`/api/activities/activities/${id}/delete/`);
};

export const callDeleteActivityImage = (id: number) => {
    return axios.delete(`/api/activities/activity-images/${id}/delete/`);
};

// Activity Package
export const callFetchActivityPackage = (query: string) => {
    return axios.get(`/api/activities/activities-packages/?${query}`);
};

export const callCreateActivityPackage = (data: any) => {
    return axios.post("/api/activities/activities-packages/create/", {
        ...data,
    });
};

export const callUpdateActivityPackage = (id: number, data: any) => {
    return axios.put(`/api/activities/activities-packages/${id}/update/`, {
        ...data,
    });
};

export const callDeleteActivityPackage = (id: number) => {
    return axios.delete(`/api/activities/activities-packages/${id}/delete/`);
};

// Activity Date
export const callFetchActivityDate = (query: string) => {
    return axios.get(`/api/activities/activities-dates/?${query}`);
};

export const callCreateActivityDate = (data: any) => {
    return axios.post("/api/activities/activities-dates/create/", {
        ...data,
    });
};

export const callCreateBulkActivityDate = (data: any) => {
    return axios.post("/api/activities/activities-dates/create/bulk/", {
        ...data,
    });
};

export const callUpdateActivityDate = (id: number, data: any) => {
    return axios.put(`/api/activities/activities-dates/${id}/update/`, {
        ...data,
    });
};

export const callDeleteActivityDate = (id: number) => {
    return axios.delete(`/api/activities/activities-dates/${id}/delete/`);
};

export const callDeleteBulkActivityDate = (ids: number[]) => {
    return axios.delete(`/api/activities/activity-dates/bulk-delete/`, {
        data: { ids },
    });
};

// Chat
export const callFetchConversation = (query: string) => {
    return axios.get(`/api/chats/conversations/?${query}`);
};

export const callGetOrCreateConversation = (data: any) => {
    return axios.post(`/api/chats/conversations/get_or_create/`, { ...data });
};

export const callFetchMessage = (conversationId: string) => {
    return axios.get(`/api/chats/messages/${conversationId}/`);
};

// Payment
export const callFetchPayment = (query: string) => {
    return axios.get(`/api/payments/payments/?${query}`);
};

export const callCreatePayment = (data: any) => {
    return axios.post("/api/payments/payments/create/", { ...data });
};

export const callUpdatePayment = (id: number, data: any) => {
    return axios.put(`/api/payments/payments/${id}/update/`, { ...data });
};

export const callDeletePayment = (id: number) => {
    return axios.delete(`/api/payments/payments/${id}/delete/`);
};
