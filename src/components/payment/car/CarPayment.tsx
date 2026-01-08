/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from "react";
import { Button, Input, Popconfirm, Select, Space, Tag } from "antd";
import { CarOutlined, DeleteOutlined, EditOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';
import { ActionType, ProColumns } from "@ant-design/pro-components";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { callDeletePayment, callFetchCar, callFetchUser } from "../../../config/api";
import DataTable from "../../antd/Table";
import { formatCurrency } from "@/utils/formatCurrency";
import { PAYMENT_METHOD_VI, PAYMENT_STATUS_COLOR, PAYMENT_STATUS_VI } from "@/constants/payment";
import { fetchPayment } from "@/redux/slice/paymentSlide";
import { SERVICE_TYPE } from "@/constants/booking";
import { getUserAvatar } from "@/utils/imageUrl";
import ModalCarPayment from "./ModalCarPayment";
import { haversine } from "@/utils/googleMap";
import { ROLE } from "@/constants/role";
import { toast } from "react-toastify";
import _ from "lodash";

export default function CarPayment() {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState(null);

    const user = useAppSelector(state => state.account.user)

    const tableRef = useRef<ActionType>(null);

    const isFetching = useAppSelector(state => state.payment.isFetching);
    const meta = useAppSelector(state => state.payment.meta);
    const payments = useAppSelector(state => state.payment.data);
    const dispatch = useAppDispatch();

    const [customers, setCustomers] = useState([])
    const [cars, setCars] = useState([])

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

    const handleGetCar = async (query: string) => {
        const res: any = await callFetchCar(query)
        if (res.isSuccess) {
            setCars(res.data)
        }
    }

    useEffect(() => {
        handleGetUser(`current=1&pageSize=1000`)
        handleGetCar(`current=1&pageSize=1000`)
    }, [])

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const columns: ProColumns<any>[] = [
        {
            title: "ID",
            dataIndex: 'id',
            hideInSearch: true,
            sorter: true
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
            dataIndex: 'method',
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
                const car_booking = record?.booking?.car_detail?.[0]
                const distance = haversine(
                    car_booking?.lat1 || 0,
                    car_booking?.lng1 || 0,
                    car_booking?.lat2 || 0,
                    car_booking?.lng2 || 0
                )


                return (
                    <div>
                        {car_booking && <div className="space-y-3">
                            <div>
                                <div className="font-medium">
                                    {
                                        car_booking?.pickup_location
                                    } → {
                                        car_booking?.dropoff_location
                                    }
                                </div>
                                <div className="text-sm text-gray-500">
                                    {dayjs(
                                        car_booking?.pickup_datetime
                                    ).format(
                                        "YYYY-MM-DD HH:mm:ss"
                                    )}
                                </div>
                                <div className="text-xs text-gray-400">
                                    Khoảng cách:{" "}
                                    {distance.toFixed(2)} km
                                </div>
                                <div className="text-xs text-gray-400">
                                    Thời gian đi lấy: 3 phút
                                </div>
                                <div className="text-xs text-gray-400">
                                    Thời gian ước lượng:{" "}
                                    {(
                                        car_booking?.total_time_estimate ||
                                        0
                                    ).toFixed(1)}{" "}
                                    giờ
                                </div>
                            </div>

                            <div className="flex items-center space-x-4 text-sm">
                                <div className="flex items-center space-x-1">
                                    <UserOutlined />
                                    <span>
                                        {
                                            car_booking?.passenger_quantity_booking
                                        }{" "}
                                        Hành khách
                                    </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <CarOutlined />
                                    <span>
                                        Tối đa{" "}
                                        {
                                            car_booking?.car
                                                ?.luggage
                                        }{" "}
                                        vali
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                                <img
                                    src={`${import.meta.env.VITE_BE_URL}${car_booking?.car?.image}`}
                                    alt={
                                        car_booking?.car
                                            ?.name
                                    }
                                    width={60}
                                    height={40}
                                    className="object-contain"
                                />
                                <div>
                                    <div className="font-medium text-sm">
                                        {
                                            car_booking?.car
                                                ?.name
                                        }
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {
                                            car_booking?.car
                                                ?.description
                                        }
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
                            placeholder="Xe taxi"
                            allowClear
                            value={value.car_id}
                            onChange={async (val: any) => {
                                setSelectedKeys([{ ...value, car_id: val }])

                            }}
                            options={cars.map((item: any) => ({
                                label: <div className="flex gap-3">
                                    <img
                                        src={`${import.meta.env.VITE_BE_URL}${item?.image}`}
                                        alt={item.name}
                                        width={60}
                                        height={40}
                                        className="object-contain"
                                    />
                                    <div>
                                        <div className="font-medium text-sm">
                                            {
                                                item
                                                    ?.name
                                            }
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {
                                                item
                                                    ?.description
                                            }
                                        </div>
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
                        <p>- Tổng tiền: <span className="text-blue-600 font-bold">{formatCurrency(record?.amount?.toFixed(0))}đ</span></p>
                        <p>- Giảm giá: <span className="text-red-600 font-bold">{formatCurrency(record?.booking?.discount_amount?.toFixed(0))}đ</span></p>
                        <p>- Thành tiền: <span className="text-green-600 font-bold">{formatCurrency(record?.booking?.final_price?.toFixed(0))}đ</span></p>
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
        temp += `&booking__service_type=${SERVICE_TYPE.CAR}`

        if (_filter?.customer?.[0]?.booking__user_id) {
            temp += `&booking__user_id=${_filter?.customer?.[0]?.booking__user_id}`
        }

        if (_filter?.order?.[0]?.car_id) {
            temp += `&car_id=${_filter?.order?.[0]?.car_id}`
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

        if (user.role === ROLE.DRIVER) {
            temp += `&driver_id=${user.id}`
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
            <ModalCarPayment
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
        </div>
    );
}
