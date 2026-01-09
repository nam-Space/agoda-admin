
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, ConfigProvider, Popconfirm, Space, Table } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { DeleteOutlined, EditOutlined, ReloadOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import { callDeleteActivityPromotion, callFetchActivityPromotion } from "@/config/api";
import { toast } from "react-toastify";
import vi_VN from 'antd/locale/vi_VN';
import { getImage } from "@/utils/imageUrl";
import { formatCurrency } from "@/utils/formatCurrency";
import ModalActivityPromotionUpsert from "./ModalActivityPromotionUpsert";
import { HiOutlineCursorClick } from "react-icons/hi";
import ModalActivityDateDetail from "@/components/dashboard/activity-date/ModalActivityDateDetail";
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

const ActivityPromotionTable = (props: IProps) => {
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
    const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
    const [dataInit, setDataInit] = useState({});

    const handleDeleteActivityPromotion = async (id: number | undefined) => {
        if (id) {
            const res: any = await callDeleteActivityPromotion(id);
            if (res?.isSuccess) {
                await handleGetActivityPromotion(`current=${meta.currentPage}&pageSize=${meta.itemsPerPage}&promotion_id=${promotion.id}&sort=id-desc`);
                toast.success("Xóa activity promotion thành công", {
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
            title: "Hoạt động",
            dataIndex: 'activity',
            render: (_text, record) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        <img
                            src={getImage(record?.activity_date?.activity_package?.activity?.thumbnail)}
                            className="w-[70px] h-[50px] object-cover"
                        />
                        <div>
                            <p className="leading-[20px]">{`${record?.activity_date?.activity_package?.activity?.name}`}</p>
                        </div>
                    </div>
                )
            },
        },
        {
            title: "Gói hoạt động",
            dataIndex: 'activity_package',
            render: (_text, record) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        <div>
                            <p className="leading-[20px]">{`${record?.activity_date?.activity_package?.name}`}</p>
                        </div>
                    </div>
                )
            },
        },
        {
            title: "Ngày tổ chức",
            dataIndex: 'activity_date',
            render: (_text, record) => {
                return (
                    <div onClick={() => {
                        setDataInit(record)
                        setIsModalDetailOpen(true)
                    }} className="bg-gray-200 p-[10px] rounded-[10px] cursor-pointer hover:bg-gray-300 transition-all duration-150">
                        <div className="flex items-center gap-[10px]">
                            <div>
                                <p className="leading-[20px]">{`${dayjs(record?.activity_date?.date_launch).format("YYYY-MM-DD")}`}</p>
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
                        title={"Xác nhận xóa activity promotion"}
                        description={"Bạn chắc chắn muốn xóa activity promotion"}
                        onConfirm={() => handleDeleteActivityPromotion(record.id)}
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

    const handleGetActivityPromotion = async (query: string) => {
        setIsLoading(true);
        try {
            const res: any = await callFetchActivityPromotion(query);
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

        await handleGetActivityPromotion(`current=${current}&pageSize=${pageSize}&promotion_id=${promotion.id}&sort=id-desc`);
    };

    useEffect(() => {
        if (promotion?.id) {
            handleGetActivityPromotion(`current=${meta.currentPage}&pageSize=${meta.itemsPerPage}&promotion_id=${promotion.id}&sort=id-desc`);
        }
    }, [promotion?.id]);

    return (
        <div>
            <h2 className="text-[16px] font-semibold">Danh sách các giảm giá hoạt động</h2>
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
                    onClick={() => handleGetActivityPromotion(`current=${meta.currentPage}&pageSize=${meta.itemsPerPage}&promotion_id=${promotion.id}&sort=id-desc`)}
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
            <ModalActivityPromotionUpsert
                promotion={promotion}
                isModalOpen={isModalOpen}
                dataInit={dataInit}
                setDataInit={setDataInit}
                setIsModalOpen={setIsModalOpen}
                handleGetActivityPromotion={handleGetActivityPromotion}
                meta={meta}
            />
            <ModalActivityDateDetail activityDate={(dataInit as any)?.activity_date} isModalOpen={isModalDetailOpen} setIsModalOpen={setIsModalDetailOpen} />
        </div>
    )
}

export default ActivityPromotionTable