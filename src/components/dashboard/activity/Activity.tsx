/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRef, useState } from "react";
import { Button, message, notification, Popconfirm, Space } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ActionType, ProColumns } from "@ant-design/pro-components";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { callDeleteActivity } from "../../../config/api";
import DataTable from "../../antd/Table";
import { fetchActivity } from "@/redux/slice/activitySlide";
import ModalActivity from "./ModalActivity";
import { formatCurrency } from "@/utils/formatCurrency";
import { CATEGORY_ACTIVITY } from "@/constants/activity";
export default function Activity() {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState(null);

    const tableRef = useRef<ActionType>(null);

    const isFetching = useAppSelector(state => state.activity.isFetching);
    const meta = useAppSelector(state => state.activity.meta);
    const activities = useAppSelector(state => state.activity.data);
    const dispatch = useAppDispatch();

    const handleDeleteActivity = async (id: number | undefined) => {
        if (id) {
            const res: any = await callDeleteActivity(id);
            if (res?.isSuccess) {
                message.success('Xóa activity thành công');
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
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
            title: "Thành phố",
            dataIndex: 'city',
            sorter: true,
            hideInSearch: true,
            render: (text, record, index, action) => {
                return (
                    <div>{record?.city?.name}</div>
                )
            },
        },
        {
            title: "Ảnh",
            dataIndex: 'image',
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <img src={`${import.meta.env.VITE_BE_URL}${record?.images?.[0]?.image}`} />
                )
            },
            hideInSearch: true,
            width: 150
        },
        {
            title: "Tên hoạt động",
            dataIndex: 'name',
            sorter: true,
            width: 500
        },
        {
            title: 'Danh mục',
            dataIndex: 'category',
            render: (text, record, index, action) => {
                return (
                    <span>{(CATEGORY_ACTIVITY as any)[record.category]}</span>
                )
            },
            sorter: true,
        },
        {
            title: 'Giá trung bình',
            dataIndex: 'avg_price',
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <div>{formatCurrency(record?.avg_price)}đ</div>
                )
            },
        },
        {
            title: 'Sao trung bình',
            dataIndex: 'avg_star',
            sorter: true,
        },
        {
            title: 'Tổng số giờ chơi',
            dataIndex: 'total_time',
            sorter: true,
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
                        title={"Xác nhận xóa hoạt động"}
                        description={"Bạn chắc chắn muốn xóa hoạt động"}
                        onConfirm={() => handleDeleteActivity(entity.id)}
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
        if (clone.name) {
            temp += `&name=${clone.name}`
        }
        if (clone.description) {
            temp += `&description=${clone.description}`
        }

        return temp;
    }

    return (
        <div>
            <DataTable
                actionRef={tableRef}
                headerTitle={"Danh sách activity"}
                rowKey="id"
                loading={isFetching}
                columns={columns}
                dataSource={activities}
                request={async (params, sort, filter): Promise<any> => {
                    const query = buildQuery(params, sort, filter);
                    dispatch(fetchActivity({ query }))
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
            <ModalActivity
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
        </div>
    );
}
