/* eslint-disable @typescript-eslint/no-explicit-any */
import { SERVICE_TYPE_VI } from '@/constants/booking'
import { TIME_STATISTIC_VI } from '@/constants/time';
import { BoxIconLine } from '@/icons'
import { ApexOptions } from 'apexcharts';
import Chart from "react-apexcharts";

const OrderTarget = ({ statistic, serviceType }: any) => {
    const series = [statistic.order_growth];
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
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-[10px]">
                    <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                        <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
                    </div>
                    <div>
                        <span className="text-[18px] text-black font-semibold dark:text-gray-200">
                            Đơn hàng mỗi {TIME_STATISTIC_VI[statistic.statistic_by]?.toLowerCase()}
                        </span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Dịch vụ {SERVICE_TYPE_VI[serviceType]?.toLowerCase()}
                        </p>
                    </div>
                </div>

                <div>
                    <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                        {statistic.orders[statistic.orders.length - 1] || 0}
                    </h4>
                </div>
            </div>
            <div className="relative">
                <div className="max-h-[330px]" id="chartDarkStyle">
                    <Chart
                        options={options}
                        series={series}
                        type="radialBar"
                        height={330}
                    />
                </div>
            </div>
            <p className="mx-auto mt-10 w-full max-w-[380px] text-center text-sm text-gray-500 sm:text-base">
                Bạn đã thu về {statistic.orders[statistic.orders.length - 1] || 0} đơn hàng. {(statistic.order_growth > 0) ? 'Cao hơn' : (statistic.order_growth === 0 ? 'Cao bằng' : 'Thấp hơn')} {TIME_STATISTIC_VI[statistic.statistic_by]?.toLowerCase()} trước
            </p>
        </div>
    )
}

export default OrderTarget