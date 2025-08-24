

import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import User from "../../components/dashboard/user/User";

export default function UserPage() {

    return (
        <>
            <PageMeta
                title="Quản lý người dùng"
                description="Đây là trang quản lý người dùng"
            />
            <PageBreadcrumb pageTitle="Quản lý người dùng" />
            <User />
        </>
    );
}
