
// import FlightLeg from "@/components/dashboard/flight-leg/FlightLeg";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function FlightLegPage() {

    return (
        <>
            <PageMeta
                title="Quản lý chặng bay"
                description="Đây là trang quản lý chặng bay"
            />
            <PageBreadcrumb pageTitle="Quản lý chặng bay" />
            {/* <FlightLeg /> */}
        </>
    );
}
