


import Chat from "@/components/dashboard/chat/Chat";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function ChatPage() {

    return (
        <>
            <PageMeta
                title="Nhắn tin"
                description="Đây là trang Nhắn tin"
            />
            <PageBreadcrumb pageTitle="Nhắn tin" />
            <Chat />
        </>
    );
}
