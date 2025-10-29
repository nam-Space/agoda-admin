/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRef, useState } from "react";
import { Button, message, notification, Popconfirm, Space } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ActionType, ProColumns } from "@ant-design/pro-components";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { callDeleteActivityDate, callDeleteBulkActivityDate } from "../../../config/api";
import DataTable from "../../antd/Table";
import { fetchActivityDate } from "@/redux/slice/activityDateSlide";
import ModalActivityDate from "./ModalActivityDate";
import { toast } from "react-toastify";
import { formatCurrency } from "@/utils/formatCurrency";
import { getImage } from "@/utils/imageUrl";
export default function ActivityDate() {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState(null);

    const tableRef = useRef<ActionType>(null);

    const isFetching = useAppSelector(state => state.activityDate.isFetching);
    const meta = useAppSelector(state => state.activityDate.meta);
    const cities = useAppSelector(state => state.activityDate.data);
    const dispatch = useAppDispatch();

    const [selectedRows, setSelectedRows] = useState<any>([]);

    const handleDeleteActivityDate = async (id: number | undefined) => {
        if (id) {
            const res: any = await callDeleteActivityDate(id);
            if (res?.isSuccess) {
                toast.success("Xóa activity date thành công", {
                    position: "bottom-right",
                });
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        }
    }

    const handleDeleteMultipleRow = async () => {
        if (selectedRows.length > 0) {
            const res: any = await callDeleteBulkActivityDate(selectedRows.map((item: any) => item.id));
            if (res?.isSuccess) {
                toast.success("Xóa danh sách activity date thành công", {
                    position: "bottom-right",
                });
                reloadTable();
            } else {
                toast.success(res.message, {
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
            title: "Ngày tổ chức",
            dataIndex: 'date_launch',
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <>{dayjs(record.date_launch).format('DD-MM-YYYY HH:mm:ss')}</>
                )
            },
            hideInSearch: true,
        },
        {
            title: 'Giá người lớn',
            dataIndex: 'price_adult',
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <div>{formatCurrency(record?.price_adult)}đ</div>
                )
            },
        },
        {
            title: 'Giá trẻ em',
            dataIndex: 'price_child',
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <div>{formatCurrency(record?.price_child)}đ</div>
                )
            },
        },
        {
            title: 'Số lượng người lớn',
            dataIndex: 'adult_quantity',
            sorter: true,
        },
        {
            title: 'Số lượng trẻ em',
            dataIndex: 'child_quantity',
            sorter: true,
        },
        {
            title: "Tên hoạt động",
            dataIndex: 'activity',
            sorter: true,
            hideInSearch: true,
            render: (text, record, index, action) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        <img
                            src={getImage(record?.activity_package?.activity?.images?.[0]?.image)}
                            className="w-[70px] h-[50px] object-cover"
                        />
                        <div>
                            ({record?.activity_package?.activity?.name})
                        </div>
                    </div>
                )
            },
        },
        {
            title: "Gói của hoạt động",
            dataIndex: 'activity_package',
            sorter: true,
            hideInSearch: true,
            render: (text, record, index, action) => {
                return (
                    <div>{record?.activity_package?.name}</div>
                )
            },
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
                        title={"Xác nhận xóa activity date"}
                        description={"Bạn chắc chắn muốn xóa activity date"}
                        onConfirm={() => handleDeleteActivityDate(entity.id)}
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
                headerTitle={"Danh sách activity date"}
                rowKey="id"
                loading={isFetching}
                columns={columns}
                dataSource={cities}
                request={async (params, sort, filter): Promise<any> => {
                    const query = buildQuery(params, sort, filter);
                    dispatch(fetchActivityDate({ query }))
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
                rowSelection={{
                    onChange: (_, selectedRows) => {
                        setSelectedRows(selectedRows);
                    }
                }}
                handleDelete={handleDeleteMultipleRow}
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
            <ModalActivityDate
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
        </div>
    );
}
