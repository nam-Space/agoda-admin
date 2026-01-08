/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from "react";
import { Button, Input, Popconfirm, Select, Space } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ActionType, ProColumns } from "@ant-design/pro-components";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { callDeleteCar, callFetchUser } from "../../../config/api";
import DataTable from "../../antd/Table";
import { getUserAvatar } from "@/utils/imageUrl";
import { fetchCar } from "@/redux/slice/carSlide";
import ModalCar from "./ModalCar";
import { formatCurrency } from "@/utils/formatCurrency";
import { ROLE } from "@/constants/role";
import { toast } from "react-toastify";
import _ from "lodash";
export default function Car() {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState(null);
    const user = useAppSelector(state => state.account.user)

    const tableRef = useRef<ActionType>(null);

    const isFetching = useAppSelector(state => state.car.isFetching);
    const meta = useAppSelector(state => state.car.meta);
    const cars = useAppSelector(state => state.car.data);
    const dispatch = useAppDispatch();

    const [users, setUsers] = useState([])

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

    const handleGetUser = async (query: string) => {
        const res: any = await callFetchUser(query)
        if (res.isSuccess) {
            setUsers(res.data)
        }
    }

    useEffect(() => {
        handleGetUser(`current=1&pageSize=1000&role=${ROLE.DRIVER}`)
    }, [])

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
            title: "Tên xe",
            dataIndex: 'name',
            sorter: true,

        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            sorter: true,
            render: (_text, record, _index, _action) => {
                return (
                    <div className="line-clamp-6">{record.description}</div>
                )
            },
            width: 200
        },
        {
            title: "Ảnh",
            dataIndex: 'image',
            render: (_text, record, _index, _action) => {
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
            render: (_text, record, _index, _action) => {
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
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {

                const value: any = selectedKeys[0] || {};

                return (
                    <div style={{ padding: 12, width: 280 }}>
                        <Select
                            placeholder="Tài xế"
                            allowClear
                            value={value.user_id}
                            onChange={(val: any) =>
                                setSelectedKeys([
                                    { ...value, user_id: val }
                                ])
                            }
                            options={users.map((item: any) => ({
                                label: <div className="flex items-center gap-[10px]">
                                    <img
                                        src={getUserAvatar(item?.avatar)}
                                        className="min-w-[40px] max-w-[40px] h-[40px] object-cover rounded-[50%]"
                                    />
                                    <div>
                                        <p className="leading-[20px]">{`${item?.first_name} ${item?.last_name}`}</p>
                                        <p className="leading-[20px] text-[#929292]">{`@${item?.username}`}</p>
                                    </div>
                                </div>,
                                value: item.id,
                            }))}
                            style={{ width: "100%", marginBottom: 8, height: 60 }}
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
            width: 150
        },
        {
            title: 'Đại lượng',
            dataIndex: 'val',
            render: (_text, record, _index, _action) => {
                return (
                    <div>
                        <p>Giá mỗi km: {formatCurrency(record.price_per_km)}đ</p>
                        <p>Tốc độ trung bình: {record.avg_speed} km/h</p>
                        <p>Sức chứa tối đa: {record.capacity} người</p>
                        <p>Số hành lý tối đa: {record.luggage}</p>
                        <p>Số sao trung bình: {record.avg_star}</p>
                    </div>
                )
            },
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
                const value: any = selectedKeys[0] || {};

                return (
                    <div style={{ padding: 12, width: 280 }}>
                        <Input
                            placeholder="Giá mỗi km từ"
                            type="number"
                            value={value.min_price_per_km}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, min_price_per_km: e.target.value }
                                ])
                            }
                            onPressEnter={confirm as any}
                            style={{ marginBottom: 8 }}
                        />

                        <Input
                            placeholder="Giá mỗi km đến"
                            type="number"
                            value={value.max_price_per_km}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, max_price_per_km: e.target.value }
                                ])
                            }
                            onPressEnter={confirm as any}
                            style={{ marginBottom: 8 }}
                        />
                        <Input
                            placeholder="Tốc độ trung bình từ"
                            type="number"
                            value={value.min_avg_speed}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, min_avg_speed: e.target.value }
                                ])
                            }
                            onPressEnter={confirm as any}
                            style={{ marginBottom: 8 }}
                        />

                        <Input
                            placeholder="Tốc độ trung bình đến"
                            type="number"
                            value={value.max_avg_speed}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, max_avg_speed: e.target.value }
                                ])
                            }
                            onPressEnter={confirm as any}
                            style={{ marginBottom: 8 }}
                        />
                        <Input
                            placeholder="Sức chứa tối đa từ"
                            type="number"
                            value={value.min_capacity}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, min_capacity: e.target.value }
                                ])
                            }
                            onPressEnter={confirm as any}
                            style={{ marginBottom: 8 }}
                        />

                        <Input
                            placeholder="Sức chứa tối đa đến"
                            type="number"
                            value={value.max_capacity}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, max_capacity: e.target.value }
                                ])
                            }
                            onPressEnter={confirm as any}
                            style={{ marginBottom: 8 }}
                        />
                        <Input
                            placeholder="Số hành lý tối đa từ"
                            type="number"
                            value={value.min_luggage}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, min_luggage: e.target.value }
                                ])
                            }
                            onPressEnter={confirm as any}
                            style={{ marginBottom: 8 }}
                        />

                        <Input
                            placeholder="Số hành lý tối đa đến"
                            type="number"
                            value={value.max_luggage}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, max_luggage: e.target.value }
                                ])
                            }
                            onPressEnter={confirm as any}
                            style={{ marginBottom: 8 }}
                        />
                        <Input
                            placeholder="Số sao trung bình từ"
                            type="number"
                            value={value.min_avg_star}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, min_avg_star: e.target.value }
                                ])
                            }
                            onPressEnter={confirm as any}
                            style={{ marginBottom: 8 }}
                        />

                        <Input
                            placeholder="Số sao trung bình đến"
                            type="number"
                            value={value.max_avg_star}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, max_avg_star: e.target.value }
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

    const buildQuery = (params: any, _sort: any, _filter: any) => {
        let temp = ""

        const clone = { ...params, currentPage: params.current, limit: params.pageSize };
        delete clone.current
        delete clone.pageSize

        temp += `current=${clone.currentPage}`
        temp += `&pageSize=${clone.limit}`

        if (_filter?.user?.[0]?.user_id) {
            temp += `&user_id=${_filter?.user?.[0]?.user_id}`
        }

        if (_filter?.val?.[0]?.min_avg_star) {
            temp += `&min_avg_star=${_filter?.val?.[0]?.min_avg_star}`
        }

        if (_filter?.val?.[0]?.max_avg_star) {
            temp += `&max_avg_star=${_filter?.val?.[0]?.max_avg_star}`
        }

        if (_filter?.val?.[0]?.min_price_per_km) {
            temp += `&min_price_per_km=${_filter?.val?.[0]?.min_price_per_km}`
        }

        if (_filter?.val?.[0]?.max_price_per_km) {
            temp += `&max_price_per_km=${_filter?.val?.[0]?.max_price_per_km}`
        }

        if (_filter?.val?.[0]?.min_avg_speed) {
            temp += `&min_avg_speed=${_filter?.val?.[0]?.min_avg_speed}`
        }

        if (_filter?.val?.[0]?.max_avg_speed) {
            temp += `&max_avg_speed=${_filter?.val?.[0]?.max_avg_speed}`
        }

        if (_filter?.val?.[0]?.min_capacity) {
            temp += `&min_capacity=${_filter?.val?.[0]?.min_capacity}`
        }

        if (_filter?.val?.[0]?.max_capacity) {
            temp += `&max_capacity=${_filter?.val?.[0]?.max_capacity}`
        }

        if (_filter?.val?.[0]?.min_luggage) {
            temp += `&min_luggage=${_filter?.val?.[0]?.min_luggage}`
        }

        if (_filter?.val?.[0]?.max_luggage) {
            temp += `&max_luggage=${_filter?.val?.[0]?.max_luggage}`
        }

        if (clone.name) {
            temp += `&name=${clone.name}`
        }
        if (clone.description) {
            temp += `&description=${clone.description}`
        }
        if (user.role === ROLE.DRIVER) {
            temp += `&user_id=${user.id}`
        }

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
