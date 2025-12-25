export const SERVICE_TYPE = {
    HOTEL: 1,
    CAR: 2,
    FLIGHT: 3,
    ACTIVITY: 4,
};

export const SERVICE_TYPE_VI = {
    [SERVICE_TYPE.HOTEL]: "Khách sạn",
    [SERVICE_TYPE.CAR]: "Taxi",
    [SERVICE_TYPE.FLIGHT]: "Chuyến bay",
    [SERVICE_TYPE.ACTIVITY]: "Hoạt động",
};

export const CAR_BOOKING_STATUS = {
    STARTING: 0,
    PICKED: 1,
    MOVING: 2,
    ARRIVED: 3,
};

export const CAR_BOOKING_STATUS_VI = {
    [CAR_BOOKING_STATUS.STARTING + ""]: "Bắt đầu",
    [CAR_BOOKING_STATUS.PICKED + ""]: "Đã đón khách",
    [CAR_BOOKING_STATUS.MOVING + ""]: "Đang di chuyển",
    [CAR_BOOKING_STATUS.ARRIVED + ""]: "Đã đến nơi",
};
