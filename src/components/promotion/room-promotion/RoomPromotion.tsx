/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRef, useState } from "react";
import { Button, Popconfirm, Space } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ActionType, ProColumns } from "@ant-design/pro-components";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { formatCurrency } from "@/utils/formatCurrency";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { callDeletePromotion } from "@/config/api";
import { PROMOTION_STATUS_VI, PROMOTION_TYPE } from "@/constants/promotion";
import DataTable from "../../antd/Table";
import { fetchPromotion } from "@/redux/slice/promotionSlide";
import ModalRoomPromotion from "./ModalRoomPromotion";
import { HiOutlineCursorClick } from "react-icons/hi";
import ModalRoomPromotionDetail from "./ModalRoomPromotionDetail";

interface IProps {
    canCreate?: boolean;
    canUpdate?: boolean;
    canDelete?: boolean;
}

export default function RoomPromotion(props: IProps) {
    const { canCreate, canUpdate, canDelete } = props
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState(null);
    const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
    const tableRef = useRef<ActionType>(null);

    const isFetching = useAppSelector(state => state.promotion.isFetching);
    const meta = useAppSelector(state => state.promotion.meta);
    const promotions = useAppSelector(state => state.promotion.data);
    const dispatch = useAppDispatch();

    const handleDeletePromotion = async (id: number | undefined) => {
        if (id) {
            const res: any = await callDeletePromotion(id);
            if (res?.isSuccess) {
                toast.success("Xóa promotion thành công", {
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
            title: "Khuyến mãi",
            dataIndex: 'promotion',
            sorter: true,
            hideInSearch: true,
            render: (text, record, index, action) => {
                return (
                    <div onClick={() => {
                        setDataInit(record)
                        setIsModalDetailOpen(true)
                    }} className="flex flex-col items-center bg-gray-200 p-[10px] rounded-[10px] cursor-pointer hover:bg-gray-300 transition-all duration-150">
                        <img className="w-[200px]" src={`${import.meta.env.VITE_BE_URL}${record?.image}`} />
                        <p className="mt-[6px] font-semibold text-[16px]">{record?.title}</p>
                        <div className="mt-[10px] flex items-center justify-center gap-[5px] text-[12px] italic">
                            <HiOutlineCursorClick />
                            <span>Click để xem chi tiết</span>
                        </div>
                    </div>
                )
            },
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <div className="line-clamp-6 w-[200px]">{record.description}</div>
                )
            },
            width: 200
        },
        {
            title: 'Giảm giá',
            dataIndex: 'discount_percent',
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        {record?.discount_percent}%
                    </div>
                )
            },
        },
        {
            title: 'Tiền giảm giá',
            dataIndex: 'discount_percent',
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        {formatCurrency(record?.discount_amount)}đ
                    </div>
                )
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'is_active',
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        {PROMOTION_STATUS_VI[record?.is_active]}
                    </div>
                )
            },
        },
        {
            title: "Thời gian",
            dataIndex: 'created_at',
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        <ul>
                            <li>- Ngày tạo: {dayjs(record.created_at).format('DD-MM-YYYY HH:mm:ss')}</li>
                            <li>- Ngày bắt đầu: {dayjs(record.start_date).format('DD-MM-YYYY HH:mm:ss')}</li>
                            <li>- Ngày kết thúc: {dayjs(record.end_date).format('DD-MM-YYYY HH:mm:ss')}</li>
                        </ul>
                    </div>
                )
            },
            hideInSearch: true,
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
                        title={"Xác nhận xóa khuyễn mãi"}
                        description={"Bạn chắc chắn muốn xóa khuyễn mãi"}
                        onConfirm={() => handleDeletePromotion(entity.id)}
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

    const buildQuery = (params: any, sort: any, filter: any) => {
        let temp = ""

        const clone = { ...params, currentPage: params.current, limit: params.pageSize };
        delete clone.current
        delete clone.pageSize

        temp += `current=${clone.currentPage}`
        temp += `&pageSize=${clone.limit}`
        if (clone.name) {
            temp += `&name=${clone.name}`
        }
        if (clone.description) {
            temp += `&description=${clone.description}`
        }
        temp += `&promotion_type=${PROMOTION_TYPE.HOTEL}`

        temp += `&sort=id-desc`

        return temp;
    }

    return (
        <div>
            <DataTable
                actionRef={tableRef}
                headerTitle={"Danh sách khuyễn mãi"}
                rowKey="id"
                loading={isFetching}
                columns={columns}
                dataSource={promotions}
                request={async (params, sort, filter): Promise<any> => {
                    const query = buildQuery(params, sort, filter);
                    dispatch(fetchPromotion({ query }))
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
            <ModalRoomPromotion
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
            <ModalRoomPromotionDetail promotion={dataInit} isModalOpen={isModalDetailOpen} setIsModalOpen={setIsModalDetailOpen} />
        </div>
    );
}
