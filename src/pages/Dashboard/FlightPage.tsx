
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Flight from "@/components/dashboard/flight/Flight";

export default function FlightPage() {

    return (
        <>
            <PageMeta
                title="Quản lý chuyến bay"
                description="Đây là trang quản lý chuyến bay"
            />
            <PageBreadcrumb pageTitle="Quản lý chuyến bay" />
            <Flight />
        </>
    );
}
