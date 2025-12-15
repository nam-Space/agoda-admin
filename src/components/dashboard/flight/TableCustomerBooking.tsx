/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConfigProvider, Table } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import type { TableProps } from 'antd';
import { callFetchPayment } from "@/config/api";
import vi_VN from 'antd/locale/vi_VN';
import { getUserAvatar } from "@/utils/imageUrl";
import { SERVICE_TYPE } from "@/constants/booking";

interface IProps {
    serviceType?: number;
    flightId?: number;
    activityDateId?: number;
}

const TableCustomerBooking = (props: IProps) => {
    const { serviceType, flightId, activityDateId } = props;
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
    ];

    const handleGetPayment = async (query: string) => {
        const res: any = await callFetchPayment(query);
        if (res.isSuccess) {
            setPayments(res.data);
        }
    }

    useEffect(() => {
        let query = ``
        if (serviceType === SERVICE_TYPE.FLIGHT && flightId) {
            query += `&flight_id=${flightId}`
        }
        if (serviceType === SERVICE_TYPE.ACTIVITY && activityDateId) {
            query += `&activity_date_id=${activityDateId}`
        }
        handleGetPayment(`current=1&pageSize=1000${query}`);
    }, [serviceType, flightId, activityDateId]);


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