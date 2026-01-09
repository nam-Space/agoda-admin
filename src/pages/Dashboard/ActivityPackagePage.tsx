



import ActivityPackage from "@/components/dashboard/activity-package/ActivityPackage";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useAppSelector } from "@/redux/hooks";
import { ROLE } from "@/constants/role";

export default function ActivityPackagePage() {
    const user = useAppSelector(state => state.account.user)

    return (
        <>
            <PageMeta
                title="Quản lý gói của hoạt động"
                description="Đây là trang quản lý gói của hoạt động"
            />
            <PageBreadcrumb pageTitle="Quản lý gói của hoạt động" />
            <ActivityPackage
                canCreate={user.role === ROLE.ADMIN || user.role === ROLE.EVENT_ORGANIZER}
                canUpdate={user.role === ROLE.ADMIN || user.role === ROLE.EVENT_ORGANIZER}
                canDelete={user.role === ROLE.ADMIN || user.role === ROLE.EVENT_ORGANIZER}
            />
        </>
    );
}
