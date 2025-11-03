/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import { TIME_STATISTIC_VI } from "@/constants/time";
import { formatCurrency } from "@/utils/formatCurrency";
import { SERVICE_TYPE_VI } from "@/constants/booking";

export default function MonthlyTarget({ statistic, serviceType }: any) {
  const series = [statistic.revenue_growth];
  const options: ApexOptions = {
    colors: ["#465FFF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 330,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: {
          size: "80%",
        },
        track: {
          background: "#E4E7EC",
          strokeWidth: "100%",
          margin: 5, // margin is in pixels
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: "40px",
            fontWeight: "600",
            offsetY: -50,
            color: "#1D2939",
            formatter: function (val) {
              return val + "%";
            },
          },
        },
      },
    },
    fill: {
      type: "solid",
      colors: ["#465FFF"],
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["Progress"],
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Doanh số mỗi {TIME_STATISTIC_VI[statistic.statistic_by]?.toLowerCase()}
            </h3>
            {/* <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
              Doanh số so với {TIME_STATISTIC_VI[statistic.statistic_by]?.toLowerCase()} trước
            </p> */}
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Dịch vụ {SERVICE_TYPE_VI[serviceType]?.toLowerCase()}
            </p>
          </div>
        </div>
        <div className="relative ">
          <div className="max-h-[330px]" id="chartDarkStyle">
            <Chart
              options={options}
              series={series}
              type="radialBar"
              height={330}
            />
          </div>

          {/* <span className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-[95%] rounded-full bg-success-50 px-3 py-1 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-500">
            +10%
          </span> */}
        </div>
        <p className="mx-auto mt-10 w-full max-w-[380px] text-center text-sm text-gray-500 sm:text-base">
          Bạn đã thu về {formatCurrency(statistic.total_revenue)}₫. {statistic.revenue_growth > 0 ? 'Cao hơn' : (statistic.revenue_growth === 0 ? 'Cao bằng' : 'Thấp hơn')} {TIME_STATISTIC_VI[statistic.statistic_by]?.toLowerCase()} trước
        </p>
      </div>
    </div>
  );
}
