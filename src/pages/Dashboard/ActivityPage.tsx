



import { useAppSelector } from "@/redux/hooks";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Activity from "@/components/dashboard/activity/Activity";
import { ROLE } from "@/constants/role";

export default function ActivityPage() {
    const user = useAppSelector(state => state.account.user)

    return (
        <>
            <PageMeta
                title="Quản lý hoạt động"
                description="Đây là trang quản lý hoạt động"
            />
            <PageBreadcrumb pageTitle="Quản lý hoạt động" />
            <Activity
                canCreate={user.role === ROLE.ADMIN || user.role === ROLE.EVENT_ORGANIZER}
                canUpdate={user.role === ROLE.ADMIN || user.role === ROLE.EVENT_ORGANIZER}
                canDelete={user.role === ROLE.ADMIN || user.role === ROLE.EVENT_ORGANIZER}
            />
        </>
    );
}
