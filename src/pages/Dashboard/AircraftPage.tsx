import Aircraft from "@/components/dashboard/aircraft/Aircraft";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useAppSelector } from "@/redux/hooks";
import { ROLE } from "@/constants/role";

export default function AircraftPage() {
    const user = useAppSelector(state => state.account.user)

    return (
        <>
            <PageMeta
                title="Quản lý máy bay"
                description="Đây là trang quản lý máy bay"
            />
            <PageBreadcrumb pageTitle="Quản lý máy bay" />
            <Aircraft
                canCreate={user.role === ROLE.ADMIN || user.role === ROLE.FLIGHT_OPERATION_STAFF}
                canUpdate={user.role === ROLE.ADMIN || user.role === ROLE.FLIGHT_OPERATION_STAFF}
                canDelete={user.role === ROLE.ADMIN || user.role === ROLE.FLIGHT_OPERATION_STAFF}
            />
        </>
    );
}
