

import Country from "@/components/dashboard/country/Country";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function CountryPage() {

    return (
        <>
            <PageMeta
                title="Quản lý đất nước"
                description="Đây là trang quản lý đất nước"
            />
            <PageBreadcrumb pageTitle="Quản lý đất nước" />
            <Country />
        </>
    );
}
