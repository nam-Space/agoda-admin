/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRef, useState } from "react";
import { Avatar, Button, message, notification, Popconfirm, Space } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ActionType, ProColumns } from "@ant-design/pro-components";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { callDeleteCar } from "../../../config/api";
import DataTable from "../../antd/Table";
import { fetchCity } from "@/redux/slice/citySlide";
import { getUserAvatar } from "@/utils/imageUrl";
import { fetchCar } from "@/redux/slice/carSlide";
import ModalCar from "./ModalCar";
import { formatCurrency } from "@/utils/formatCurrency";
import { ROLE } from "@/constants/role";
import { toast } from "react-toastify";
export default function Car() {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState(null);
    const user = useAppSelector(state => state.account.user)

    const tableRef = useRef<ActionType>(null);

    const isFetching = useAppSelector(state => state.car.isFetching);
    const meta = useAppSelector(state => state.car.meta);
    const cars = useAppSelector(state => state.car.data);
    const dispatch = useAppDispatch();

    const handleDeleteCar = async (id: number | undefined) => {
        if (id) {
            const res: any = await callDeleteCar(id);
            if (res?.isSuccess) {
                toast.success("Xóa car thành công", {
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
            title: "Tên xe",
            dataIndex: 'name',
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
            width: 200
        },
        {
            title: "Ảnh",
            dataIndex: 'image',
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <img src={`${import.meta.env.VITE_BE_URL}${record.image}`} />
                )
            },
            hideInSearch: true,
            width: 150
        },

        {
            title: "Tài xế",
            dataIndex: 'user',
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    record?.user ?
                        <div className="flex items-center gap-[10px]">
                            <img
                                src={getUserAvatar(record?.user?.avatar)}
                                className="min-w-[40px] max-w-[40px] h-[40px] object-cover rounded-[50%]"
                            />
                            <div>
                                <p className="leading-[20px]">{`${record?.user?.first_name} ${record?.user?.last_name}`}</p>
                                <p className="leading-[20px] text-[#929292]">{`@${record?.user?.username}`}</p>
                            </div>
                        </div> : <div></div>
                )
            },
            hideInSearch: true,
            width: 150
        },
        {
            title: 'Sao trung bình',
            dataIndex: 'avg_star',
            sorter: true,
        },
        {
            title: 'Giá mỗi km',
            dataIndex: 'price_per_km',
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <p>{formatCurrency(record.price_per_km)}đ</p>
                    </div>
                )
            },
        },
        {
            title: 'Tốc độ trung bình',
            dataIndex: 'avg_speed',
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <p>{record.avg_speed} km/h</p>
                    </div>
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
                        title={"Xác nhận xóa car"}
                        description={"Bạn chắc chắn muốn xóa car"}
                        onConfirm={() => handleDeleteCar(entity.id)}
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
        if (user.role === ROLE.DRIVER) {
            temp += `&user_id=${user.id}`
        }

        temp += `&sort=id-desc`

        return temp;
    }

    return (
        <div>
            <DataTable
                actionRef={tableRef}
                headerTitle={"Danh sách car"}
                rowKey="id"
                loading={isFetching}
                columns={columns}
                dataSource={cars}
                request={async (params, sort, filter): Promise<any> => {
                    const query = buildQuery(params, sort, filter);
                    dispatch(fetchCar({ query }))
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
            <ModalCar
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
        </div>
    );
}
