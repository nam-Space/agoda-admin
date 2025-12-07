export const PROMOTION_TYPE = {
    HOTEL: 1,
    FLIGHT: 2,
    ACTIVITY: 3,
    CAR: 4,
};

export const PROMOTION_TYPE_VI = {
    [PROMOTION_TYPE.HOTEL]: "Chỗ ở",
    [PROMOTION_TYPE.FLIGHT]: "Chuyến bay",
    [PROMOTION_TYPE.ACTIVITY]: "Hoạt động",
    [PROMOTION_TYPE.CAR]: "Xe",
};

export const PROMOTION_STATUS = {
    ACTIVATED: true,
    DEACTIVATED: false,
};

export const PROMOTION_STATUS_VI = {
    [PROMOTION_STATUS.ACTIVATED + ""]: "Kích hoạt",
    [PROMOTION_STATUS.DEACTIVATED + ""]: "Ngừng hoạt động",
};
