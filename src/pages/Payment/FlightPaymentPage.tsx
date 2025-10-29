




import FlightPayment from "@/components/payment/flight/FlightPayment";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function FlightPaymentPage() {

    return (
        <>
            <PageMeta
                title="Quản lý thanh toán chuyến bay"
                description="Đây là trang quản lý thanh toán chuyến bay"
            />
            <PageBreadcrumb pageTitle="Quản lý thanh toán chuyến bay" />
            <FlightPayment />
        </>
    );
}
