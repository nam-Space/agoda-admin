import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Handbook from "@/components/dashboard/handbook/Handbook";

export default function HandbookPage() {

    return (
        <>
            <PageMeta
                title="Quản lý cẩm nang"
                description="Đây là trang quản lý cẩm nang"
            />
            <PageBreadcrumb pageTitle="Quản lý cẩm nang" />
            <Handbook />
        </>
    );
}
