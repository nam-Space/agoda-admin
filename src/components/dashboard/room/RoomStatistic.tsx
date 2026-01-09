/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */


import ChartTab from "@/components/common/ChartTab";
import { callFetchPaymentOverview } from "@/config/api";
import { SERVICE_TYPE } from "@/constants/booking";
import { TIME_STATISTIC, TIME_STATISTIC_VI } from "@/constants/time";
import { ConfigProvider, DatePicker } from "antd";
import vi_VN from 'antd/locale/vi_VN';
import { ApexOptions } from "apexcharts";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import TableCustomerBooking from "../flight/TableCustomerBooking";
import { formatCurrency } from "@/utils/formatCurrency";

const { RangePicker } = DatePicker;

const RoomStatistic = ({ room }: any) => {
    const [selectedTime, setSelectedTime] = useState(TIME_STATISTIC.DAY);
    const [selectedRangeTime, setSelectedRangeTime] = useState({
        room: [null, null],
    })

    const [statistic, setStatistic] = useState({
        "labels": [],
        "revenues": [],
        "total": 0,
        "total_revenue": 0,
        "revenue_growth": 0,
        "customers": [],
        "customer_growth": 0,
        "orders": [],
        "order_growth": 0,
        "statistic_by": TIME_STATISTIC.DAY
    })

    const options: ApexOptions = {
        colors: ["#465fff"],
        chart: {
            fontFamily: "Outfit, sans-serif",
            type: "bar",
            height: 180,
            toolbar: {
                show: false,
            },
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: "39%",
                borderRadius: 5,
                borderRadiusApplication: "end",
            },
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            show: true,
            width: 4,
            colors: ["transparent"],
        },
        xaxis: {
            categories: [
                ...statistic.labels
            ],
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
        },
        legend: {
            show: true,
            position: "top",
            horizontalAlign: "left",
            fontFamily: "Outfit",
        },
        yaxis: {
            title: {
                text: undefined,
            },
        },
        grid: {
            yaxis: {
                lines: {
                    show: true,
                },
            },
        },
        fill: {
            opacity: 1,
        },

        tooltip: {
            x: {
                show: false,
            },
            y: {
                formatter: (val: number) => `${val}`,
            },
        },
    };

    const series = [
        {
            name: "Doanh thu",
            data: [...statistic.revenues],
        },
    ];

    const handleGetPaymentOverview = async (query: string) => {
        const res: any = await callFetchPaymentOverview(query)
        if (res.isSuccess) {
            setStatistic({
                ...res.data
            })
        }
    }

    useEffect(() => {
        let serviceQuery = ``

        if (room?.id) {
            serviceQuery += `&room_id=${room.id}`
        }
        if (selectedRangeTime.room[0]) {
            serviceQuery += `&min_date=${dayjs(selectedRangeTime.room[0]).format("YYYY-MM-DD HH:mm:ss")}`
        }
        if (selectedRangeTime.room[1]) {
            serviceQuery += `&max_date=${dayjs(selectedRangeTime.room[1]).format("YYYY-MM-DD HH:mm:ss")}`
        }


        handleGetPaymentOverview(`booking__service_type=${SERVICE_TYPE.HOTEL}${serviceQuery}&statistic_by=${selectedTime}`)

    }, [room, selectedTime, JSON.stringify(selectedRangeTime)])

    return (
        <div>
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                    Thống kê chi tiết
                </h3>
                <ChartTab selectedTime={selectedTime} setSelectedTime={setSelectedTime} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-4">
                <div>
                    <label>Bắt đầu từ → Bắt đầu đến</label>
                    <div className="mt-2">
                        <ConfigProvider locale={vi_VN}>
                            <RangePicker
                                showTime
                                onChange={(dates: any, _dateStrings: [string, string]) => {
                                    if (!dates) {
                                        setSelectedRangeTime({
                                            ...selectedRangeTime,
                                            room: [null, null]
                                        });
                                        return;
                                    }
                                    setSelectedRangeTime({
                                        ...selectedRangeTime,
                                        room: [dates[0].format("YYYY-MM-DD HH:mm:ss"), dates[1].format("YYYY-MM-DD HH:mm:ss")]
                                    });
                                }}
                                value={selectedRangeTime.room[0] && selectedRangeTime.room[1]
                                    ? [dayjs(selectedRangeTime.room[0]), dayjs(selectedRangeTime.room[1])]
                                    : null}
                                className="w-full h-[60px]"
                            />
                        </ConfigProvider>
                    </div>
                </div>
            </div>
            <div className="mt-4 max-w-full overflow-x-auto custom-scrollbar">
                <Chart options={options} series={series} type="bar" height={180} />
            </div>
            <div>
                <p className="text-[18px]">
                    - Bạn đã thu về <span className="text-purple-700">{statistic.customers[statistic.customers.length - 1] || 0} khách hàng</span>. {(statistic.customer_growth > 0) ? 'Cao hơn' : (statistic.customer_growth === 0 ? 'Cao bằng' : 'Thấp hơn')} {TIME_STATISTIC_VI[statistic.statistic_by]?.toLowerCase()} trước
                </p>
                <p className="text-[18px]">
                    - Bạn đã thu về <span className="text-purple-700">{statistic.orders[statistic.orders.length - 1] || 0} đơn hàng</span>. {(statistic.order_growth > 0) ? 'Cao hơn' : (statistic.order_growth === 0 ? 'Cao bằng' : 'Thấp hơn')} {TIME_STATISTIC_VI[statistic.statistic_by]?.toLowerCase()} trước
                </p>
                <p className="text-[18px]">
                    - Bạn đã thu về <span className="text-purple-700">{formatCurrency(statistic.total_revenue || 0)}₫</span>. {statistic.revenue_growth > 0 ? 'Cao hơn' : (statistic.revenue_growth === 0 ? 'Cao bằng' : 'Thấp hơn')} {TIME_STATISTIC_VI[statistic.statistic_by]?.toLowerCase()} trước
                </p>
            </div>
            <div className="mt-[20px]">
                <TableCustomerBooking serviceType={SERVICE_TYPE.HOTEL} roomId={room?.id} minDate={selectedRangeTime.room[0]} maxDate={selectedRangeTime.room[1]} />
            </div>
        </div>
    )
}

export default RoomStatistic