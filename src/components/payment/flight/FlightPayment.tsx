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
import { getImage, getUserAvatar } from "@/utils/imageUrl";
import { HiOutlineCursorClick } from "react-icons/hi";
import ModalFlightPayment from "./ModalFlightPayment";
import { toast } from "react-toastify";
import ModalFlightDetail from "./ModalFlightDetail";
import { ROLE } from "@/constants/role";

export default function FlightPayment() {
    const user = useAppSelector(state => state.account.user)
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState(null);

    const [selectedFlight, setSelectedFlight] = useState({})
    const [isModalFlightDetailOpen, setIsModalFlightDetailOpen] = useState(false);
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
                const going = record?.booking?.flight_detail?.[0]
                const returning = record?.booking?.flight_detail?.[1]

                return (
                    <div className="flex flex-col gap-[20px]">
                        <div onClick={() => {
                            setSelectedFlight(going?.flight)
                            setIsModalFlightDetailOpen(true)
                        }} className="bg-gray-200 p-[10px] rounded-[10px] cursor-pointer hover:bg-gray-300 transition-all duration-150">
                            <h2 className="font-semibold text-[16px] text-blue-700"> Chiều đi (→):</h2>
                            <div className="flex items-center flex-col">
                                <div className="flex items-center gap-[10px]">
                                    <img className="w-[50px] object-cover" src={getImage(going?.flight?.airline?.logo)} />
                                    <div>
                                        <p className="leading-[20px] font-semibold">{going?.flight?.airline?.name}</p>
                                    </div>
                                </div>
                                <div>
                                    <div>
                                        <p className="font-semibold text-base">{dayjs(going?.flight?.departure_time).format("HH:mm")} → {dayjs(going?.flight?.arrival_time).format("HH:mm")}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">{dayjs(going?.flight?.departure_time).format("DD/MM/YYYY")} → {dayjs(going?.flight?.arrival_time).format("DD/MM/YYYY")}</p>
                                    </div>
                                    <div className="flex items-center gap-[10px]">
                                        <p className="font-semibold leading-[20px]">{going?.flight?.departure_airport?.name}</p>
                                        →
                                        <p className="font-semibold leading-[20px]">{going?.flight?.arrival_airport?.name}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-[10px] flex items-center justify-center gap-[5px] text-[12px] italic">
                                <HiOutlineCursorClick />
                                <span>Click để xem chi tiết</span>
                            </div>
                        </div>
                        {returning && <div onClick={() => {
                            setSelectedFlight(returning?.flight)
                            setIsModalFlightDetailOpen(true)
                        }} className="bg-gray-200 p-[10px] rounded-[10px] cursor-pointer hover:bg-gray-300 transition-all duration-150">
                            <h2 className="font-semibold text-[16px] text-red-700">Chiều về (←):</h2>
                            <div className="flex items-center flex-col">
                                <div className="flex items-center gap-[10px]">
                                    <img className="w-[50px] object-cover" src={getImage(returning?.flight?.airline?.logo)} />
                                    <div>
                                        <p className="leading-[20px] font-semibold">{returning?.flight?.airline?.name}</p>
                                    </div>
                                </div>
                                <div>
                                    <div>
                                        <p className="font-semibold text-base">{dayjs(returning?.flight?.departure_time).format("HH:mm")} → {dayjs(returning?.flight?.arrival_time).format("HH:mm")}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">{dayjs(returning?.flight?.departure_time).format("DD/MM/YYYY")} → {dayjs(returning?.flight?.arrival_time).format("DD/MM/YYYY")}</p>
                                    </div>
                                    <div className="flex items-center gap-[10px]">
                                        <p className="font-semibold leading-[20px]">{returning?.flight?.departure_airport?.name}</p>
                                        →
                                        <p className="font-semibold leading-[20px]">{returning?.flight?.arrival_airport?.name}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-[10px] flex items-center justify-center gap-[5px] text-[12px] italic">
                                <HiOutlineCursorClick />
                                <span>Click để xem chi tiết</span>
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
            title: "Giảm giá",
            dataIndex: 'amount',
            sorter: true,
            hideInSearch: true,
            render: (text, record, index, action) => {
                return (
                    <div>{formatCurrency(record?.booking?.discount_amount)}</div>
                )
            },
        },
        {
            title: "Thành tiền",
            dataIndex: 'final_price',
            sorter: true,
            hideInSearch: true,
            render: (text, record, index, action) => {
                return (
                    <div>{formatCurrency(record?.booking?.final_price)}</div>
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
        temp += `&booking__service_type=${SERVICE_TYPE.FLIGHT}`
        if (clone.transaction_id) {
            temp += `&transaction_id=${clone.transaction_id}`
        }
        if (user.role === ROLE.FLIGHT_OPERATION_STAFF) {
            temp += `&flight_operations_staff_id=${user.id}`
        }
        else if (user.role === ROLE.AIRLINE_TICKETING_STAFF) {
            temp += `&flight_operations_staff_id=${user.flight_operation_manager?.id}`
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
            <ModalFlightPayment
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
            <ModalFlightDetail flight={selectedFlight} isModalOpen={isModalFlightDetailOpen} setIsModalOpen={setIsModalFlightDetailOpen} />
        </div>
    );
}
