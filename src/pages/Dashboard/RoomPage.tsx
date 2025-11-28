



import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Room from "@/components/dashboard/room/Room";

export default function RoomPage() {

    return (
        <>
            <PageMeta
                title="Quản lý phòng"
                description="Đây là trang quản lý phòng"
            />
            <PageBreadcrumb pageTitle="Quản lý phòng" />
            <Room />
        </>
    );
}
