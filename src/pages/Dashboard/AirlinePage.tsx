import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Airline from "@/components/dashboard/airline/Airline";

export default function AirlinePage() {

    return (
        <>
            <PageMeta
                title="Quản lý hãng hàng không"
                description="Đây là trang quản lý hãng hàng không"
            />
            <PageBreadcrumb pageTitle="Quản lý hãng hàng không" />
            <Airline />
        </>
    );
}
