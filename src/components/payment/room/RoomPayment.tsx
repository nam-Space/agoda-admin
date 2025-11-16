/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRef, useState } from "react";
import { Button, message, notification, Popconfirm, Space } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ActionType, ProColumns } from "@ant-design/pro-components";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { callDeletePayment } from "../../../config/api";
import DataTable from "../../antd/Table";
// import ModalCity from "./ModalCity";
import { formatCurrency } from "@/utils/formatCurrency";
import { PAYMENT_METHOD_VI, PAYMENT_STATUS_VI } from "@/constants/payment";
import { fetchPayment } from "@/redux/slice/paymentSlide";
import { SERVICE_TYPE } from "@/constants/booking";
import { getUserAvatar } from "@/utils/imageUrl";
import {
    Star,
    Calendar,
} from "lucide-react";
import ModalRoomPayment from "./ModalRoomPayment";
import { ROLE } from "@/constants/role";

export default function RoomPayment() {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState(null);

    const user = useAppSelector(state => state.account.user)

    const tableRef = useRef<ActionType>(null);

    const isFetching = useAppSelector(state => state.payment.isFetching);
    const meta = useAppSelector(state => state.payment.meta);
    const payments = useAppSelector(state => state.payment.data);
    const dispatch = useAppDispatch();

    const handleDeletePayment = async (id: number | undefined) => {
        if (id) {
            const res: any = await callDeletePayment(id);
            if (res?.isSuccess) {
                message.success('Xóa payment thành công');
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        }
    }

    const getGuestSummary = (room_booking: any) => {
        const numGuests = room_booking?.num_guests || 0;
        if (numGuests > 0) {
            return `${numGuests} khách`;
        }
        return "Không có thông tin số lượng khách";
    };

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const columns: ProColumns<any>[] = [
        {
            title: "ID",
            dataIndex: 'id',
            hideInSearch: true,
        },
        {
            title: "Mã code",
            dataIndex: 'booking_code',
            hideInSearch: true,
            render: (text, record, index, action) => {
                return (
                    <div className="break-all">{record?.booking?.booking_code}</div>
                )
            },
        },
        {
            title: "Mã giao dịch",
            dataIndex: 'transaction_id',
            hideInSearch: true,
            render: (text, record, index, action) => {
                return (
                    <div className="w-[120px] break-all">{record?.transaction_id}</div>
                )
            },
        },
        {
            title: "Thông tin khách hàng",
            dataIndex: 'method',
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <div>
                        {record?.booking?.user && <div className="mb-[14px]">
                            <p>- Tài khoản khách hàng:</p>
                            <div className="flex items-center gap-[10px] ml-[20px] mt-[4px]">
                                <img
                                    src={getUserAvatar(record?.booking?.user?.avatar)}
                                    className="min-w-[40px] max-w-[40px] h-[40px] object-cover rounded-[50%]"
                                />
                                <div>
                                    <p className="leading-[20px]">{`${record?.booking?.user?.first_name} ${record?.booking?.user?.last_name}`}</p>
                                    <p className="leading-[20px] text-[#929292]">{`@${record?.booking?.user?.username}`}</p>
                                </div>
                            </div></div>}
                        <p>- Họ tên: {record?.booking?.guest_info?.full_name}</p>
                        <p>- Email: {record?.booking?.guest_info?.email}</p>
                        <p>- SĐT: {record?.booking?.guest_info?.phone}</p>
                        <p>- Quốc tịch: {record?.booking?.guest_info?.country}</p>
                    </div>
                )
            },
        },
        {
            title: "Thông tin đơn hàng",
            dataIndex: 'method',
            sorter: true,
            render: (text, record, index, action) => {
                const room_booking = record?.booking?.hotel_detail
                return (
                    <div>
                        {room_booking && <div>
                            <div className="flex gap-3">
                                <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                                    <img
                                        src={`${import.meta.env.VITE_BE_URL}${room_booking.room?.images?.[0]?.image}`}
                                        className="w-full h-full object-cover"
                                        alt={room_booking?.room?.room_type}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1">
                                        {room_booking?.room?.hotel?.name}
                                    </h4>
                                    <div className="flex items-center gap-1 text-xs">
                                        <Star className="w-3 h-3 fill-orange-500 text-orange-500" />
                                        <span className="font-semibold">
                                            {room_booking?.room?.hotel?.avg_star?.toFixed(1)}
                                        </span>
                                        <span className="text-gray-500">
                                            {room_booking?.room?.hotel?.review_count || 0} lượt đánh giá
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className=" border-gray-200 p-3 space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    <span>
                                        {
                                            dayjs(room_booking
                                                ?.check_in).format("YYYY-MM-DD HH:mm")
                                        }{" "}
                                        &rarr;{" "}
                                        {
                                            dayjs(room_booking
                                                ?.check_out).format("YYYY-MM-DD HH:mm")
                                        }
                                    </span>
                                </div>

                                <div className="text-sm">
                                    <div className="font-semibold text-gray-900 mb-1">
                                        {room_booking?.room?.room_type}
                                    </div>
                                    <div className="text-gray-600 text-xs">
                                        {getGuestSummary(room_booking)}
                                    </div>
                                </div>
                            </div>
                        </div>}
                    </div>
                )
            },
            width: 250,
        },
        {
            title: "Tổng tiền",
            dataIndex: 'amount',
            sorter: true,
            hideInSearch: true,
            render: (text, record, index, action) => {
                return (
                    <div>{formatCurrency(record?.amount)}</div>
                )
            },
        },
        {
            title: "Phương thức thanh toán",
            dataIndex: 'method',
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <div>{PAYMENT_METHOD_VI[record.method]}</div>
                )
            },

        },

        {
            title: 'Trạng thái',
            dataIndex: 'status',
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <div>{PAYMENT_STATUS_VI[record.status]}</div>
                )
            },
        },
        {
            title: "Ngày tạo",
            dataIndex: 'created_at',
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <>{dayjs(record.created_at).format('DD-MM-YYYY HH:mm:ss')}</>
                )
            },
            hideInSearch: true,
        },
        {

            title: "Hành động",
            hideInSearch: true,
            width: 50,
            render: (_value, entity, _index, _action) => (
                <Space>
                    <EditOutlined
                        style={{
                            fontSize: 20,
                            color: '#ffa500',
                        }}
                        type=""
                        onClick={() => {
                            setOpenModal(true);
                            setDataInit(entity);
                        }}
                    />

                    <Popconfirm
                        placement="leftTop"
                        title={"Xác nhận xóa city"}
                        description={"Bạn chắc chắn muốn xóa city"}
                        onConfirm={() => handleDeletePayment(entity.id)}
                        okText={"Xác nhận"}
                        cancelText={"Hủy"}
                    >
                        <span style={{ cursor: "pointer", margin: "0 10px" }}>
                            <DeleteOutlined
                                style={{
                                    fontSize: 20,
                                    color: '#ff4d4f',
                                }}
                            />
                        </span>
                    </Popconfirm>
                </Space>
            ),

        },
    ];

    const buildQuery = (params: any, sort: any, filter: any) => {
        let temp = ""

        const clone = { ...params, currentPage: params.current, limit: params.pageSize };
        delete clone.current
        delete clone.pageSize

        temp += `current=${clone.currentPage}`
        temp += `&pageSize=${clone.limit}`
        temp += `&booking__service_type=${SERVICE_TYPE.HOTEL}`
        if (clone.transaction_id) {
            temp += `&transaction_id=${clone.transaction_id}`
        }

        if (user.role === ROLE.OWNER) {
            temp += `&owner_hotel_id=${user.id}`
        }
        else if (user.role === ROLE.STAFF) {
            temp += `&owner_hotel_id=${user.manager?.id || 0}`
        }

        return temp;
    }

    return (
        <div>
            <DataTable
                actionRef={tableRef}
                headerTitle={"Danh sách payment"}
                rowKey="id"
                loading={isFetching}
                columns={columns}
                dataSource={payments}
                request={async (params, sort, filter): Promise<any> => {
                    const query = buildQuery(params, sort, filter);
                    dispatch(fetchPayment({ query }))
                }}
                scroll={{ x: true }}
                pagination={
                    {
                        current: meta.currentPage,
                        pageSize: meta.itemsPerPage,
                        showSizeChanger: true,
                        total: meta.totalItems,
                        showTotal: (total, range) => { return (<div> {range[0]}-{range[1]} trên {total} bản ghi</div>) }
                    }
                }
                rowSelection={false}
                toolBarRender={(_action, _rows): any => {
                    return (
                        <Button
                            icon={<PlusOutlined />}
                            type="primary"
                            onClick={() => setOpenModal(true)}
                        >
                            <span>
                                Thêm mới
                            </span>
                        </Button>
                    );
                }}
            />
            <ModalRoomPayment
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
        </div>
    );
}
