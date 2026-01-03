export const PAYMENT_METHOD = {
    ONLINE: 1,
    CASH: 2,
};

export const PAYMENT_METHOD_VI = {
    [PAYMENT_METHOD.ONLINE + ""]: "Thanh toán trực tuyến",
    [PAYMENT_METHOD.CASH + ""]: "Tranh toán tiền mặt",
};

export const PAYMENT_STATUS = {
    PENDING: 1,
    SUCCESS: 2,
    FAILED: 3,
    CANCELLED: 4,
    UNPAID: 5,
    PAID: 6,
    REFUND: 7,
    REBOOKED: 8,
};

export const PAYMENT_STATUS_VI = {
    [PAYMENT_STATUS.PENDING + ""]: "Đang chờ xử lý",
    [PAYMENT_STATUS.SUCCESS + ""]: "Thành công",
    [PAYMENT_STATUS.FAILED + ""]: "Thất bại",
    [PAYMENT_STATUS.CANCELLED + ""]: "Đã hủy",
    [PAYMENT_STATUS.UNPAID + ""]: "Chưa thanh toán",
    [PAYMENT_STATUS.PAID + ""]: "Đã thanh toán",
    [PAYMENT_STATUS.REFUND + ""]: "Đã hoàn tiền",
    [PAYMENT_STATUS.REBOOKED + ""]: "Đã đặt lại",
};

export const PAYMENT_STATUS_COLOR = {
    [PAYMENT_STATUS.PENDING]: "blue",
    [PAYMENT_STATUS.SUCCESS]: "green",
    [PAYMENT_STATUS.FAILED]: "red",
    [PAYMENT_STATUS.CANCELLED]: "default",
    [PAYMENT_STATUS.UNPAID]: "orange",
    [PAYMENT_STATUS.PAID]: "green",
    [PAYMENT_STATUS.REFUND]: "pink",
    [PAYMENT_STATUS.REBOOKED]: "purple",
};
