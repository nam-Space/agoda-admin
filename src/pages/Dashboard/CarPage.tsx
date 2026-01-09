


import Car from "@/components/dashboard/car/Car";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useAppSelector } from "@/redux/hooks";
import { ROLE } from "@/constants/role";

export default function CarPage() {
    const user = useAppSelector(state => state.account.user)

    return (
        <>
            <PageMeta
                title="Quản lý xe"
                description="Đây là trang quản lý xe"
            />
            <PageBreadcrumb pageTitle="Quản lý xe" />
            <Car
                canCreate={user.role === ROLE.ADMIN || user.role === ROLE.DRIVER}
                canUpdate={user.role === ROLE.ADMIN || user.role === ROLE.DRIVER}
                canDelete={user.role === ROLE.ADMIN || user.role === ROLE.DRIVER}
            />
        </>
    );
}
