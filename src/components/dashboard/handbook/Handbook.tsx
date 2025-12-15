/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRef, useState } from "react";
import { Button, Popconfirm, Space } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ActionType, ProColumns } from "@ant-design/pro-components";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { callDeleteHandbook } from "../../../config/api";
import DataTable from "../../antd/Table";
import { getImage, getUserAvatar } from "@/utils/imageUrl";
import { fetchHandbook } from "@/redux/slice/handbookSlide";
import ModalHandbook from "./ModalHandbook";
import { toast } from "react-toastify";
import { CATEGORY_HANDBOOK_VI } from "@/constants/handbook";
import { ROLE } from "@/constants/role";

export default function Handbook() {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState(null);

    const user = useAppSelector(state => state.account.user)

    const tableRef = useRef<ActionType>(null);

    const isFetching = useAppSelector(state => state.handbook.isFetching);
    const meta = useAppSelector(state => state.handbook.meta);
    const handbooks = useAppSelector(state => state.handbook.data);
    const dispatch = useAppDispatch();

    const handleDeleteHandbook = async (id: number | undefined) => {
        if (id) {
            const res: any = await callDeleteHandbook(id);
            if (res?.isSuccess) {
                toast.success("Xóa handbook thành công", {
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
            title: 'Tác giả',
            dataIndex: 'author',
            sorter: true,
            render: (_text, record, _index, _action) => {
                return (
                    record?.author ? <div className="flex items-center gap-[10px]">
                        <img
                            src={getUserAvatar(record?.author?.avatar)}
                            className="min-w-[40px] max-w-[40px] h-[40px] object-cover rounded-[50%]"
                        />
                        <div>
                            <p className="leading-[20px]">{`${record?.author?.first_name} ${record?.author?.last_name}`}</p>
                            <p className="leading-[20px] text-[#929292]">{`@${record?.author?.username}`}</p>
                        </div>
                    </div> : <div></div>
                )
            },
        },
        {
            title: "Tiêu đề",
            dataIndex: 'title',
            sorter: true,
            render: (_text, record, _index, _action) => {
                return (
                    <div className="font-bold">
                        {record?.title}
                    </div>
                )
            },
        },
        {
            title: "Ảnh thumnail",
            dataIndex: 'image',
            sorter: true,
            render: (_text, record, _index, _action) => {
                return (
                    <img src={`${getImage(record.image)}`} />
                )
            },
            hideInSearch: true,
            width: 150
        },
        {
            title: "Danh mục",
            dataIndex: 'category',
            sorter: true,
            render: (_text, record, _index, _action) => {
                return (
                    <div>{(CATEGORY_HANDBOOK_VI as any)[record.category]}</div>
                )
            },
            hideInSearch: true,
        },
        {
            title: 'Mô tả ngắn',
            dataIndex: 'short_description',
            sorter: true,
            render: (_text, record, _index, _action) => {
                return (
                    <div className="line-clamp-6 w-[200px]">{record.short_description}</div>
                )
            },
            width: 200
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
            title: "Ngày tạo",
            dataIndex: 'created_at',
            sorter: true,
            render: (_text, record, _index, _action) => {
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
                        title={"Xác nhận xóa handbook"}
                        description={"Bạn chắc chắn muốn xóa handbook"}
                        onConfirm={() => handleDeleteHandbook(entity.id)}
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
        if (clone.title) {
            temp += `&title=${clone.title}`
        }
        if (clone.description) {
            temp += `&description=${clone.description}`
        }
        if (clone.short_description) {
            temp += `&short_description=${clone.short_description}`
        }

        if (user?.id && user.role !== ROLE.ADMIN) {
            temp += `&author_id=${user.id}`
        }

        temp += `&sort=id-desc`

        return temp;
    }

    return (
        <div>
            <DataTable
                actionRef={tableRef}
                headerTitle={"Danh sách handbook"}
                rowKey="id"
                loading={isFetching}
                columns={columns}
                dataSource={handbooks}
                request={async (params, sort, filter): Promise<any> => {
                    const query = buildQuery(params, sort, filter);
                    dispatch(fetchHandbook({ query }))
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
            <ModalHandbook
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
        </div>
    );
}
