





import RoomTimetable from "@/components/timetable/RoomTimetable";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function RoomTimetablePage() {

    return (
        <>
            <PageMeta
                title="Quản lý thời khóa biểu khách sạn"
                description="Đây là trang quản lý thời khóa biểu khách sạn"
            />
            <PageBreadcrumb pageTitle="Quản lý thời khóa biểu khách sạn" />
            <RoomTimetable />
        </>
    );
}
