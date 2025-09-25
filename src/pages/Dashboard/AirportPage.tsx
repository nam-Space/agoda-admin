


import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Airport from "@/components/dashboard/airport/Airport";

export default function AirportPage() {

    return (
        <>
            <PageMeta
                title="Quản lý sân bay"
                description="Đây là trang quản lý sân bay"
            />
            <PageBreadcrumb pageTitle="Quản lý sân bay" />
            <Airport />
        </>
    );
}
