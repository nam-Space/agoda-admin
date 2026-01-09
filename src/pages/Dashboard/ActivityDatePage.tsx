




import { useAppSelector } from "@/redux/hooks";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ActivityDate from "@/components/dashboard/activity-date/ActivityDate";
import { ROLE } from "@/constants/role";

export default function ActivityDatePage() {
    const user = useAppSelector(state => state.account.user)

    return (
        <>
            <PageMeta
                title="Quản lý các ngày trong gói của hoạt động"
                description="Đây là trang quản lý các ngày trong gói của hoạt động"
            />
            <PageBreadcrumb pageTitle="Quản lý các ngày trong gói của hoạt động" />
            <ActivityDate
                canCreate={user.role === ROLE.ADMIN || user.role === ROLE.EVENT_ORGANIZER}
                canUpdate={user.role === ROLE.ADMIN || user.role === ROLE.EVENT_ORGANIZER}
                canDelete={user.role === ROLE.ADMIN || user.role === ROLE.EVENT_ORGANIZER}
            />
        </>
    );
}
