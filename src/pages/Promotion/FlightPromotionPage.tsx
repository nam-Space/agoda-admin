





import FlightPromotion from "@/components/promotion/flight-promotion/FlightPromotion";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useAppSelector } from "@/redux/hooks";
import { ROLE } from "@/constants/role";

export default function FlightPromotionPage() {
    const user = useAppSelector(state => state.account.user)

    const isPermission = user.role === ROLE.ADMIN || user.role == ROLE.FLIGHT_OPERATION_STAFF || user.role === ROLE.MARKETING_MANAGER

    return (
        <>
            <PageMeta
                title="Quản lý khuyến mãi chuyến bay"
                description="Đây là trang quản lý khuyến mãi chuyến bay"
            />
            <PageBreadcrumb pageTitle="Quản lý khuyến mãi chuyến bay" />
            <FlightPromotion
                canCreate={isPermission}
                canUpdate={isPermission}
                canDelete={isPermission}
            />
        </>
    );
}
