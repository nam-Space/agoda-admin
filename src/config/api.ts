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

// Room
export const callFetchRoomAdmin = (query: string) => {
  return axios.get(`/api/rooms/rooms-admin/?${query}`);
};

export const callCreateRoom = (data: any) => {
  return axios.post("/api/rooms/rooms/create/", { ...data });
};

export const callUpdateRoom = (id: number, data: any) => {
  return axios.put(`/api/rooms/rooms/${id}/update/`, { ...data });
};

export const callDeleteRoom = (id: number) => {
  return axios.delete(`/api/rooms/rooms/${id}/delete/`);
};

// Room amenity
export const callFetchRoomAmenity = (query: string) => {
  return axios.get(`/api/rooms/amenities/?${query}`);
};

export const callCreateRoomAmenity = (data: any) => {
  return axios.post("/api/rooms/amenities/create/", { ...data });
};

export const callUpdateRoomAmenity = (id: number, data: any) => {
  return axios.put(`/api/rooms/amenities/${id}/update/`, { ...data });
};

export const callDeleteRoomAmenity = (id: number) => {
  return axios.delete(`/api/rooms/amenities/${id}/delete/`);
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

/* Airline */
export const callFetchAirline = (query: string) => {
  return axios.get(`/api/airlines/?${query}`);
};

export const callCreateAirline = (data: any) => {
  return axios.post("/api/airlines/", { ...data });
};

export const callUpdateAirline = (id: number, data: any) => {
  return axios.put(`/api/airlines/${id}/`, { ...data });
};

export const callDeleteAirline = (id: number) => {
  return axios.delete(`/api/airlines/${id}/`);
};

/* Aircraft */
export const callFetchAircraft = (query: string) => {
  return axios.get(`/api/airlines/aircrafts/?${query}`);
};

export const callCreateAircraft = (data: any) => {
  return axios.post("/api/airlines/aircrafts/", { ...data });
};

export const callUpdateAircraft = (id: number, data: any) => {
  return axios.put(`/api/airlines/aircrafts/${id}/`, { ...data });
};

export const callDeleteAircraft = (id: number) => {
  return axios.delete(`/api/airlines/aircrafts/${id}/`);
};

/* Flight */
export const callFetchFlight = (query: string) => {
  return axios.get(`/api/flights/flights-for-admin/?${query}`);
};

export const callCreateFlight = (data: any) => {
  return axios.post("/api/flights/", { ...data });
};

export const callUpdateFlight = (id: number, data: any) => {
  return axios.put(`/api/flights/${id}/`, { ...data });
};

export const callDeleteFlight = (id: number) => {
  return axios.delete(`/api/flights/${id}/`);
};

/* Flight leg */
export const callFetchFlightLeg = (query: string) => {
  return axios.get(`/api/flights/legs/?${query}`);
};

export const callCreateFlightLeg = (data: any) => {
  return axios.post("/api/flights/legs/", { ...data });
};

export const callUpdateFlightLeg = (id: number, data: any) => {
  return axios.put(`/api/flights/legs/${id}/`, { ...data });
};

export const callDeleteFlightLeg = (id: number) => {
  return axios.delete(`/api/flights/legs/${id}/`);
};

/* Seat class pricing */
export const callFetchSeatClassPricing = (query: string) => {
  return axios.get(`/api/flights/seat-classes/?${query}`);
};

export const callCreateSeatClassPricing = (data: any) => {
  return axios.post("/api/flights/seat-classes/", { ...data });
};

export const callUpdateSeatClassPricing = (id: number, data: any) => {
  return axios.put(`/api/flights/seat-classes/${id}/`, { ...data });
};

export const callDeleteSeatClassPricing = (id: number) => {
  return axios.delete(`/api/flights/seat-classes/${id}/`);
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
  return axios.delete(`/api/activities/activities-dates/bulk-delete/`, {
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
export const callUpdateCarBooking = (id: number, data: any) => {
  return axios.put(`/api/cars/cars-booking/${id}/update/`, { ...data });
};

// Payment
export const callFetchPayment = (query: string) => {
  return axios.get(`/api/payments/payments/?${query}`);
};

export const callFetchPaymentOverview = (query: string) => {
  return axios.get(`/api/payments/payments/overview/?${query}`);
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

// Handbook
export const callFetchHandbook = (query: string) => {
  return axios.get(`/api/handbooks/handbooks/?${query}`);
};

export const callCreateHandbook = (data: any) => {
  return axios.post("/api/handbooks/handbooks/create/", { ...data });
};

export const callUpdateHandbook = (id: number, data: any) => {
  return axios.put(`/api/handbooks/handbooks/${id}/update/`, { ...data });
};

export const callDeleteHandbook = (id: number) => {
  return axios.delete(`/api/handbooks/handbooks/${id}/delete/`);
};

// Promotion
export const callFetchPromotion = (query: string) => {
  return axios.get(`/api/promotions/promotions-admin/?${query}`);
};

export const callCreatePromotion = (data: any) => {
  return axios.post("/api/promotions/create-details/", { ...data });
};

export const callUpdatePromotion = (id: number, data: any) => {
  return axios.put(`/api/promotions/promotions/${id}/update/`, { ...data });
};

export const callDeletePromotion = (id: number) => {
  return axios.delete(`/api/promotions/promotions/${id}/delete/`);
};

// Room Promotion
export const callFetchRoomPromotion = (query: string) => {
  return axios.get(`/api/promotions/room-promotions/?${query}`);
};

export const callCreateRoomPromotion = (data: any) => {
  return axios.post("/api/promotions/room-promotions/create/", { ...data });
};

export const callUpdateRoomPromotion = (id: number, data: any) => {
  return axios.put(`/api/promotions/room-promotions/${id}/update/`, {
    ...data,
  });
};

export const callDeleteRoomPromotion = (id: number) => {
  return axios.delete(`/api/promotions/room-promotions/${id}/delete/`);
};

// Car Promotion
export const callFetchCarPromotion = (query: string) => {
  return axios.get(`/api/promotions/car-promotions/?${query}`);
};

export const callCreateCarPromotion = (data: any) => {
  return axios.post("/api/promotions/car-promotions/create/", { ...data });
};

export const callUpdateCarPromotion = (id: number, data: any) => {
  return axios.put(`/api/promotions/car-promotions/${id}/update/`, {
    ...data,
  });
};

export const callDeleteCarPromotion = (id: number) => {
  return axios.delete(`/api/promotions/car-promotions/${id}/delete/`);
};

// Flight Promotion
export const callFetchFlightPromotion = (query: string) => {
  return axios.get(`/api/promotions/flight-promotions/?${query}`);
};

export const callCreateFlightPromotion = (data: any) => {
  return axios.post("/api/promotions/flight-promotions/create/", { ...data });
};

export const callUpdateFlightPromotion = (id: number, data: any) => {
  return axios.put(`/api/promotions/flight-promotions/${id}/update/`, {
    ...data,
  });
};

export const callDeleteFlightPromotion = (id: number) => {
  return axios.delete(`/api/promotions/flight-promotions/${id}/delete/`);
};

// Activity Promotion
export const callFetchActivityPromotion = (query: string) => {
  return axios.get(`/api/promotions/activity-promotions/?${query}`);
};

export const callCreateActivityPromotion = (data: any) => {
  return axios.post("/api/promotions/activity-promotions/create/", {
    ...data,
  });
};

export const callCreateBulkActivityPromotion = (data: any) => {
  return axios.post("/api/promotions/activity-promotions/create/bulk/", {
    ...data,
  });
};

export const callUpdateActivityPromotion = (id: number, data: any) => {
  return axios.put(`/api/promotions/activity-promotions/${id}/update/`, {
    ...data,
  });
};

export const callDeleteActivityPromotion = (id: number) => {
  return axios.delete(`/api/promotions/activity-promotions/${id}/delete/`);
};

export const callDeleteBulkActivityPromotion = (ids: number[]) => {
  return axios.delete(`/api/promotions/activity-promotions/bulk-delete/`, {
    data: { ids },
  });
};

// Chatbot
export const callFetchSession = async (body: any) => {
  return axios.post(`/api/chatbots/session/`, { ...body });
};

export const callCreateNewChat = async (body: any) => {
  return axios.post(`/api/chatbots/new/`, { ...body });
};

export const callFetchChatbotMessages = async (query: string) => {
  return axios.get(`/api/chatbots/messages/?${query}`);
};

// Physical room
export const callFetchPhysicalRoom = (query: string) => {
  return axios.get(`/api/rooms/physical-rooms/?${query}`);
};

export const callCreatePhysicalRoom = (data: any) => {
  return axios.post("/api/rooms/physical-rooms/create/", { ...data });
};

export const callUpdatePhysicalRoom = (id: number, data: any) => {
  return axios.put(`/api/rooms/physical-rooms/${id}/`, { ...data });
};

export const callDeletePhysicalRoom = (id: number) => {
  return axios.delete(`/api/rooms/physical-rooms/${id}/`);
};

// Flight seat
export const callFetchFlightSeat = (query: string) => {
  return axios.get(`/api/flights/flight-seats/?${query}`);
};

export const callCreateFlightSeat = (data: any) => {
  return axios.post("/api/flights/flight-seats/create/", { ...data });
};

export const callUpdateFlightSeat = (id: number, data: any) => {
  return axios.put(`/api/flights/flight-seats/${id}/`, { ...data });
};

export const callDeleteFlightSeat = (id: number) => {
  return axios.delete(`/api/flights/flight-seats/${id}/`);
};
