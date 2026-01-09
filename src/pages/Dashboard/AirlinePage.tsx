import { useAppSelector } from "@/redux/hooks";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Airline from "@/components/dashboard/airline/Airline";
import { ROLE } from "@/constants/role";

export default function AirlinePage() {
    const user = useAppSelector(state => state.account.user)

    return (
        <>
            <PageMeta
                title="Quản lý hãng hàng không"
                description="Đây là trang quản lý hãng hàng không"
            />
            <PageBreadcrumb pageTitle="Quản lý hãng hàng không" />
            <Airline
                canCreate={user.role === ROLE.ADMIN || user.role === ROLE.FLIGHT_OPERATION_STAFF}
                canUpdate={user.role === ROLE.ADMIN || user.role === ROLE.FLIGHT_OPERATION_STAFF}
                canDelete={user.role === ROLE.ADMIN || user.role === ROLE.FLIGHT_OPERATION_STAFF}
            />
        </>
    );
}
