import {
    UserOutlined,
    TeamOutlined,
    CarOutlined,
    HomeOutlined,
    CalendarOutlined,
    RocketOutlined,
    TagOutlined,
} from "@ant-design/icons";

export const ROLE = {
    ADMIN: "admin",
    HOTEL_STAFF: "hotel_staff",
    CUSTOMER: "customer",
    DRIVER: "driver",
    OWNER: "owner",
    EVENT_ORGANIZER: "event_organizer",
    MARKETING_MANAGER: "marketing_manager",
    FLIGHT_OPERATION_STAFF: "flight_operations_staff",
    AIRLINE_TICKETING_STAFF: "airline_ticketing_staff",
};

export const ROLE_VI = {
    [ROLE.ADMIN]: "Quản trị viên",
    [ROLE.HOTEL_STAFF]: "Nhân viên khách sạn",
    [ROLE.CUSTOMER]: "Khách hàng",
    [ROLE.DRIVER]: "Tài xế",
    [ROLE.OWNER]: "Chủ khách sạn",
    [ROLE.EVENT_ORGANIZER]: "Người tổ chức sự kiện",
    [ROLE.MARKETING_MANAGER]: "Người quản lý Marketing",
    [ROLE.FLIGHT_OPERATION_STAFF]: "Nhân viên vận hành máy bay",
    [ROLE.AIRLINE_TICKETING_STAFF]: "Nhân viên bán vé máy bay",
};

export const ROLE_UI = {
    [ROLE.ADMIN]: { color: "bg-red-500", icon: UserOutlined },
    [ROLE.HOTEL_STAFF]: { color: "bg-blue-500", icon: TeamOutlined },
    [ROLE.CUSTOMER]: { color: "bg-gray-600", icon: UserOutlined },
    [ROLE.DRIVER]: { color: "bg-green-600", icon: CarOutlined },
    [ROLE.OWNER]: { color: "bg-purple-600", icon: HomeOutlined },
    [ROLE.EVENT_ORGANIZER]: { color: "bg-orange-500", icon: CalendarOutlined },
    [ROLE.MARKETING_MANAGER]: { color: "bg-pink-500", icon: TagOutlined },
    [ROLE.FLIGHT_OPERATION_STAFF]: {
        color: "bg-indigo-500",
        icon: RocketOutlined,
    },
    [ROLE.AIRLINE_TICKETING_STAFF]: {
        color: "bg-teal-500",
        icon: RocketOutlined,
    },
};

export const STATUS_USER = {
    IS_ACTIVE: true,
    DE_ACTIVE: false,
};

export const STATUS_USER_VI = {
    [STATUS_USER.IS_ACTIVE + ""]: "Đã kích hoạt",
    [STATUS_USER.DE_ACTIVE + ""]: "Vô hiệu hóa",
};
