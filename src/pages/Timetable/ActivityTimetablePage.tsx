




import ActivityTimetable from "@/components/timetable/ActivityTimetable";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function ActivityTimetablePage() {

    return (
        <>
            <PageMeta
                title="Quản lý thời khóa biểu hoạt động"
                description="Đây là trang quản lý thời khóa biểu hoạt động"
            />
            <PageBreadcrumb pageTitle="Quản lý thời khóa biểu hoạt động" />
            <ActivityTimetable />
        </>
    );
}
