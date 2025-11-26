
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, ConfigProvider, Popconfirm, Space, Table } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { DeleteOutlined, EditOutlined, ReloadOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import { callDeleteFlightLeg, callFetchFlightLeg } from "@/config/api";
import { toast } from "react-toastify";
import vi_VN from 'antd/locale/vi_VN';
import ModalFlightLegTable from "./ModalFlightLegTable";

interface IProps {
    flight?: any | null;
}

export interface IMeta {
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
    totalItems: number;
}

const FlightLegTable = (props: IProps) => {
    const { flight } = props;

    const [data, setData] = useState([]);
    const [meta, setMeta] = useState<IMeta>({
        currentPage: 1,
        itemsPerPage: 10,
        totalPages: 0,
        totalItems: 0,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dataInit, setDataInit] = useState({});

    const handleDeleteFlightLeg = async (id: number | undefined) => {
        if (id) {
            const res: any = await callDeleteFlightLeg(id);
            if (res?.isSuccess) {
                await handleGetFlightLeg(`current=${meta.currentPage}&pageSize=${meta.itemsPerPage}&flight_id=${flight.id}&sort=id-desc`);
                toast.success("Xóa flight leg thành công", {
                    position: "bottom-right",
                });
                // reloadTable();
            } else {
                toast.error("Có lỗi xảy ra", {
                    position: "bottom-right",
                });
            }
        }
    }

    const columns: TableProps<any>['columns'] = [
        {
            title: "ID",
            dataIndex: 'id',
        },
        {
            title: "Mã chuyến bay",
            dataIndex: 'flight_code',
        },
        {
            title: "Thời gian khởi hành",
            dataIndex: 'departure_time',
            render: (text, record) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        {dayjs(record.departure_time).format("YYYY-MM-DD HH:mm:ss")}
                    </div>
                )
            },
        },
        {
            title: "Thời gian hạ cánh",
            dataIndex: 'arrival_time',
            render: (_, record) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        {dayjs(record.arrival_time).format("YYYY-MM-DD HH:mm:ss")}
                    </div>
                )
            },
        },
        {
            title: "Tổng thời gian",
            dataIndex: 'arrival_time',
            render: (text, record) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        {record.duration_minutes} phút
                    </div>
                )
            },
        },
        {
            title: "Địa điểm khởi hành",
            dataIndex: 'departure_airport',
            render: (text, record) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        <div>
                            <p className="leading-[20px]">{`${record?.departure_airport?.name}`}</p>
                        </div>
                    </div>
                )
            },
        },
        {
            title: "Địa điểm hạ cánh",
            dataIndex: 'arrival_airport',
            render: (text, record) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        <div>
                            <p className="leading-[20px]">{`${record?.arrival_airport?.name}`}</p>
                        </div>
                    </div>
                )

            },
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
            width: 50,
            render: (text, record) => (
                <Space>
                    <EditOutlined
                        style={{
                            fontSize: 20,
                            color: '#ffa500',
                        }}
                        type=""
                        onClick={() => {
                            setIsModalOpen(true);
                            setDataInit(record);
                        }}
                    />

                    <Popconfirm
                        placement="leftTop"
                        title={"Xác nhận xóa flight leg"}
                        description={"Bạn chắc chắn muốn xóa flight leg"}
                        onConfirm={() => handleDeleteFlightLeg(record.id)}
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

    const handleGetFlightLeg = async (query: string) => {
        setIsLoading(true);
        try {
            const res: any = await callFetchFlightLeg(query);
            setData(res.data);
            setMeta(res.meta);
        } catch (error: any) {
            toast.error(error.message, {
                position: "bottom-right",
            });
        }
        setIsLoading(false);
    };

    const handleChange = async (pagination: any) => {
        const { current, pageSize } = pagination

        await handleGetFlightLeg(`current=${current}&pageSize=${pageSize}&flight_id=${flight.id}&sort=id-desc`);
    };

    useEffect(() => {
        if (flight?.id) {
            handleGetFlightLeg(`current=${meta.currentPage}&pageSize=${meta.itemsPerPage}&flight_id=${flight.id}&sort=id-desc`);
        }
    }, [flight?.id]);

    return (
        <div>
            <h2 className="text-[16px] font-semibold">Danh sách các trạm dừng</h2>
            <div className="flex items-center justify-end gap-[10px]">
                <Button type="primary" onClick={() => {
                    setIsModalOpen(true);
                    setDataInit({});
                }}>Thêm mới</Button>
                <ReloadOutlined className="text-[18px] px-[6px] cursor-pointer" />
            </div>
            <div className="mt-[10px]">
                <ConfigProvider locale={vi_VN}>
                    <Table
                        className="table-ele"
                        loading={isLoading}
                        pagination={{
                            current: meta?.currentPage,
                            pageSize: meta?.itemsPerPage,
                            showSizeChanger: true,
                            total: meta?.totalItems,
                            showTotal: (total, range) => {
                                return (
                                    <div>
                                        {" "}
                                        {range[0]}-{range[1]} trên {total} bản ghi
                                    </div>
                                );
                            },
                        }}
                        onChange={handleChange}
                        columns={columns}
                        dataSource={data}
                    />
                </ConfigProvider>
            </div>
            <ModalFlightLegTable
                flight={flight}
                isModalOpen={isModalOpen}
                dataInit={dataInit}
                setDataInit={setDataInit}
                setIsModalOpen={setIsModalOpen}
                handleGetFlightLeg={handleGetFlightLeg}
                meta={meta}
            />
        </div>
    )
}

export default FlightLegTable