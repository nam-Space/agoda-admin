



import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import CarJourney from "@/components/dashboard/car-journey/CarJourney";

export default function CarJourneyPage() {

    return (
        <>
            <PageMeta
                title="Quản lý chuyến taxi"
                description="Đây là trang quản lý chuyến taxi"
            />
            <PageBreadcrumb pageTitle="Quản lý chuyến taxi" />
            <CarJourney />
        </>
    );
}
