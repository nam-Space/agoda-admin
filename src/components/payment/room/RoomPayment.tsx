/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from "react";
import { Button, Input, Popconfirm, Select, Space, Tag } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ActionType, ProColumns } from "@ant-design/pro-components";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { callDeletePayment, callFetchHotel, callFetchRoomAdmin, callFetchUser } from "../../../config/api";
import DataTable from "../../antd/Table";
import { formatCurrency } from "@/utils/formatCurrency";
import { PAYMENT_METHOD_VI, PAYMENT_STATUS_COLOR, PAYMENT_STATUS_VI } from "@/constants/payment";
import { fetchPayment } from "@/redux/slice/paymentSlide";
import { SERVICE_TYPE } from "@/constants/booking";
import { getUserAvatar } from "@/utils/imageUrl";
import {
    Star,
    Calendar,
} from "lucide-react";
import ModalRoomPayment from "./ModalRoomPayment";
import { ROLE } from "@/constants/role";
import { toast } from "react-toastify";
import _ from "lodash";

export default function RoomPayment() {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState(null);

    const user = useAppSelector(state => state.account.user)

    const tableRef = useRef<ActionType>(null);

    const isFetching = useAppSelector(state => state.payment.isFetching);
    const meta = useAppSelector(state => state.payment.meta);
    const payments = useAppSelector(state => state.payment.data);
    const dispatch = useAppDispatch();

    const [customers, setCustomers] = useState([])
    const [hotels, setHotels] = useState([])
    const [rooms, setRooms] = useState([])

    const handleDeletePayment = async (id: number | undefined) => {
        if (id) {
            const res: any = await callDeletePayment(id);
            if (res?.isSuccess) {
                toast.success("Xóa payment thành công", {
                    position: "bottom-right",
                });
                reloadTable();
            } else {
                toast.error("Có lỗi xảy ra", {
                    position: "bottom-right",
                });
            }
        }
    }

    const handleGetUser = async (query: string) => {
        const res: any = await callFetchUser(query)
        if (res.isSuccess) {
            setCustomers(res.data)
        }
    }

    const handleGetHotel = async (query: string) => {
        const res: any = await callFetchHotel(query)
        if (res.isSuccess) {
            setHotels(res.data)
        }
    }

    const handleGetRoom = async (query: string) => {
        const res: any = await callFetchRoomAdmin(query)
        if (res.isSuccess) {
            setRooms(res.data)
        }
    }

    const getGuestSummary = (room_booking: any) => {
        const numGuests = room_booking?.num_guests || 0;
        if (numGuests > 0) {
            return `${numGuests} khách`;
        }
        return "Không có thông tin số lượng khách";
    };

    useEffect(() => {
        handleGetUser(`current=1&pageSize=1000`)
        handleGetHotel(`current=1&pageSize=1000`)
        handleGetRoom(`current=1&pageSize=1000`)
    }, [])

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const columns: ProColumns<any>[] = [
        {
            title: "ID",
            dataIndex: 'id',
            sorter: true,
            hideInSearch: true,
        },
        {
            title: "Mã code",
            dataIndex: 'booking__booking_code',
            sorter: true,
            render: (_text, record, _index, _action) => {
                return (
                    <div className="break-all">{record?.booking?.booking_code}</div>
                )
            },
        },
        {
            title: "Mã giao dịch",
            dataIndex: 'transaction_id',
            sorter: true,
            render: (_text, record, _index, _action) => {
                return (
                    <div className="w-[120px] break-all">{record?.transaction_id}</div>
                )
            },
        },
        {
            title: "Thông tin khách hàng",
            dataIndex: 'customer',
            render: (_text, record, _index, _action) => {
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
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {

                const value: any = selectedKeys[0] || {};

                return (
                    <div style={{ padding: 12, width: 280 }}>
                        <Select
                            placeholder="Khách hàng"
                            allowClear
                            value={value.booking__user_id}
                            onChange={(val: any) =>
                                setSelectedKeys([
                                    { ...value, booking__user_id: val }
                                ])
                            }
                            options={customers.map((item: any) => ({
                                label: <div className="flex items-center gap-[10px]">
                                    <img
                                        src={getUserAvatar(item?.avatar)}
                                        className="min-w-[40px] max-w-[40px] h-[40px] object-cover rounded-[50%]"
                                    />
                                    <div>
                                        <p className="leading-[20px]">{`${item?.first_name} ${item?.last_name}`}</p>
                                        <p className="leading-[20px] text-[#929292]">{`@${item?.username}`}</p>
                                    </div>
                                </div>,
                                value: item.id,
                            }))}
                            style={{ width: "100%", marginBottom: 8, height: 60 }}
                        />


                        <Space>
                            <Button
                                type="primary"
                                size="small"
                                onClick={() => confirm()}
                            >
                                Tìm
                            </Button>
                            <Button
                                size="small"
                                onClick={() => {
                                    clearFilters?.();
                                    confirm();
                                }}
                            >
                                Reset
                            </Button>
                        </Space>
                    </div>
                );
            },
            onFilter: () => true, // bắt buộc để Antd không filter local
            hideInSearch: true
        },
        {
            title: "Thông tin đơn hàng",
            dataIndex: 'order',
            render: (_text, record, _index, _action) => {
                const room_booking = record?.booking?.room_details?.[0]
                return (
                    <div>
                        {room_booking && <div>
                            <div className="flex gap-3">
                                <div className="relative w-[40px] h-[40px] flex-shrink-0 rounded-lg overflow-hidden">
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
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
                const value: any = selectedKeys[0] || {};
                return (
                    <div style={{ padding: 12, width: 280 }}>
                        <Select
                            placeholder="Khách sạn"
                            allowClear
                            showSearch
                            value={value.hotel_id}
                            onChange={async (val: any) => {
                                setSelectedKeys([{ ...value, hotel_id: val }])
                                if (val) {
                                    await handleGetRoom(`current=1&pageSize=1000&hotel_id=${val}`)
                                }
                                else {
                                    await handleGetRoom(`current=1&pageSize=1000`)
                                }

                            }}
                            options={hotels.map((item: any) => ({
                                label: (
                                    <div className="flex gap-3">
                                        <div className="w-[40px] h-[40px] rounded-lg overflow-hidden">
                                            <img
                                                src={`${import.meta.env.VITE_BE_URL}${item?.images?.[0]?.image}`}
                                                className="w-full h-full object-cover"
                                                alt={item?.name}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-sm line-clamp-2">
                                                {item?.name}
                                            </h4>
                                            <div className="flex items-center gap-1 text-xs">
                                                <Star className="w-3 h-3 fill-orange-500 text-orange-500" />
                                                <span className="font-semibold">
                                                    {item?.avg_star?.toFixed(1)}
                                                </span>
                                                <span className="text-gray-500">
                                                    {item?.review_count || 0} đánh giá
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ),
                                value: item.id,
                            }))}
                            style={{ width: "100%", marginBottom: 8, height: 60 }}
                        />
                        <Select
                            placeholder="Phòng"
                            allowClear
                            showSearch
                            value={value.room_id}
                            onChange={(val: any) =>
                                setSelectedKeys([{ ...value, room_id: val }])
                            }
                            options={rooms.map((item: any) => ({
                                label: (
                                    <div className="flex items-center gap-3">
                                        <div className="w-[40px] h-[40px] rounded-lg overflow-hidden">
                                            <img
                                                src={`${import.meta.env.VITE_BE_URL}${item?.images?.[0]?.image}`}
                                                className="w-full h-full object-cover"
                                                alt={item?.name}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-sm line-clamp-2">
                                                {item?.room_type}
                                            </h4>
                                        </div>
                                    </div>
                                ),
                                value: item.id,
                            }))}
                            style={{ width: "100%", marginBottom: 8, height: 60 }}
                        />

                        <Space>
                            <Button
                                type="primary"
                                size="small"
                                onClick={() => confirm()}
                            >
                                Tìm
                            </Button>
                            <Button
                                size="small"
                                onClick={() => {
                                    clearFilters?.();
                                    confirm();
                                }}
                            >
                                Reset
                            </Button>
                        </Space>
                    </div>
                );
            },
            onFilter: () => true, // bắt buộc để Antd không filter local
            hideInSearch: true,
        },
        {
            title: "Giao dịch",
            dataIndex: 'transaction',
            render: (_text, record, _index, _action) => {
                return (
                    <div>
                        <Tag color={PAYMENT_STATUS_COLOR[record.status]}>
                            {PAYMENT_STATUS_VI[record.status]}
                        </Tag>
                        <p>- Phương thức: <span className="font-bold">{PAYMENT_METHOD_VI[record.method]}</span></p>
                        <p>- Tổng tiền: <span className="text-blue-600 font-bold">{formatCurrency(record?.amount)}đ</span></p>
                        <p>- Giảm giá: <span className="text-red-600 font-bold">{formatCurrency(record?.booking?.discount_amount)}đ</span></p>
                        <p>- Thành tiền: <span className="text-green-600 font-bold">{formatCurrency(record?.booking?.final_price)}đ</span></p>
                    </div>
                )
            },
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
                const value: any = selectedKeys[0] || {};

                return (
                    <div style={{ padding: 12, width: 280 }}>
                        <Select
                            placeholder="Trạng thái"
                            allowClear
                            value={value.status}
                            onChange={(val: any) =>
                                setSelectedKeys([
                                    { ...value, status: val }
                                ])
                            }
                            options={Object.entries(PAYMENT_STATUS_VI).map(([key, val]) => {
                                return {
                                    label: val,
                                    value: key
                                }
                            })}
                            style={{ width: "100%", marginBottom: 8 }}
                        />
                        <Input
                            placeholder="Tổng tiền từ"
                            type="number"
                            value={value.min_total_price}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, min_total_price: e.target.value }
                                ])
                            }
                            onPressEnter={confirm as any}
                            style={{ marginBottom: 8 }}
                        />

                        <Input
                            placeholder="Tổng tiền đến"
                            type="number"
                            value={value.max_total_price}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, max_total_price: e.target.value }
                                ])
                            }
                            onPressEnter={confirm as any}
                            style={{ marginBottom: 8 }}
                        />
                        <Input
                            placeholder="Tiền giảm giá từ"
                            type="number"
                            value={value.min_discount_amount}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, min_discount_amount: e.target.value }
                                ])
                            }
                            onPressEnter={confirm as any}
                            style={{ marginBottom: 8 }}
                        />

                        <Input
                            placeholder="Tiền giảm giá đến"
                            type="number"
                            value={value.max_discount_amount}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, max_discount_amount: e.target.value }
                                ])
                            }
                            onPressEnter={confirm as any}
                            style={{ marginBottom: 8 }}
                        />
                        <Input
                            placeholder="Thành tiền từ"
                            type="number"
                            value={value.min_final_price}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, min_final_price: e.target.value }
                                ])
                            }
                            onPressEnter={confirm as any}
                            style={{ marginBottom: 8 }}
                        />

                        <Input
                            placeholder="Thành tiền đến"
                            type="number"
                            value={value.max_final_price}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, max_final_price: e.target.value }
                                ])
                            }
                            onPressEnter={confirm as any}
                            style={{ marginBottom: 8 }}
                        />
                        <Space>
                            <Button
                                type="primary"
                                size="small"
                                onClick={() => confirm()}
                            >
                                Tìm
                            </Button>
                            <Button
                                size="small"
                                onClick={() => {
                                    clearFilters?.();
                                    confirm();
                                }}
                            >
                                Reset
                            </Button>
                        </Space>
                    </div>
                );
            },
            onFilter: () => true, // bắt buộc để Antd không filter local
            hideInSearch: true,
            width: 200
        },
        {
            title: "Ngày tạo",
            dataIndex: 'created_at',
            sorter: true,
            render: (_text, record, _index, _action) => {
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

    const buildQuery = (params: any, _sort: any, _filter: any) => {
        let temp = ""

        const clone = { ...params, currentPage: params.current, limit: params.pageSize };
        delete clone.current
        delete clone.pageSize

        temp += `current=${clone.currentPage}`
        temp += `&pageSize=${clone.limit}`
        temp += `&booking__service_type=${SERVICE_TYPE.HOTEL}`

        if (_filter?.customer?.[0]?.booking__user_id) {
            temp += `&booking__user_id=${_filter?.customer?.[0]?.booking__user_id}`
        }

        if (_filter?.order?.[0]?.hotel_id) {
            temp += `&hotel_id=${_filter?.order?.[0]?.hotel_id}`
        }
        if (_filter?.order?.[0]?.room_id) {
            temp += `&room_id=${_filter?.order?.[0]?.room_id}`
        }

        if (clone.booking__booking_code) {
            temp += `&booking__booking_code=${clone.booking__booking_code}`
        }

        if (clone.transaction_id) {
            temp += `&transaction_id=${clone.transaction_id}`
        }

        if (_filter?.transaction?.[0]?.status) {
            temp += `&status=${_filter?.transaction?.[0]?.status}`
        }
        if (_filter?.transaction?.[0]?.min_total_price) {
            temp += `&min_total_price=${_filter?.transaction?.[0]?.min_total_price}`
        }
        if (_filter?.transaction?.[0]?.max_total_price) {
            temp += `&max_total_price=${_filter?.transaction?.[0]?.max_total_price}`
        }
        if (_filter?.transaction?.[0]?.min_discount_amount) {
            temp += `&min_discount_amount=${_filter?.transaction?.[0]?.min_discount_amount}`
        }
        if (_filter?.transaction?.[0]?.max_discount_amount) {
            temp += `&max_discount_amount=${_filter?.transaction?.[0]?.max_discount_amount}`
        }
        if (_filter?.transaction?.[0]?.min_discount_amount) {
            temp += `&min_discount_amount=${_filter?.transaction?.[0]?.min_discount_amount}`
        }
        if (_filter?.transaction?.[0]?.max_discount_amount) {
            temp += `&max_discount_amount=${_filter?.transaction?.[0]?.max_discount_amount}`
        }

        if (user.role === ROLE.OWNER) {
            temp += `&owner_hotel_id=${user.id}`
        }
        else if (user.role === ROLE.HOTEL_STAFF) {
            temp += `&owner_hotel_id=${user.manager?.id || 0}`
        }

        // sort
        if (_.isEmpty(_sort)) {
            temp += `&sort=id-desc`
        }
        else {
            Object.entries(_sort).map(([key, val]) => {
                temp += `&sort=${key}-${val === "ascend" ? "asc" : "desc"}`
            })
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
