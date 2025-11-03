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
};

export const PAYMENT_STATUS_VI = {
    [PAYMENT_STATUS.PENDING + ""]: "Đang chờ xử lý",
    [PAYMENT_STATUS.SUCCESS + ""]: "Thành công",
    [PAYMENT_STATUS.FAILED + ""]: "Thất bại",
    [PAYMENT_STATUS.CANCELLED + ""]: "Đã hủy",
    [PAYMENT_STATUS.UNPAID + ""]: "Chưa thanh toán",
    [PAYMENT_STATUS.PAID + ""]: "Đã thanh toán",
};
