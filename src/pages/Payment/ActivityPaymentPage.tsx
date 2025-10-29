



import ActivityPayment from "@/components/payment/activity/ActivityPayment";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function ActivityPaymentPage() {

    return (
        <>
            <PageMeta
                title="Quản lý thanh toán hoạt động"
                description="Đây là trang quản lý thanh toán hoạt động"
            />
            <PageBreadcrumb pageTitle="Quản lý thanh toán hoạt động" />
            <ActivityPayment />
        </>
    );
}
