

import Country from "@/components/dashboard/country/Country";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import City from "@/components/dashboard/city/City";

export default function CityPage() {

    return (
        <>
            <PageMeta
                title="Quản lý thành phố"
                description="Đây là trang quản lý thành phố"
            />
            <PageBreadcrumb pageTitle="Quản lý thành phố" />
            <City />
        </>
    );
}
