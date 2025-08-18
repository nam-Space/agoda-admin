/* eslint-disable @typescript-eslint/no-explicit-any */

// Xuất các phương thức để phát sự kiện và lắng nghe sự kiện
export const emitEvent = (event: string, data: any) => {
    const customEvent = new CustomEvent(event, {
        detail: data, // Dữ liệu bạn muốn truyền theo sự kiện
    });
    window.dispatchEvent(customEvent); // Phát sự kiện trên `window`
};

export const onEvent = (event: string, listener: (data: any) => void) => {
    const handler = (e: Event) => {
        listener((e as CustomEvent).detail); // Lấy dữ liệu từ sự kiện
    };

    window.addEventListener(event, handler); // Lắng nghe sự kiện trên `window`

    return () => {
        window.removeEventListener(event, handler); // Xóa event listener khi không còn cần thiết
    };
};
