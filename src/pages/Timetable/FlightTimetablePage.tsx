import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import FlightTimetable from "@/components/timetable/FlightTimeable";

export default function FlightTimetablePage() {

    return (
        <>
            <PageMeta
                title="Quản lý thời khóa biểu chuyến bay"
                description="Đây là trang quản lý thời khóa biểu chuyến bay"
            />
            <PageBreadcrumb pageTitle="Quản lý thời khóa biểu chuyến bay" />
            <FlightTimetable />
        </>
    );
}
