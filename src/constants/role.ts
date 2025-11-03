export const ROLE = {
    ADMIN: "admin",
    STAFF: "staff",
    CUSTOMER: "customer",
    DRIVER: "driver",
    OWNER: "owner",
    EVENT_ORGANIZER: "event_organizer",
};

export const ROLE_VI = {
    admin: "Quản trị viên",
    staff: "Nhân viên",
    driver: "Tài xế",
    customer: "Khách hàng",
    owner: "Chủ khách sạn",
    event_organizer: "Người tổ chức sự kiện",
};

export const STATUS_USER = {
    IS_ACTIVE: true,
    DE_ACTIVE: false,
};

export const STATUS_USER_VI = {
    [STATUS_USER.IS_ACTIVE + ""]: "Đã kích hoạt",
    [STATUS_USER.DE_ACTIVE + ""]: "Vô hiệu hóa",
};
