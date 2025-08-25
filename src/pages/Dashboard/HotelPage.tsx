


import Hotel from "@/components/dashboard/hotel/Hotel";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function HotelPage() {

    return (
        <>
            <PageMeta
                title="Quản lý khách sạn"
                description="Đây là trang quản lý khách sạn"
            />
            <PageBreadcrumb pageTitle="Quản lý khách sạn" />
            <Hotel />
        </>
    );
}
