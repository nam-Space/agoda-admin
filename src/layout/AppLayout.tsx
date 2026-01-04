import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import { FloatButton } from "antd";
import { CommentOutlined } from "@ant-design/icons";
import ChatBot from "@/components/chatbot/ChatBot";

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen xl:flex">
      <div>
        <AppSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
          } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          <Outlet />
        </div>
      </div>
      <FloatButton.Group
        trigger="click"
        type="primary"
        style={{ insetInlineEnd: 24 }}
        icon={<CommentOutlined className="text-[30px]" />}
      >
        <ChatBot />
      </FloatButton.Group>
    </div>
  );
};

const AppLayout: React.FC = () => {

  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;
