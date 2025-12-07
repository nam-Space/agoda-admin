





import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import CarPromotion from "@/components/promotion/car-promotion/CarPromotion";

export default function CarPromotionPage() {

    return (
        <>
            <PageMeta
                title="Quản lý khuyến mãi xe taxi"
                description="Đây là trang quản lý khuyến mãi xe taxi"
            />
            <PageBreadcrumb pageTitle="Quản lý khuyến mãi xe taxi" />
            <CarPromotion />
        </>
    );
}
