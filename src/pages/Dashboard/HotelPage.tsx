


import Hotel from "@/components/dashboard/hotel/Hotel";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useAppSelector } from "@/redux/hooks";
import { ROLE } from "@/constants/role";

export default function HotelPage() {
    const user = useAppSelector(state => state.account.user)

    return (
        <>
            <PageMeta
                title="Quản lý khách sạn"
                description="Đây là trang quản lý khách sạn"
            />
            <PageBreadcrumb pageTitle="Quản lý khách sạn" />
            <Hotel
                canCreate={user.role === ROLE.ADMIN || user.role === ROLE.OWNER}
                canUpdate={user.role === ROLE.ADMIN || user.role === ROLE.OWNER}
                canDelete={user.role === ROLE.ADMIN || user.role === ROLE.OWNER}
            />
        </>
    );
}
