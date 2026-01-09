/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRef, useState } from "react";
import { Button, DatePicker, Input, Popconfirm, Space } from "antd";
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
import ModalActivityPromotion from "./ModalActivityPromotion";
import ModalActivityPromotionDetail from "./ModalActivityPromotionDetail";
import { HiOutlineCursorClick } from "react-icons/hi";
import _ from "lodash";

export default function ActivityPromotion() {
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
            sorter: true
        },
        {
            title: "Khuyến mãi",
            dataIndex: 'promotion',
            sorter: true,
            render: (_text, record, _index, _action) => {
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
            render: (_text, record, _index, _action) => {
                return (
                    <div className="line-clamp-6 w-[200px]">{record.description}</div>
                )
            },
            width: 200
        },
        {
            title: 'Giảm giá',
            dataIndex: 'discount',
            render: (_text, record, _index, _action) => {
                return (
                    <div>
                        <p>- Phần trăm: {record?.discount_percent}%</p>
                        <p>- Số tiền giảm giá: {formatCurrency(record?.discount_amount)}đ</p>
                    </div>
                )
            },
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
                const value: any = selectedKeys[0] || {};

                return (
                    <div style={{ padding: 12, width: 280 }}>
                        <Input
                            placeholder="Giảm giá phần trăm từ"
                            type="number"
                            value={value.min_discount_percent}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, min_discount_percent: e.target.value }
                                ])
                            }
                            onPressEnter={confirm as any}
                            style={{ marginBottom: 8 }}
                        />

                        <Input
                            placeholder="Giảm giá phần trăm đến"
                            type="number"
                            value={value.max_discount_percent}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, max_discount_percent: e.target.value }
                                ])
                            }
                            onPressEnter={confirm as any}
                            style={{ marginBottom: 8 }}
                        />
                        <Input
                            placeholder="Số tiền giảm giá từ"
                            type="number"
                            value={value.min_discount_amount}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, min_discount_amount: e.target.value }
                                ])
                            }
                            onPressEnter={confirm as any}
                            style={{ marginBottom: 8 }}
                        />

                        <Input
                            placeholder="Số tiền giảm giá đến"
                            type="number"
                            value={value.max_discount_amount}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, max_discount_amount: e.target.value }
                                ])
                            }
                            onPressEnter={confirm as any}
                            style={{ marginBottom: 8 }}
                        />
                        <Space>
                            <Button
                                type="primary"
                                size="small"
                                onClick={() => confirm()}
                            >
                                Tìm
                            </Button>
                            <Button
                                size="small"
                                onClick={() => {
                                    clearFilters?.();
                                    confirm();
                                }}
                            >
                                Reset
                            </Button>
                        </Space>
                    </div>
                );
            },
            onFilter: () => true, // bắt buộc để Antd không filter local
            hideInSearch: true,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'is_active',
            render: (_text, record, _index, _action) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        {PROMOTION_STATUS_VI[record?.is_active]}
                    </div>
                )
            },
            valueEnum: PROMOTION_STATUS_VI
        },
        {
            title: "Thời gian",
            dataIndex: 'time',
            render: (_text, record, _index, _action) => {
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
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
                const value: any = selectedKeys[0] || {};

                return (
                    <div style={{ padding: 12, width: 280 }}>
                        <DatePicker
                            placeholder="Ngày bắt đầu từ"
                            showTime
                            value={value.min_start_date ? dayjs(value.min_start_date) : null}
                            onChange={(date, _dateString) => {
                                setSelectedKeys([
                                    { ...value, min_start_date: date ? dayjs(date) : null }
                                ])

                            }}
                            style={{ marginBottom: 8, width: '100%' }}
                        />
                        <DatePicker
                            placeholder="Ngày bắt đầu đến"
                            showTime
                            value={value.max_start_date ? dayjs(value.max_start_date) : null}
                            onChange={(date, _dateString) => {
                                setSelectedKeys([
                                    { ...value, max_start_date: date ? dayjs(date) : null }
                                ])

                            }}
                            style={{ marginBottom: 8, width: '100%' }}
                        />
                        <DatePicker
                            placeholder="Ngày kết thúc từ"
                            showTime
                            value={value.min_end_date ? dayjs(value.min_end_date) : null}
                            onChange={(date, _dateString) => {
                                setSelectedKeys([
                                    { ...value, min_end_date: date ? dayjs(date) : null }
                                ])
                            }}
                            style={{ marginBottom: 8, width: '100%' }}
                        />
                        <DatePicker
                            placeholder="Ngày kết thúc đến"
                            showTime
                            value={value.max_end_date ? dayjs(value.max_end_date) : null}
                            onChange={(date, _dateString) => {
                                setSelectedKeys([
                                    { ...value, max_end_date: date ? dayjs(date) : null }
                                ])
                            }}
                            style={{ marginBottom: 8, width: '100%' }}
                        />
                        <Space>
                            <Button
                                type="primary"
                                size="small"
                                onClick={() => confirm()}
                            >
                                Tìm
                            </Button>
                            <Button
                                size="small"
                                onClick={() => {
                                    clearFilters?.();
                                    confirm();
                                }}
                            >
                                Reset
                            </Button>
                        </Space>
                    </div>
                );
            },
            onFilter: () => true, // bắt buộc để Antd không filter local
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
                        title={"Xác nhận xóa khuyễn mãi hoạt động"}
                        description={"Bạn chắc chắn muốn xóa khuyễn mãi hoạt động"}
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
                    </Popconfirm>
                </Space>
            ),

        },
    ];

    const buildQuery = (params: any, _sort: any, _filter: any) => {
        let temp = ""

        const clone = { ...params, currentPage: params.current, limit: params.pageSize };
        delete clone.current
        delete clone.pageSize

        temp += `current=${clone.currentPage}`
        temp += `&pageSize=${clone.limit}`
        if (_filter?.discount?.[0]?.min_discount_percent) {
            temp += `&min_discount_percent=${_filter?.discount?.[0]?.min_discount_percent}`
        }
        if (_filter?.discount?.[0]?.max_discount_percent) {
            temp += `&max_discount_percent=${_filter?.discount?.[0]?.max_discount_percent}`
        }

        if (_filter?.discount?.[0]?.min_discount_amount) {
            temp += `&min_discount_amount=${_filter?.discount?.[0]?.min_discount_amount}`
        }
        if (_filter?.discount?.[0]?.max_discount_amount) {
            temp += `&max_discount_amount=${_filter?.discount?.[0]?.max_discount_amount}`
        }

        if (_filter?.time?.[0]?.min_start_date) {
            temp += `&min_start_date=${dayjs(_filter.time[0].min_start_date).format("YYYY-MM-DD HH:mm:ss")}`
        }
        if (_filter?.time?.[0]?.max_start_date) {
            temp += `&max_start_date=${dayjs(_filter.time[0].max_start_date).format("YYYY-MM-DD HH:mm:ss")}`
        }
        if (_filter?.time?.[0]?.min_end_date) {
            temp += `&min_end_date=${dayjs(_filter.time[0].min_end_date).format("YYYY-MM-DD HH:mm:ss")}`
        }
        if (_filter?.time?.[0]?.max_end_date) {
            temp += `&max_end_date=${dayjs(_filter.time[0].max_end_date).format("YYYY-MM-DD HH:mm:ss")}`
        }

        if (clone.title) {
            temp += `&title=${clone.title}`
        }
        if (clone.description) {
            temp += `&description=${clone.description}`
        }
        if (clone.is_active) {
            temp += `&is_active=${clone.is_active === "true" ? 1 : 0}`
        }
        temp += `&promotion_type=${PROMOTION_TYPE.ACTIVITY}`

        // sort
        if (_.isEmpty(_sort)) {
            temp += `&sort=id-desc`
        }
        else {
            Object.entries(_sort).map(([key, val]) => {
                temp += `&sort=${key}-${val === "ascend" ? "asc" : "desc"}`
            })
        }

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
            <ModalActivityPromotion
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
            <ModalActivityPromotionDetail promotion={dataInit} isModalOpen={isModalDetailOpen} setIsModalOpen={setIsModalDetailOpen} />
        </div>
    );
}
