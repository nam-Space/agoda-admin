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

export default function Flight() {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState(null);

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
            render: (text, record, index, action) => {
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
            render: (text, record, index, action) => {
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
            render: (text, record, index, action) => {
                if (record.legs?.length === 0) return <div></div>
                const firstLeg = record.legs[0];
                const lastLeg = record.legs[record.legs.length - 1];

                return (
                    <div>
                        <div>
                            <p className="font-semibold text-base">{dayjs(firstLeg?.departure_time).format("HH:ss")} → {dayjs(firstLeg?.arrival_time).format("HH:ss")}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">{dayjs(firstLeg?.departure_time).format("MM/DD/YYYY")} - {dayjs(firstLeg?.arrival_time).format("MM/DD/YYYY")}</p>
                        </div>
                        <div className="flex items-center gap-[10px]">
                            <p className="font-semibold leading-[20px]">{`${firstLeg?.departure_airport?.name}`}</p>
                            →
                            <p className="font-semibold leading-[20px]">{`${lastLeg?.arrival_airport?.name}`}</p>
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
            render: (text, record, index, action) => {
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
            render: (text, record, index, action) => {
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
            render: (text, record, index, action) => {
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
            render: (text, record) => {
                return (
                    <>{dayjs(record.created_at).format('DD-MM-YYYY HH:mm:ss')}</>
                )
            },
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
            <ModalFlight
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
        </div>
    );
}
