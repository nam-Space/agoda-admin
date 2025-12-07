/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRef, useState } from "react";
import { Button, notification, Popconfirm, Space } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ActionType, ProColumns } from "@ant-design/pro-components";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { callDeleteAirline } from "../../../config/api";
import DataTable from "../../antd/Table";
import { getImage, getUserAvatar } from "@/utils/imageUrl";
import { toast } from "react-toastify";
import { fetchAirline } from "@/redux/slice/airlineSlide";
import ModalAirline from "./ModalAirline";
import { ROLE } from "@/constants/role";

export default function Airline() {
    const user = useAppSelector(state => state.account.user)
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState(null);

    const tableRef = useRef<ActionType>(null);

    const isFetching = useAppSelector(state => state.airline.isFetching);
    const meta = useAppSelector(state => state.airline.meta);
    const airlines = useAppSelector(state => state.airline.data);
    const dispatch = useAppDispatch();

    const handleDeleteAirline = async (id: number | undefined) => {
        if (id) {
            const res: any = await callDeleteAirline(id);
            if (res?.isSuccess) {
                toast.success("Xóa airline thành công", {
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
            title: 'Người vận hành chuyến bay',
            dataIndex: 'flight_operations_staff',
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    record?.flight_operations_staff ? <div className="flex items-center gap-[10px]">
                        <img
                            src={getUserAvatar(record?.flight_operations_staff?.avatar)}
                            className="min-w-[40px] max-w-[40px] h-[40px] object-cover rounded-[50%]"
                        />
                        <div>
                            <p className="leading-[20px]">{`${record?.flight_operations_staff?.first_name} ${record?.flight_operations_staff?.last_name}`}</p>
                            <p className="leading-[20px] text-[#929292]">{`@${record?.flight_operations_staff?.username}`}</p>
                        </div>
                    </div> : <div></div>
                )
            },
        },
        {
            title: "Tên",
            dataIndex: 'name',
            sorter: true,
        },
        {
            title: "Ảnh logo",
            dataIndex: 'logo',
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <img src={`${getImage(record.logo)}`} />
                )
            },
            hideInSearch: true,
            width: 150
        },
        {
            title: "Mã hàng không",
            dataIndex: 'code',
            sorter: true,
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <div className="line-clamp-6">{record.description}</div>
                )
            },
            width: 350
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
                        title={"Xác nhận xóa airline"}
                        description={"Bạn chắc chắn muốn xóa airline"}
                        onConfirm={() => handleDeleteAirline(entity.id)}
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
        if (user.role === ROLE.FLIGHT_OPERATION_STAFF) {
            temp += `&flight_operations_staff_id=${user.id}`
        }


        temp += `&sort=id-desc`

        return temp;
    }

    return (
        <div>
            <DataTable
                actionRef={tableRef}
                headerTitle={"Danh sách airline"}
                rowKey="id"
                loading={isFetching}
                columns={columns}
                dataSource={airlines}
                request={async (params, sort, filter): Promise<any> => {
                    const query = buildQuery(params, sort, filter);
                    dispatch(fetchAirline({ query }))
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
            <ModalAirline
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
        </div>
    );
}
