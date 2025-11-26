
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, ConfigProvider, Popconfirm, Space, Table } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { DeleteOutlined, EditOutlined, ReloadOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import { callDeleteSeatClassPricing, callFetchSeatClassPricing } from "@/config/api";
import { toast } from "react-toastify";
import vi_VN from 'antd/locale/vi_VN';
import { HAS_FREE_DRINK_VI, HAS_LOUNGE_ACCESS_VI, HAS_MEAL_VI, HAS_POWER_OUTLET_VI, HAS_PRIORITY_BOARDING_VI, SEAT_CLASS_VI } from "@/constants/airline";
import ModalSeatClassPricingTable from "./ModalSeatClassPricingTable";

interface IProps {
    flight?: any | null;
}

const SeatClassPricingTable = (props: IProps) => {
    const { flight } = props;

    const [data, setData] = useState([]);
    const [meta, setMeta] = useState({
        currentPage: 1,
        itemsPerPage: 10,
        totalPages: 0,
        totalItems: 0,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dataInit, setDataInit] = useState({});

    const handleDeleteSeatClassPricingTable = async (id: number | undefined) => {
        if (id) {
            const res: any = await callDeleteSeatClassPricing(id);
            if (res?.isSuccess) {
                await handleGetSeatClassPricing(`current=${meta.currentPage}&pageSize=${meta.itemsPerPage}&flight_id=${flight.id}&sort=id-desc`);
                toast.success("Xóa seat class pricing thành công", {
                    position: "bottom-right",
                });
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
            title: "Loại ghế",
            dataIndex: 'seat_class',
            render: (text, record) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        {SEAT_CLASS_VI[record.seat_class]}
                    </div>
                )
            },
        },
        {
            title: "Hệ số giá",
            dataIndex: 'multiplier',
        },
        {
            title: "Tổng số ghế",
            dataIndex: 'capacity',
        },
        {
            title: "Số ghế khả dụng",
            dataIndex: 'available_seats',
            render: (_, record) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        {record.available_seats}
                    </div>
                )
            },
        },
        {
            title: "Đồ ăn",
            dataIndex: 'has_meal',
            render: (text, record) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        {HAS_MEAL_VI[record.has_meal]}
                    </div>
                )
            },
        },
        {
            title: "Đồ uông miễn phí",
            dataIndex: 'has_free_drink',
            render: (text, record) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        {HAS_FREE_DRINK_VI[record.has_free_drink]}
                    </div>
                )
            },
        },
        {
            title: "Phòng chờ",
            dataIndex: 'has_lounge_access',
            render: (text, record) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        {HAS_LOUNGE_ACCESS_VI[record.has_lounge_access]}
                    </div>
                )
            },
        },
        {
            title: "Ổ cắm điện",
            dataIndex: 'has_power_outlet',
            render: (text, record) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        {HAS_POWER_OUTLET_VI[record.has_power_outlet]}
                    </div>
                )
            },
        },
        {
            title: "Ưu tiên lên máy bay",
            dataIndex: 'has_priority_boarding',
            render: (text, record) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        {HAS_PRIORITY_BOARDING_VI[record.has_priority_boarding]}
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
                        title={"Xác nhận xóa seat class pricing"}
                        description={"Bạn chắc chắn muốn xóa seat class pricing"}
                        onConfirm={() => handleDeleteSeatClassPricingTable(record.id)}
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

    const handleGetSeatClassPricing = async (query: string) => {
        setIsLoading(true);
        try {
            const res: any = await callFetchSeatClassPricing(query);
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

        await handleGetSeatClassPricing(`current=${current}&pageSize=${pageSize}&flight_id=${flight.id}&sort=id-desc`);
    };

    useEffect(() => {
        if (flight?.id) {
            handleGetSeatClassPricing(`current=${meta.currentPage}&pageSize=${meta.itemsPerPage}&flight_id=${flight.id}&sort=id-desc`);
        }
    }, [flight?.id]);

    return (
        <div>
            <h2 className="text-[16px] font-semibold">Danh sách các hạng ghế</h2>
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
            <ModalSeatClassPricingTable
                flight={flight}
                isModalOpen={isModalOpen}
                dataInit={dataInit}
                setDataInit={setDataInit}
                setIsModalOpen={setIsModalOpen}
                handleGetSeatClassPricing={handleGetSeatClassPricing}
                meta={meta}
            />
        </div>
    )
}

export default SeatClassPricingTable