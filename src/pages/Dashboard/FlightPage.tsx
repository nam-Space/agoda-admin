
import { useAppSelector } from "@/redux/hooks";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Flight from "@/components/dashboard/flight/Flight";
import { ROLE } from "@/constants/role";

export default function FlightPage() {
    const user = useAppSelector(state => state.account.user)

    return (
        <>
            <PageMeta
                title="Quản lý chuyến bay"
                description="Đây là trang quản lý chuyến bay"
            />
            <PageBreadcrumb pageTitle="Quản lý chuyến bay" />
            <Flight
                canCreate={user.role === ROLE.ADMIN || user.role === ROLE.FLIGHT_OPERATION_STAFF}
                canUpdate={user.role === ROLE.ADMIN || user.role === ROLE.FLIGHT_OPERATION_STAFF}
                canDelete={user.role === ROLE.ADMIN || user.role === ROLE.FLIGHT_OPERATION_STAFF}
            />
        </>
    );
}
