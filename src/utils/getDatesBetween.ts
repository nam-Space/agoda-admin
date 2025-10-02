export const getDatesBetween = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const result = [];

    const current = new Date(start);
    while (current <= end) {
        result.push(current.toISOString().split("T")[0]); // định dạng yyyy-MM-dd
        current.setDate(current.getDate() + 1); // cộng thêm 1 ngày
    }

    return result;
};
