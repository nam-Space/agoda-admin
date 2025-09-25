


import Car from "@/components/dashboard/car/Car";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function CarPage() {

    return (
        <>
            <PageMeta
                title="Quản lý xe"
                description="Đây là trang quản lý xe"
            />
            <PageBreadcrumb pageTitle="Quản lý xe" />
            <Car />
        </>
    );
}
