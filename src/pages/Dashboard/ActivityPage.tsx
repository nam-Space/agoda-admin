



import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Activity from "@/components/dashboard/activity/Activity";

export default function ActivityPage() {

    return (
        <>
            <PageMeta
                title="Quản lý hoạt động"
                description="Đây là trang quản lý hoạt động"
            />
            <PageBreadcrumb pageTitle="Quản lý hoạt động" />
            <Activity />
        </>
    );
}
