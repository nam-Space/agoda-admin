/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRef, useState } from "react";
import { Button, Popconfirm, Space } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ActionType, ProColumns } from "@ant-design/pro-components";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import DataTable from "../../antd/Table";
import { getImage } from "@/utils/imageUrl";
import { toast } from "react-toastify";
import { callDeleteFlight } from "@/config/api";
import { formatCurrency } from "@/utils/formatCurrency";
import { fetchFlight } from "@/redux/slice/flightSlide";
import { BAGGAGE_INCLUDED_VI } from "@/constants/airline";
import ModalFlight from "./ModalFlight";
import dayjs from "dayjs";
import { HiOutlineCursorClick } from "react-icons/hi";
import ModalFlightDetail from "@/components/payment/flight/ModalFlightDetail";
import { ROLE } from "@/constants/role";

interface IProps {
    canCreate?: boolean;
    canUpdate?: boolean;
    canDelete?: boolean;
}

export default function Flight(props: IProps) {
    const { canCreate, canUpdate, canDelete } = props;
    const user = useAppSelector(state => state.account.user)
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState(null);
    const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);

    const tableRef = useRef<ActionType>(null);

    const isFetching = useAppSelector(state => state.flight.isFetching);
    const meta = useAppSelector(state => state.flight.meta);
    const flights = useAppSelector(state => state.flight.data);
    const dispatch = useAppDispatch();

    const handleDeleteFlight = async (id: number | undefined) => {
        if (id) {
            const res: any = await callDeleteFlight(id);
            if (res?.isSuccess) {
                toast.success("Xóa flight thành công", {
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
            title: "Hãng hàng không",
            dataIndex: 'airline',
            sorter: true,
            render: (_text, record, _index, _action) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        <img
                            src={getImage(record?.airline?.logo)}
                            className="w-[70px] h-[50px] object-cover"
                        />
                        <div>
                            <p className="leading-[20px]">{`${record?.airline?.name}`}</p>
                        </div>
                    </div>
                )
            },
            hideInSearch: true,
        },
        {
            title: "Máy bay",
            dataIndex: 'aircraft',
            sorter: true,
            render: (_text, record, _index, _action) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        <div>
                            <p className="leading-[20px]">{`${record?.aircraft?.model}`}</p>
                        </div>
                    </div>
                )
            },
            hideInSearch: true,
        },
        {
            title: "Chuyến bay",
            dataIndex: 'flight',
            sorter: true,
            render: (_text, record, _index, _action) => {
                if (record.legs?.length === 0) return <div></div>

                const recordLegSorted = [...record.legs].sort((a: any, b: any) =>
                    new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime() // giảm dần
                );

                const firstLeg = recordLegSorted[0];
                const lastLeg = recordLegSorted[recordLegSorted.length - 1];

                return (
                    <div onClick={() => {
                        setDataInit(record)
                        setIsModalDetailOpen(true)
                    }} className="bg-gray-200 p-[10px] rounded-[10px] cursor-pointer hover:bg-gray-300 transition-all duration-150">
                        <div>
                            <div className="flex items-center gap-[6px]">
                                <img src={getImage(record?.airline?.logo)} alt={record?.airline?.name} className="w-[24px]" />
                                <p className="text-[12px] text-gray-500">{record?.airline?.name}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-base">{dayjs(firstLeg?.departure_time).format("HH:ss")} → {dayjs(lastLeg?.arrival_time).format("HH:ss")}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">{dayjs(firstLeg?.departure_time).format("DD/MM/YYYY")} - {dayjs(lastLeg?.arrival_time).format("DD/MM/YYYY")}</p>
                            </div>
                            <div className="flex items-center gap-[10px]">
                                <p className="font-semibold leading-[20px]">{`${firstLeg?.departure_airport?.name}`}</p>
                                →
                                <p className="font-semibold leading-[20px]">{`${lastLeg?.arrival_airport?.name}`}</p>
                            </div>
                        </div>
                        <div className="mt-[10px] flex items-center justify-center gap-[5px] text-[12px] italic">
                            <HiOutlineCursorClick />
                            <span>Click để xem chi tiết</span>
                        </div>
                    </div>
                )
            },
            hideInSearch: true,
            width: 200
        },
        {
            title: "Tổng thời gian",
            dataIndex: 'total_duration',
            render: (_text, record, _index, _action) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        {record.total_duration} phút
                    </div>
                )
            },
            sorter: true,
        },
        {
            title: "Bao gồm hành lý",
            dataIndex: 'baggage_included',
            sorter: true,
            hideInSearch: true,
            render: (_text, record, _index, _action) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        {BAGGAGE_INCLUDED_VI[record.baggage_included]}
                    </div>
                )
            },
        },
        {
            title: "Số điểm dừng",
            dataIndex: 'stops',
            sorter: true,
        },
        {
            title: "Giá tiền cơ sở",
            dataIndex: 'base_price',
            sorter: true,
            render: (_text, record, _index, _action) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        {formatCurrency(record?.base_price)}đ
                    </div>
                )
            },
            hideInSearch: true,
        },
        {
            title: "Ngày tạo",
            dataIndex: 'created_at',
            sorter: true,
            render: (_text, record) => {
                return (
                    <>{dayjs(record.created_at).format('DD-MM-YYYY HH:mm:ss')}</>
                )
            },
        },
        ...((canUpdate || canDelete) ? [{
            title: "Hành động",
            hideInSearch: true,
            width: 50,
            render: (_value: any, entity: any, _index: any, _action: any) => (
                <Space>
                    {canUpdate && <EditOutlined
                        style={{
                            fontSize: 20,
                            color: '#ffa500',
                        }}
                        type=""
                        onClick={() => {
                            setOpenModal(true);
                            setDataInit(entity);
                        }}
                    />}

                    {canDelete && <Popconfirm
                        placement="leftTop"
                        title={"Xác nhận xóa flight"}
                        description={"Bạn chắc chắn muốn xóa flight"}
                        onConfirm={() => handleDeleteFlight(entity.id)}
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
                    </Popconfirm>}

                </Space>
            ),

        }] : []),
    ];

    const buildQuery = (params: any, _sort: any, _filter: any) => {
        let temp = ""

        const clone = { ...params, currentPage: params.current, limit: params.pageSize };
        delete clone.current
        delete clone.pageSize

        temp += `current=${clone.currentPage}`
        temp += `&pageSize=${clone.limit}`

        if (user.role === ROLE.FLIGHT_OPERATION_STAFF) {
            temp += `&flight_operations_staff_id=${user.id}`
        }

        else if (user.role === ROLE.AIRLINE_TICKETING_STAFF) {
            temp += `&flight_operations_staff_id=${user.flight_operation_manager?.id}`
        }

        temp += `&sort=id-desc`

        return temp;
    }

    return (
        <div>
            <DataTable
                actionRef={tableRef}
                headerTitle={"Danh sách flight"}
                rowKey="id"
                loading={isFetching}
                columns={columns}
                dataSource={flights}
                request={async (params, sort, filter): Promise<any> => {
                    const query = buildQuery(params, sort, filter);
                    dispatch(fetchFlight({ query }))
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
                        canCreate ? <Button
                            icon={<PlusOutlined />}
                            type="primary"
                            onClick={() => setOpenModal(true)}
                        >
                            <span>
                                Thêm mới
                            </span>
                        </Button> : null

                    );
                }}
            />
            <ModalFlight
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
            <ModalFlightDetail
                flight={dataInit}
                isModalOpen={isModalDetailOpen}
                setIsModalOpen={setIsModalDetailOpen}
            />
        </div>
    );
}
