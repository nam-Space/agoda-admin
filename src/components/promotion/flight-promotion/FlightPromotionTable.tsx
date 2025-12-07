
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, ConfigProvider, Popconfirm, Space, Table, Tag } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { DeleteOutlined, EditOutlined, ReloadOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import { callDeleteFlightPromotion, callFetchFlightPromotion } from "@/config/api";
import { toast } from "react-toastify";
import vi_VN from 'antd/locale/vi_VN';
import { formatCurrency } from "@/utils/formatCurrency";
import { HiOutlineCursorClick } from "react-icons/hi";
import { getImage } from "@/utils/imageUrl";
import ModalFlightPromotionUpsert from "./ModalFlightPromotionUpsert";
import ModalFlightDetail from "@/components/payment/flight/ModalFlightDetail";
// import ModalFlightLegUpsert from "./ModalFlightLegUpsert";

interface IProps {
    promotion?: any | null;
    canCreate?: boolean;
    canUpdate?: boolean;
    canDelete?: boolean;
}

export interface IMeta {
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
    totalItems: number;
}

const FlightPromotionTable = (props: IProps) => {
    const { promotion, canCreate, canUpdate, canDelete } = props;

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

    const [selectedFlight, setSelectedFlight] = useState({});
    const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);

    const handleDeleteFlightPromotion = async (id: number | undefined) => {
        if (id) {
            const res: any = await callDeleteFlightPromotion(id);
            if (res?.isSuccess) {
                await handleGetFlightPromotion(`current=${meta.currentPage}&pageSize=${meta.itemsPerPage}&promotion_id=${promotion.id}&sort=id-desc`);
                toast.success("Xóa flight promotion thành công", {
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
            title: "Hãng hàng không",
            dataIndex: 'airline',
            render: (text, record) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        <img
                            src={getImage(record?.flight?.airline?.logo)}
                            className="w-[70px] h-[50px] object-cover"
                        />
                        <div>
                            <p className="leading-[20px]">{`${record?.flight?.airline?.name}`}</p>
                        </div>
                    </div>
                )
            },
        },
        {
            title: "Chuyến bay",
            dataIndex: 'flight',
            render: (text, record) => {
                if (record?.flight?.legs?.length === 0) return <div></div>

                const recordLegSorted = [...record.flight.legs].sort((a: any, b: any) =>
                    new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime() // giảm dần
                );

                const firstLeg = recordLegSorted[0];
                const lastLeg = recordLegSorted[recordLegSorted.length - 1];

                return (
                    <div onClick={() => {
                        setSelectedFlight(record.flight)
                        setIsModalDetailOpen(true)
                    }} className="bg-gray-200 p-[10px] rounded-[10px] cursor-pointer hover:bg-gray-300 transition-all duration-150">
                        <div>
                            <div>
                                <Tag color="#2db7f5">1 chiều</Tag>
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
        },
        {
            title: "Giảm giá",
            dataIndex: 'discount_percent',
            render: (_, record) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        {record?.discount_percent}%
                    </div>
                )
            },
        },
        {
            title: "Tiền giảm giá",
            dataIndex: 'discount_amount',
            render: (_, record) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        {formatCurrency(record?.discount_amount)}đ
                    </div>
                )
            },
        },
        {
            title: "Ngày tạo",
            dataIndex: 'created_at',
            sorter: true,
            render: (_, record) => {
                return (
                    <>{dayjs(record.created_at).format('DD-MM-YYYY HH:mm:ss')}</>
                )
            },
        },
        ...((canUpdate || canDelete) ? [{

            title: "Hành động",
            width: 50,
            render: (_: any, record: any) => (
                <Space>
                    {canUpdate && <EditOutlined
                        style={{
                            fontSize: 20,
                            color: '#ffa500',
                        }}
                        type=""
                        onClick={() => {
                            setIsModalOpen(true);
                            setDataInit(record);
                        }}
                    />}

                    {canDelete && <Popconfirm
                        placement="leftTop"
                        title={"Xác nhận xóa flight promotion"}
                        description={"Bạn chắc chắn muốn xóa flight promotion"}
                        onConfirm={() => handleDeleteFlightPromotion(record.id)}
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

    const handleGetFlightPromotion = async (query: string) => {
        setIsLoading(true);
        try {
            const res: any = await callFetchFlightPromotion(query);
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

        await handleGetFlightPromotion(`current=${current}&pageSize=${pageSize}&promotion_id=${promotion.id}&sort=id-desc`);
    };

    useEffect(() => {
        if (promotion?.id) {
            handleGetFlightPromotion(`current=${meta.currentPage}&pageSize=${meta.itemsPerPage}&promotion_id=${promotion.id}&sort=id-desc`);
        }
    }, [promotion?.id]);

    return (
        <div>
            <h2 className="text-[16px] font-semibold">Danh sách các giảm giá chuyến bay</h2>
            <div className="flex items-center justify-end gap-[10px]">
                {canCreate && <Button
                    type="primary"
                    onClick={() => {
                        setIsModalOpen(true);
                        setDataInit({});
                    }}>
                    Thêm mới
                </Button>}

                <ReloadOutlined
                    onClick={() => handleGetFlightPromotion(`current=${meta.currentPage}&pageSize=${meta.itemsPerPage}&promotion_id=${promotion.id}&sort=id-desc`)}
                    className="text-[18px] px-[6px] cursor-pointer"
                />
            </div>
            <div className="mt-[10px]">
                <ConfigProvider locale={vi_VN}>
                    <Table
                        scroll={{ x: true }}
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
            <ModalFlightPromotionUpsert
                promotion={promotion}
                isModalOpen={isModalOpen}
                dataInit={dataInit}
                setDataInit={setDataInit}
                setIsModalOpen={setIsModalOpen}
                handleGetFlightPromotion={handleGetFlightPromotion}
                meta={meta}
            />
            <ModalFlightDetail
                flight={selectedFlight}
                isModalOpen={isModalDetailOpen}
                setIsModalOpen={setIsModalDetailOpen}
            />
        </div>
    )
}

export default FlightPromotionTable