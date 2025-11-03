
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import PageMeta from "../../components/common/PageMeta";
import { SERVICE_TYPE } from "@/constants/booking";
import { useAppSelector } from "@/redux/hooks";
import { ROLE } from "@/constants/role";
import TableHotelRecommended from "@/components/ecommerce/TableHotelRecommended";
import TableActivityRecommended from "@/components/ecommerce/TableActivityRecommended";
import TableCarRecommended from "@/components/ecommerce/TableCarRecommended";

export default function Home() {
  const user = useAppSelector(state => state.account.user)

  return (
    <>
      <PageMeta
        title="Tổng quan hệ thống"
        description="Đây là trang tổng quan hệ thống"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-12">
          {/* <EcommerceMetrics /> */}
          {(user.role === ROLE.ADMIN || user.role === ROLE.OWNER || user.role === ROLE.STAFF) &&
            <div>
              <h1 className="font-semibold text-[24px]">Dịch vụ khách sạn</h1>
              <MonthlySalesChart serviceType={SERVICE_TYPE.HOTEL} />
              <TableHotelRecommended />
            </div>}
          {(user.role === ROLE.ADMIN || user.role === ROLE.EVENT_ORGANIZER) &&
            <div>
              <h1 className="font-semibold text-[24px]">Dịch vụ hoạt động</h1>
              <MonthlySalesChart serviceType={SERVICE_TYPE.ACTIVITY} />
              <TableActivityRecommended />
            </div>
          }
          {(user.role === ROLE.ADMIN || user.role === ROLE.DRIVER) &&
            <div>
              <h1 className="font-semibold text-[24px]">Dịch vụ taxi</h1>
              <MonthlySalesChart serviceType={SERVICE_TYPE.CAR} />
              <TableCarRecommended />
            </div>
          }

          <MonthlySalesChart serviceType={SERVICE_TYPE.FLIGHT} />
        </div>
      </div>
    </>
  );
}
