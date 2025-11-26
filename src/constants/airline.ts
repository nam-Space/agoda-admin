export const AIRCRAFT_STATUS = {
    ACTIVE: true,
    UNACTIVE: false,
};

export const AIRCRAFT_STATUS_VI = {
    [AIRCRAFT_STATUS.ACTIVE + ""]: "Đang hoạt động",
    [AIRCRAFT_STATUS.UNACTIVE + ""]: "Ngừng hoạt động",
};

export const BAGGAGE_INCLUDED = {
    YES: true,
    NO: false,
};

export const BAGGAGE_INCLUDED_VI = {
    [BAGGAGE_INCLUDED.YES + ""]: "Có",
    [BAGGAGE_INCLUDED.NO + ""]: "Không",
};

export const SEAT_CLASS = {
    economy: "economy",
    business: "business",
    first: "first",
};

export const SEAT_CLASS_VI = {
    [SEAT_CLASS.economy]: "Hạng phổ thông",
    [SEAT_CLASS.business]: "Hạng thượng gia",
    [SEAT_CLASS.first]: "Hạng nhất",
};

export const HAS_MEAL = {
    YES: true,
    NO: false,
};

export const HAS_MEAL_VI = {
    [HAS_MEAL.YES + ""]: "Có",
    [HAS_MEAL.NO + ""]: "Không",
};

export const HAS_FREE_DRINK = {
    YES: true,
    NO: false,
};

export const HAS_FREE_DRINK_VI = {
    [HAS_FREE_DRINK.YES + ""]: "Có",
    [HAS_FREE_DRINK.NO + ""]: "Không",
};

export const HAS_LOUNGE_ACCESS = {
    YES: true,
    NO: false,
};

export const HAS_LOUNGE_ACCESS_VI = {
    [HAS_LOUNGE_ACCESS.YES + ""]: "Có",
    [HAS_LOUNGE_ACCESS.NO + ""]: "Không",
};

export const HAS_POWER_OUTLET = {
    YES: true,
    NO: false,
};

export const HAS_POWER_OUTLET_VI = {
    [HAS_POWER_OUTLET.YES + ""]: "Có",
    [HAS_POWER_OUTLET.NO + ""]: "Không",
};

export const HAS_PRIORITY_BOARDING = {
    YES: true,
    NO: false,
};

export const HAS_PRIORITY_BOARDING_VI = {
    [HAS_PRIORITY_BOARDING.YES + ""]: "Có",
    [HAS_PRIORITY_BOARDING.NO + ""]: "Không",
};
