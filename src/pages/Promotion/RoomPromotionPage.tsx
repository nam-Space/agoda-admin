




import RoomPromotion from "@/components/promotion/room-promotion/RoomPromotion";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useAppSelector } from "@/redux/hooks";
import { ROLE } from "@/constants/role";

export default function RoomPromotionPage() {
    const user = useAppSelector(state => state.account.user)

    const isPermission = user.role === ROLE.ADMIN || user.role == ROLE.OWNER || user.role === ROLE.MARKETING_MANAGER

    return (
        <>
            <PageMeta
                title="Quản lý khuyến mãi phòng"
                description="Đây là trang quản lý khuyến mãi phòng"
            />
            <PageBreadcrumb pageTitle="Quản lý khuyến mãi phòng" />
            <RoomPromotion
                canCreate={isPermission}
                canUpdate={isPermission}
                canDelete={isPermission}
            />
        </>
    );
}
