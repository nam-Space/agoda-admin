





import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import CarPayment from "@/components/payment/car/CarPayment";

export default function CarPaymentPage() {

    return (
        <>
            <PageMeta
                title="Quản lý thanh toán taxi"
                description="Đây là trang quản lý thanh toán taxi"
            />
            <PageBreadcrumb pageTitle="Quản lý thanh toán taxi" />
            <CarPayment />
        </>
    );
}
