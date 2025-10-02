




import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ActivityDate from "@/components/dashboard/activity-date/ActivityDate";

export default function ActivityDatePage() {

    return (
        <>
            <PageMeta
                title="Quản lý các ngày trong gói của hoạt động"
                description="Đây là trang quản lý các ngày trong gói của hoạt động"
            />
            <PageBreadcrumb pageTitle="Quản lý các ngày trong gói của hoạt động" />
            <ActivityDate />
        </>
    );
}
