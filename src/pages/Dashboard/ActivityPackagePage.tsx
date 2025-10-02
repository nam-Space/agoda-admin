



import ActivityPackage from "@/components/dashboard/activity-package/ActivityPackage";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function ActivityPackagePage() {

    return (
        <>
            <PageMeta
                title="Quản lý gói của hoạt động"
                description="Đây là trang quản lý gói của hoạt động"
            />
            <PageBreadcrumb pageTitle="Quản lý gói của hoạt động" />
            <ActivityPackage />
        </>
    );
}
