/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

// Assume these icons are imported from an icon library
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PieChartIcon,
  PlugInIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { useAppSelector } from "@/redux/hooks";
import { ROLE } from "@/constants/role";
import { Badge } from "antd";
import { useSocket } from "@/context/SocketProvider";
import { CiDiscount1 } from "react-icons/ci";

type NavItem = {
  name: string | React.ReactNode;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string | React.ReactNode; path: string; pro?: boolean; new?: boolean }[];
};

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const user = useAppSelector(state => state.account.user)

  const { conversations } = useSocket();

  const unseenTotal = conversations.reduce((total: number, conv: any) => {
    if (conv?.latest_message?.sender?.id === user?.id) return total;
    return total + conv.unseen_count;
  }, 0);

  const navItems: NavItem[] = [
    {
      icon: <GridIcon />,
      name: <div className="flex items-center gap-[10px]">
        Tổng quan
        {unseenTotal > 0 && (
          <Badge
            count={unseenTotal}
            size="small"
            showZero
            color="#fa2314"
          />
        )}</div>,
      subItems: [
        { name: "Tổng quan hệ thống", path: "/", pro: false },
        ...(user.role === ROLE.ADMIN ? [{ name: "Người dùng", path: "/user", pro: false }] : []),
        ...(user.role === ROLE.ADMIN ? [{ name: "Đất nước", path: "/country", pro: false }] : []),
        ...(user.role === ROLE.ADMIN ? [{ name: "Thành phố", path: "/city", pro: false }] : []),
        ...((user.role === ROLE.ADMIN || user.role === ROLE.OWNER) ? [{ name: "Khách sạn", path: "/hotel", pro: false }] : []),
        ...((user.role === ROLE.ADMIN || user.role === ROLE.OWNER) ? [{ name: "Phòng", path: "/room", pro: false }] : []),
        ...(user.role === ROLE.ADMIN ? [{ name: "Sân bay", path: "/airport", pro: false }] : []),
        ...((user.role === ROLE.ADMIN || user.role === ROLE.FLIGHT_OPERATION_STAFF) ? [{ name: "Hãng hàng không", path: "/airline", pro: false }] : []),
        ...((user.role === ROLE.ADMIN || user.role === ROLE.FLIGHT_OPERATION_STAFF) ? [{ name: "Máy bay", path: "/aircraft", pro: false }] : []),
        ...((user.role === ROLE.ADMIN || user.role === ROLE.FLIGHT_OPERATION_STAFF || user.role === ROLE.AIRLINE_TICKETING_STAFF) ? [{ name: "Chuyến bay", path: "/flight", pro: false }] : []),
        ...((user.role === ROLE.ADMIN || user.role === ROLE.DRIVER) ? [{ name: "Taxi", path: "/car", pro: false }] : []),
        ...((user.role === ROLE.ADMIN || user.role === ROLE.DRIVER) ? [{ name: "Chuyến taxi", path: "/car-journey", pro: false }] : []),
        ...((user.role === ROLE.ADMIN || user.role === ROLE.EVENT_ORGANIZER) ? [{ name: "Hoạt động", path: "/activity", pro: false }] : []),
        ...((user.role === ROLE.ADMIN || user.role === ROLE.EVENT_ORGANIZER) ? [{ name: "Gói hoạt động", path: "/activity-package", pro: false }] : []),
        ...((user.role === ROLE.ADMIN || user.role === ROLE.EVENT_ORGANIZER) ? [{ name: "Ngày của gói hoạt động", path: "/activity-date", pro: false }] : []),
        ...((user.role === ROLE.ADMIN || user.role === ROLE.OWNER || user.role === ROLE.HOTEL_STAFF || user.role === ROLE.EVENT_ORGANIZER || user.role === ROLE.MARKETING_MANAGER) ? [{ name: "Cẩm nang", path: "/handbook", pro: false }] : []),
        ...(user.role !== ROLE.CUSTOMER ? [{
          name: <div className="flex items-center gap-[10px]">
            Tin nhắn
            {unseenTotal > 0 && (
              <Badge
                count={unseenTotal}
                size="small"
                showZero
                color="#fa2314"
              />
            )}</div>,
          path: "/chat",
          pro: false
        }] : []),
      ],
    },
    // {
    //   icon: <CalenderIcon />,
    //   name: "Calendar",
    //   path: "/calendar",
    // },
    // {
    //   icon: <UserCircleIcon />,
    //   name: "User Profile",
    //   path: "/profile",
    // },
    {
      name: "Đơn thanh toán",
      icon: <ListIcon />,
      subItems: [
        ...((user.role === ROLE.ADMIN || user.role === ROLE.OWNER || user.role === ROLE.HOTEL_STAFF || user.role === ROLE.MARKETING_MANAGER) ? [{ name: "Đơn thanh toán đặt phòng", path: "/room-payment", pro: false }] : []),
        ...((user.role === ROLE.ADMIN || user.role === ROLE.EVENT_ORGANIZER || user.role === ROLE.MARKETING_MANAGER) ? [{ name: "Đơn thanh toán hoạt động", path: "/activity-payment", pro: false }] : []),
        ...((user.role === ROLE.ADMIN || user.role === ROLE.DRIVER || user.role === ROLE.MARKETING_MANAGER) ? [{ name: "Đơn thanh toán taxi", path: "/car-payment", pro: false }] : []),
        ...((user.role === ROLE.ADMIN || user.role === ROLE.FLIGHT_OPERATION_STAFF || user.role === ROLE.AIRLINE_TICKETING_STAFF || user.role === ROLE.MARKETING_MANAGER) ? [{ name: "Đơn thanh toán chuyến bay", path: "/flight-payment", pro: false }] : [])
      ],
    },
    ...((user.role === ROLE.ADMIN || user.role === ROLE.OWNER || user.role === ROLE.HOTEL_STAFF || user.role === ROLE.DRIVER || user.role === ROLE.FLIGHT_OPERATION_STAFF || user.role === ROLE.AIRLINE_TICKETING_STAFF || user.role === ROLE.EVENT_ORGANIZER || user.role === ROLE.MARKETING_MANAGER) ? [{
      name: "Khuyến mãi",
      icon: <CiDiscount1 />,
      subItems: [
        ...((user.role === ROLE.ADMIN || user.role === ROLE.OWNER || user.role === ROLE.HOTEL_STAFF || user.role === ROLE.MARKETING_MANAGER) ? [{ name: "Khuyến mãi phòng", path: "/room-promotion", pro: false }] : []),
        ...((user.role === ROLE.ADMIN || user.role === ROLE.DRIVER || user.role === ROLE.MARKETING_MANAGER) ? [{ name: "Khuyến mãi xe taxi", path: "/car-promotion", pro: false }] : []),
        ...((user.role === ROLE.ADMIN || user.role === ROLE.FLIGHT_OPERATION_STAFF || user.role === ROLE.AIRLINE_TICKETING_STAFF || user.role === ROLE.MARKETING_MANAGER) ? [{ name: "Khuyến mãi chuyến bay", path: "/flight-promotion", pro: false }] : []),
        ...((user.role === ROLE.ADMIN || user.role === ROLE.EVENT_ORGANIZER || user.role === ROLE.MARKETING_MANAGER) ? [{ name: "Khuyến mãi hoạt động", path: "/activity-promotion", pro: false }] : []),
      ],
    }] : []),
    {
      name: "Thời khóa biểu",
      icon: <CalenderIcon />,
      subItems: [
        ...((user.role === ROLE.ADMIN || user.role === ROLE.OWNER || user.role === ROLE.HOTEL_STAFF) ? [{ name: "Thời khóa biểu khách sạn", path: "/room-timetable", pro: false }] : []),
        ...((user.role === ROLE.ADMIN || user.role === ROLE.DRIVER) ? [{ name: "Thời khóa biểu taxi", path: "/car-timetable", pro: false }] : []),
        ...((user.role === ROLE.ADMIN || user.role === ROLE.EVENT_ORGANIZER) ? [{ name: "Thời khóa biểu sự kiện hoạt động", path: "/activity-timetable", pro: false }] : []),
        ...((user.role === ROLE.ADMIN || user.role === ROLE.FLIGHT_OPERATION_STAFF || user.role === ROLE.AIRLINE_TICKETING_STAFF) ? [{ name: "Thời khóa biểu chuyến bay", path: "/flight-timetable", pro: false }] : []),
      ],
    },
    // {
    //   name: "Tables",
    //   icon: <TableIcon />,
    //   subItems: [{ name: "Basic Tables", path: "/basic-tables", pro: false }],
    // },
    // {
    //   name: "Pages",
    //   icon: <PageIcon />,
    //   subItems: [
    //     { name: "Blank Page", path: "/blank", pro: false },
    //     { name: "404 Error", path: "/error-404", pro: false },
    //   ],
    // },
  ];

  const othersItems: NavItem[] = [
    {
      icon: <PieChartIcon />,
      name: "Charts",
      subItems: [
        { name: "Line Chart", path: "/line-chart", pro: false },
        { name: "Bar Chart", path: "/bar-chart", pro: false },
      ],
    },
    {
      icon: <BoxCubeIcon />,
      name: "UI Elements",
      subItems: [
        { name: "Alerts", path: "/alerts", pro: false },
        { name: "Avatar", path: "/avatars", pro: false },
        { name: "Badge", path: "/badge", pro: false },
        { name: "Buttons", path: "/buttons", pro: false },
        { name: "Images", path: "/images", pro: false },
        { name: "Videos", path: "/videos", pro: false },
      ],
    },
    {
      icon: <PlugInIcon />,
      name: "Authentication",
      subItems: [
        { name: "Sign In", path: "/signin", pro: false },
        { name: "Sign Up", path: "/signup", pro: false },
      ],
    },
  ];

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => location.pathname === path;
  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={index}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${openSubmenu?.type === menuType && openSubmenu?.index === index
                ? "menu-item-active"
                : "menu-item-inactive"
                } cursor-pointer ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
                }`}
            >
              <span
                className={`menu-item-icon-size  ${openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
                  }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                    ? "rotate-180 text-brand-500"
                    : ""
                    }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
              >
                <span
                  className={`menu-item-icon-size ${isActive(nav.path)
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                    }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem, indexSub) => (
                  <li key={`${index}-${indexSub}`}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${isActive(subItem.path)
                        ? "menu-dropdown-item-active"
                        : "menu-dropdown-item-inactive"
                        }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
            <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Others"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
