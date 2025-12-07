
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, ConfigProvider, Popconfirm, Space, Table } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { DeleteOutlined, EditOutlined, ReloadOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import { callDeleteCarPromotion, callFetchCarPromotion } from "@/config/api";
import { toast } from "react-toastify";
import vi_VN from 'antd/locale/vi_VN';
import { getImage } from "@/utils/imageUrl";
import { formatCurrency } from "@/utils/formatCurrency";
import ModalCarPromotionUpsert from "./ModalCarPromotionUpsert";
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

const CarPromotionTable = (props: IProps) => {
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

    const handleDeleteCarPromotion = async (id: number | undefined) => {
        if (id) {
            const res: any = await callDeleteCarPromotion(id);
            if (res?.isSuccess) {
                await handleGetCarPromotion(`current=${meta.currentPage}&pageSize=${meta.itemsPerPage}&promotion_id=${promotion.id}&sort=id-desc`);
                toast.success("Xóa car promotion thành công", {
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
            title: "Xe taxi",
            dataIndex: 'car',
            render: (_, record) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        <img
                            src={getImage(record?.car?.image)}
                            className="w-[70px] h-[50px] object-cover"
                        />
                        <div>
                            <p className="leading-[20px]">{`${record?.car?.name}`}</p>
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
                        title={"Xác nhận xóa car promotion"}
                        description={"Bạn chắc chắn muốn xóa car promotion"}
                        onConfirm={() => handleDeleteCarPromotion(record.id)}
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

    const handleGetCarPromotion = async (query: string) => {
        setIsLoading(true);
        try {
            const res: any = await callFetchCarPromotion(query);
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

        await handleGetCarPromotion(`current=${current}&pageSize=${pageSize}&promotion_id=${promotion.id}&sort=id-desc`);
    };

    useEffect(() => {
        if (promotion?.id) {
            handleGetCarPromotion(`current=${meta.currentPage}&pageSize=${meta.itemsPerPage}&promotion_id=${promotion.id}&sort=id-desc`);
        }
    }, [promotion?.id]);

    return (
        <div>
            <h2 className="text-[16px] font-semibold">Danh sách các giảm giá xe taxi</h2>
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
                    onClick={() => handleGetCarPromotion(`current=${meta.currentPage}&pageSize=${meta.itemsPerPage}&promotion_id=${promotion.id}&sort=id-desc`)}
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
            <ModalCarPromotionUpsert
                promotion={promotion}
                isModalOpen={isModalOpen}
                dataInit={dataInit}
                setDataInit={setDataInit}
                setIsModalOpen={setIsModalOpen}
                handleGetCarPromotion={handleGetCarPromotion}
                meta={meta}
            />
        </div>
    )
}

export default CarPromotionTable