/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConfigProvider, Table, Tag } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import type { TableProps } from 'antd';
import { callFetchPayment } from "@/config/api";
import vi_VN from 'antd/locale/vi_VN';
import { getUserAvatar } from "@/utils/imageUrl";
import { SERVICE_TYPE } from "@/constants/booking";
import { PAYMENT_METHOD_VI, PAYMENT_STATUS_COLOR, PAYMENT_STATUS_VI } from "@/constants/payment";
import { formatCurrency } from "@/utils/formatCurrency";

interface IProps {
    serviceType?: number;
    hotelId?: number;
    roomId?: number;
    carId?: number;
    airlineId?: number;
    aircraftId?: number;
    flightId?: number;
    activityId?: number;
    activityPackageId?: number;
    activityDateId?: number;
    minDate?: string | null;
    maxDate?: string | null;
}

const TableCustomerBooking = (props: IProps) => {
    const { serviceType, hotelId, roomId, carId, airlineId, aircraftId, flightId, activityId, activityPackageId, activityDateId, minDate, maxDate } = props;
    const [payments, setPayments] = useState([])

    const columns: TableProps<any>['columns'] = [
        {
            title: "STT",
            dataIndex: 'stt',
            render: (_text, _record, index) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        {index + 1}
                    </div>
                )
            },
        },
        {
            title: "Tên",
            dataIndex: 'full_name',
            render: (_text, record) => {
                return (
                    record?.booking?.user ? <div className="flex items-center gap-[10px]">
                        <img
                            src={getUserAvatar(record.booking.user.avatar)}
                            className="w-[40px] min-w-[40px] max-w-[40px] h-[40px] object-cover rounded-[50%]"
                        />
                        <div>
                            <p className="leading-[20px]">{`${record.booking.user.first_name} ${record.booking.user.last_name}`}</p>
                            <p className="leading-[20px] text-[#929292]">{`@${record.booking.user.username}`}</p>
                        </div>
                    </div> : <div className="flex items-center gap-[10px]">
                        <img
                            src={getUserAvatar(record.booking?.guest_info?.avatar)}
                            className="w-[40px] min-w-[40px] max-w-[40px] h-[40px] object-cover rounded-[50%]"
                        />
                        <div>
                            <p className="leading-[20px]"><span className="font-bold">Khách ngoài:</span> {record.booking?.guest_info?.full_name}</p>
                            <p className="leading-[20px] text-[#929292]">{record.booking?.guest_info?.email}</p>
                        </div>
                    </div>

                )
            },
        },
        {
            title: "Email",
            dataIndex: 'email',
            render: (_text, record) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        <p>{`${record.booking?.guest_info?.email}`}</p>
                    </div>
                )
            },
        },
        {
            title: "SĐT",
            dataIndex: 'phone_number',
            render: (_text, record) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        <p>{`${record.booking?.guest_info?.phone}`}</p>
                    </div>
                )
            },
        },
        {
            title: "Thời gian đặt",
            dataIndex: 'created_at',
            render: (_text, record) => {
                return (
                    <>{dayjs(record.created_at).format('DD-MM-YYYY HH:mm:ss')}</>
                )
            },
        },
        {
            title: "Giao dịch",
            dataIndex: 'transaction',
            render: (_text, record) => {
                return (
                    <div>
                        <Tag color={PAYMENT_STATUS_COLOR[record.status]}>
                            {PAYMENT_STATUS_VI[record.status]}
                        </Tag>
                        <p>- Phương thức: <span className="font-bold">{PAYMENT_METHOD_VI[record.method]}</span></p>
                        <p>- Tổng tiền: <span className="text-blue-600 font-bold">{formatCurrency(record?.amount?.toFixed(0) || 0)}đ</span></p>
                        <p>- Giảm giá: <span className="text-red-600 font-bold">{formatCurrency(record?.booking?.discount_amount?.toFixed(0) || 0)}đ</span></p>
                        <p>- Thành tiền: <span className="text-green-600 font-bold">{formatCurrency(record?.booking?.final_price?.toFixed(0) || 0)}đ</span></p>
                    </div>
                )
            },
        },
    ];

    const handleGetPayment = async (query: string) => {
        const res: any = await callFetchPayment(query);
        if (res.isSuccess) {
            setPayments(res.data);
        }
    }

    useEffect(() => {
        let query = ``
        if (serviceType === SERVICE_TYPE.HOTEL) {
            if (hotelId) {
                query += `&hotel_id=${hotelId}`
            }
            if (roomId) {
                query += `&room_id=${roomId}`
            }
        }
        else if (serviceType === SERVICE_TYPE.ACTIVITY) {
            if (activityId) {
                query += `&activity_id=${activityId}`
            }
            if (activityPackageId) {
                query += `&activity_package_id=${activityPackageId}`
            }
            if (activityDateId) {
                query += `&activity_date_id=${activityDateId}`
            }

        }
        if (serviceType === SERVICE_TYPE.CAR) {
            if (carId) {
                query += `&car_id=${carId}`
            }
        }
        else if (serviceType === SERVICE_TYPE.FLIGHT) {
            if (airlineId) {
                query += `&airline_id=${airlineId}`
            }
            if (aircraftId) {
                query += `&aircraft_id=${aircraftId}`
            }
            if (flightId) {
                query += `&flight_id=${flightId}`
            }

        }

        if (minDate) {
            query += `&min_created_at=${minDate}`
        }
        if (maxDate) {
            query += `&max_created_at=${maxDate}`
        }

        handleGetPayment(`current=1&pageSize=1000${query}`);
    }, [serviceType, hotelId, roomId, activityId, activityPackageId, activityDateId, carId, airlineId, aircraftId, flightId, minDate, maxDate]);


    return (
        <div>
            <h2 className="text-[16px] font-semibold">Danh sách khách hàng đã đặt</h2>
            <div className="mt-[20px]">
                <ConfigProvider locale={vi_VN}>
                    <Table
                        className="table-ele"
                        columns={columns}
                        dataSource={payments}
                    />
                </ConfigProvider>
            </div>
        </div>
    )
}

export default TableCustomerBooking