




import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import CarTimetable from "@/components/timetable/CarTimetable";

export default function CarTimetablePage() {

    return (
        <>
            <PageMeta
                title="Quản lý thời khóa biểu taxi"
                description="Đây là trang quản lý thời khóa biểu taxi"
            />
            <PageBreadcrumb pageTitle="Quản lý thời khóa biểu taxi" />
            <CarTimetable />
        </>
    );
}
