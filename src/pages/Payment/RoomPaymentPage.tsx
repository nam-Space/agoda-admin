



import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import RoomPayment from "@/components/payment/room/RoomPayment";

export default function RoomPaymentPage() {

    return (
        <>
            <PageMeta
                title="Quản lý thanh toán đặt phòng"
                description="Đây là trang quản lý thanh toán đặt phòng"
            />
            <PageBreadcrumb pageTitle="Quản lý thanh toán đặt phòng" />
            <RoomPayment />
        </>
    );
}
