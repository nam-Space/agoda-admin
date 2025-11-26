/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRef, useState } from "react";
import { Button, Divider, message, notification, Popconfirm, Space } from "antd";
import { CarOutlined, DeleteOutlined, EditOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';
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
import ModalCarPayment from "./ModalCarPayment";
import { haversine } from "@/utils/googleMap";
import { ROLE } from "@/constants/role";
import { toast } from "react-toastify";

export default function CarPayment() {
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
                const car_booking = record?.booking?.car_detail
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
                                    alt="Economy sedan"
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
        temp += `&booking__service_type=${SERVICE_TYPE.CAR}`
        if (clone.transaction_id) {
            temp += `&transaction_id=${clone.transaction_id}`
        }

        if (user.role === ROLE.DRIVER) {
            temp += `&driver_id=${user.id}`
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
