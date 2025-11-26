import Aircraft from "@/components/dashboard/aircraft/Aircraft";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function AircraftPage() {

    return (
        <>
            <PageMeta
                title="Quản lý máy bay"
                description="Đây là trang quản lý máy bay"
            />
            <PageBreadcrumb pageTitle="Quản lý máy bay" />
            <Aircraft />
        </>
    );
}
