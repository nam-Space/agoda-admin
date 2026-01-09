/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from "react";
import { Button, Input, Popconfirm, Select, Space } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ActionType, ProColumns } from "@ant-design/pro-components";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { callDeleteActivity, callFetchCity, callFetchUser } from "../../../config/api";
import DataTable from "../../antd/Table";
import { fetchActivity } from "@/redux/slice/activitySlide";
import ModalActivity from "./ModalActivity";
import { formatCurrency } from "@/utils/formatCurrency";
import { CATEGORY_ACTIVITY } from "@/constants/activity";
import { getUserAvatar } from "@/utils/imageUrl";
import { ROLE } from "@/constants/role";
import { toast } from "react-toastify";
import _ from "lodash";
import { HiOutlineCursorClick } from "react-icons/hi";
import ModalActivityDetail from "./ModalActivityDetail";

interface IProps {
    canCreate?: boolean;
    canUpdate?: boolean;
    canDelete?: boolean;
}

export default function Activity(props: IProps) {
    const { canCreate, canUpdate, canDelete } = props
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState(null);
    const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
    const user = useAppSelector(state => state.account.user)

    const tableRef = useRef<ActionType>(null);

    const isFetching = useAppSelector(state => state.activity.isFetching);
    const meta = useAppSelector(state => state.activity.meta);
    const activities = useAppSelector(state => state.activity.data);
    const dispatch = useAppDispatch();

    const [cities, setCities] = useState([])
    const [eventOrganizers, setEventOrganizers] = useState([])

    const handleDeleteActivity = async (id: number | undefined) => {
        if (id) {
            const res: any = await callDeleteActivity(id);
            if (res?.isSuccess) {
                toast.success("Xóa activity thành công", {
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

    const handleGetCity = async (query: string) => {
        const res: any = await callFetchCity(query)
        if (res.isSuccess) {
            setCities(res.data)
        }
    }

    const handleGetUser = async (query: string) => {
        const res: any = await callFetchUser(query)
        if (res.isSuccess) {
            setEventOrganizers(res.data)
        }
    }

    useEffect(() => {
        handleGetCity(`current=1&pageSize=1000`)
        if (user.role === ROLE.ADMIN || user.role === ROLE.MARKETING_MANAGER) {
            handleGetUser(`current=1&pageSize=1000&role=${ROLE.EVENT_ORGANIZER}`)
        }
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
            title: "Thành phố",
            dataIndex: 'city',
            render: (_text, record, _index, _action) => {
                return (
                    <div>{record?.city?.name}</div>
                )
            },
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {

                const value: any = selectedKeys[0] || {};

                return (
                    <div style={{ padding: 12, width: 280 }}>
                        <Select
                            placeholder="Thành phố"
                            allowClear
                            value={value.city_id}
                            onChange={(val: any) =>
                                setSelectedKeys([
                                    { ...value, city_id: val }
                                ])
                            }
                            options={cities.map((item: any) => ({
                                label: item.name,
                                value: item.id,
                            }))}
                            style={{ width: "100%", marginBottom: 8 }}
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
            hideInSearch: true
        },
        {
            title: 'Người tổ chức sự kiện',
            dataIndex: 'event_organizer',
            render: (_text, record, _index, _action) => {
                return (
                    record?.event_organizer ? <div className="flex items-center gap-[10px]">
                        <img
                            src={getUserAvatar(record?.event_organizer?.avatar)}
                            className="min-w-[40px] max-w-[40px] h-[40px] object-cover rounded-[50%]"
                        />
                        <div>
                            <p className="leading-[20px]">{`${record?.event_organizer?.first_name} ${record?.event_organizer?.last_name}`}</p>
                            <p className="leading-[20px] text-[#929292]">{`@${record?.event_organizer?.username}`}</p>
                        </div>
                    </div> : <div></div>
                )
            },
            ...((user.role === ROLE.ADMIN || user.role === ROLE.MARKETING_MANAGER) ? {
                filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
                    const value: any = selectedKeys[0] || {};

                    return (
                        <div style={{ padding: 12, width: 280 }}>
                            <Select
                                placeholder="Người tổ chức sự kiện"
                                allowClear
                                value={value.event_organizer_id}
                                onChange={(val: any) =>
                                    setSelectedKeys([
                                        { ...value, event_organizer_id: val }
                                    ])
                                }
                                options={eventOrganizers.map((item: any) => ({
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
            } : {}),
            hideInSearch: true
        },
        {
            title: "Tên hoạt động",
            dataIndex: 'name',
            sorter: true,
            render: (_text, record, _index, _action) => {
                return (
                    <div onClick={() => {
                        setDataInit(record)
                        setIsModalDetailOpen(true)
                    }} className="bg-gray-200 p-[10px] rounded-[10px] cursor-pointer hover:bg-gray-300 transition-all duration-150">
                        <div className="flex items-center gap-3">
                            <img src={`${import.meta.env.VITE_BE_URL}${record?.images?.[0]?.image}`} className="w-[100px]" />
                            <p>{record.name}</p>
                        </div>
                        <div className="mt-[10px] flex items-center justify-center gap-[5px] text-[12px] italic">
                            <HiOutlineCursorClick />
                            <span>Click để xem chi tiết</span>
                        </div>
                    </div>
                )
            },
            width: 300
        },
        {
            title: 'Thông tin chi tiết',
            dataIndex: 'detail',
            render: (_text, record, _index, _action) => {
                return (
                    <div>
                        <p>- Danh mục: {(CATEGORY_ACTIVITY as any)[record.category]}</p>
                        <p>- Giá trung bình: {formatCurrency(record?.avg_price?.toFixed(0))}đ</p>
                        <p>- Số sao trung bình: {record?.avg_star?.toFixed(0)}</p>
                        <p>- Thời gian chơi: {record?.total_time} giờ</p>
                    </div>
                )
            },
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
                const value: any = selectedKeys[0] || {};

                return (
                    <div style={{ padding: 12, width: 280 }}>
                        <Select
                            placeholder="Danh mục"
                            allowClear
                            value={value.category}
                            onChange={(val: any) =>
                                setSelectedKeys([
                                    { ...value, category: val }
                                ])
                            }
                            options={Object.entries(CATEGORY_ACTIVITY).map(([key, val]) => {
                                return {
                                    label: val,
                                    value: key
                                }
                            })}
                            style={{ width: "100%", marginBottom: 8 }}
                        />
                        <Input
                            placeholder="Giá trung bình từ"
                            type="number"
                            value={value.min_avg_price}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, min_avg_price: e.target.value }
                                ])
                            }
                            onPressEnter={confirm as any}
                            style={{ marginBottom: 8 }}
                        />

                        <Input
                            placeholder="Giá trung bình đến"
                            type="number"
                            value={value.max_avg_price}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, max_avg_price: e.target.value }
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
                        <Input
                            placeholder="Thời gian chơi từ"
                            type="number"
                            value={value.min_total_time}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, min_total_time: e.target.value }
                                ])
                            }
                            onPressEnter={confirm as any}
                            style={{ marginBottom: 8 }}
                        />

                        <Input
                            placeholder="Thời gian chơi đến"
                            type="number"
                            value={value.max_total_time}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, max_total_time: e.target.value }
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
                    </Popconfirm>}

                </Space>
            ),
        }] : [])
    ];

    const buildQuery = (params: any, _sort: any, _filter: any) => {
        let temp = ""

        const clone = { ...params, currentPage: params.current, limit: params.pageSize };
        delete clone.current
        delete clone.pageSize

        temp += `current=${clone.currentPage}`
        temp += `&pageSize=${clone.limit}`

        if (_filter?.city?.[0]?.city_id) {
            temp += `&city_id=${_filter?.city?.[0]?.city_id}`
        }

        if (_filter?.event_organizer?.[0]?.event_organizer_id) {
            temp += `&event_organizer_id=${_filter?.event_organizer?.[0]?.event_organizer_id}`
        }

        if (_filter?.detail?.[0]?.category) {
            temp += `&category=${_filter?.detail?.[0]?.category}`
        }

        if (_filter?.detail?.[0]?.min_avg_price) {
            temp += `&min_avg_price=${_filter?.detail?.[0]?.min_avg_price}`
        }

        if (_filter?.detail?.[0]?.max_avg_price) {
            temp += `&max_avg_price=${_filter?.detail?.[0]?.max_avg_price}`
        }

        if (_filter?.detail?.[0]?.min_avg_star) {
            temp += `&min_avg_star=${_filter?.detail?.[0]?.min_avg_star}`
        }

        if (_filter?.detail?.[0]?.max_avg_star) {
            temp += `&max_avg_star=${_filter?.detail?.[0]?.max_avg_star}`
        }

        if (_filter?.detail?.[0]?.min_total_time) {
            temp += `&min_total_time=${_filter?.detail?.[0]?.min_total_time}`
        }

        if (_filter?.detail?.[0]?.max_total_time) {
            temp += `&max_total_time=${_filter?.detail?.[0]?.max_total_time}`
        }

        if (clone.name) {
            temp += `&name=${clone.name}`
        }
        if (clone.description) {
            temp += `&description=${clone.description}`
        }
        if (user.role === ROLE.EVENT_ORGANIZER) {
            temp += `&event_organizer_id=${user.id}`
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
            <ModalActivity
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
            <ModalActivityDetail
                activity={dataInit}
                isModalOpen={isModalDetailOpen}
                setIsModalOpen={setIsModalDetailOpen}
            />
        </div>
    );
}
