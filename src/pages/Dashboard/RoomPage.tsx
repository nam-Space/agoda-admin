



import { useAppSelector } from "@/redux/hooks";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Room from "@/components/dashboard/room/Room";
import { ROLE } from "@/constants/role";

export default function RoomPage() {
    const user = useAppSelector(state => state.account.user)

    return (
        <>
            <PageMeta
                title="Quản lý phòng"
                description="Đây là trang quản lý phòng"
            />
            <PageBreadcrumb pageTitle="Quản lý phòng" />
            <Room
                canCreate={user.role === ROLE.ADMIN || user.role === ROLE.OWNER}
                canUpdate={user.role === ROLE.ADMIN || user.role === ROLE.OWNER}
                canDelete={user.role === ROLE.ADMIN || user.role === ROLE.OWNER}
            />
        </>
    );
}
