





import ActivityPromotion from "@/components/promotion/activity-promotion/ActivityPromotion";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function ActivityPromotionPage() {

    return (
        <>
            <PageMeta
                title="Quản lý khuyến mãi hoạt động"
                description="Đây là trang quản lý khuyến mãi hoạt động"
            />
            <PageBreadcrumb pageTitle="Quản lý khuyến mãi hoạt động" />
            <ActivityPromotion />
        </>
    );
}
