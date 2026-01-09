/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRef, useState } from "react";
import { Button, DatePicker, Input, Popconfirm, Select, Space } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ActionType, ProColumns } from "@ant-design/pro-components";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { callDeleteActivityDate, callDeleteBulkActivityDate, callFetchActivity, callFetchActivityPackage } from "../../../config/api";
import DataTable from "../../antd/Table";
import { fetchActivityDate } from "@/redux/slice/activityDateSlide";
import ModalActivityDate from "./ModalActivityDate";
import { toast } from "react-toastify";
import { formatCurrency } from "@/utils/formatCurrency";
import { getImage } from "@/utils/imageUrl";
import { ROLE } from "@/constants/role";
import _ from "lodash";
import ModalActivityDateDetail from "./ModalActivityDateDetail";
import { HiOutlineCursorClick } from "react-icons/hi";

interface IProps {
    canCreate?: boolean;
    canUpdate?: boolean;
    canDelete?: boolean;
}

export default function ActivityDate(props: IProps) {
    const { canCreate, canUpdate, canDelete } = props
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState(null);
    const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);

    const user = useAppSelector(state => state.account.user)

    const tableRef = useRef<ActionType>(null);

    const isFetching = useAppSelector(state => state.activityDate.isFetching);
    const meta = useAppSelector(state => state.activityDate.meta);
    const cities = useAppSelector(state => state.activityDate.data);
    const dispatch = useAppDispatch();

    const [activities, setActivities] = useState([])
    const [activitiesPackage, setActivitiesPackage] = useState([])

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
                toast.error("Có lỗi xảy ra", {
                    position: "bottom-right",
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

    const handleGetActivity = async (query: string) => {
        const res: any = await callFetchActivity(query)
        if (res.isSuccess) {
            setActivities(res.data)
        }
    }

    const handleGetActivityPackage = async (query: string) => {
        const res: any = await callFetchActivityPackage(query)
        if (res.isSuccess) {
            setActivitiesPackage(res.data)
        }
    }

    useState(() => {
        if (user.role === ROLE.ADMIN || user.role === ROLE.MARKETING_MANAGER) {
            handleGetActivity(`current=1&pageSize=1000`)
            handleGetActivityPackage(`current=1&pageSize=1000`)
        }
        else if (user.role === ROLE.EVENT_ORGANIZER) {
            handleGetActivity(`current=1&pageSize=1000&event_organizer_id=${user.id}`)
            handleGetActivityPackage(`current=1&pageSize=1000&event_organizer_id=${user.id}`)
        }
    })

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
            title: "Thông tin chi tiết",
            dataIndex: 'detail',
            render: (_text, record, _index, _action) => {
                return (
                    <div onClick={() => {
                        setDataInit(record)
                        setIsModalDetailOpen(true)
                    }} className="bg-gray-200 p-[10px] rounded-[10px] cursor-pointer hover:bg-gray-300 transition-all duration-150">
                        <div>
                            <p>- Ngày tổ chức: <span className="text-blue-light-500 font-semibold">{dayjs(record.date_launch).format('DD-MM-YYYY HH:mm:ss')}</span></p>
                            <p>- Giá người lớn: <span className="text-green-600 font-semibold">{formatCurrency(record?.price_adult)}đ</span></p>
                            <p>- Giá trẻ em: <span className="text-green-600 font-semibold">{formatCurrency(record?.price_child)}đ</span></p>
                            <p>- Sức chứa tối đa: {record?.max_participants} người</p>
                            <p>- Còn lại: {record?.participants_available} người</p>
                        </div>
                        <div className="mt-[10px] flex items-center justify-center gap-[5px] text-[12px] italic">
                            <HiOutlineCursorClick />
                            <span>Click để xem chi tiết</span>
                        </div>
                    </div >
                )
            },
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
                const value: any = selectedKeys[0] || {};

                return (
                    <div style={{ padding: 12, width: 280 }}>
                        <DatePicker
                            placeholder="Ngày bắt đầu"
                            value={value.min_date_launch ? dayjs(value.min_date_launch) : null}
                            onChange={(date, _dateString) => {
                                setSelectedKeys([
                                    { ...value, min_date_launch: date ? dayjs(date) : null }
                                ])

                            }}
                            style={{ marginBottom: 8, width: '100%' }}
                        />
                        <DatePicker
                            placeholder="Ngày kết thúc"
                            value={value.max_date_launch ? dayjs(value.max_date_launch) : null}
                            onChange={(date, _dateString) => {
                                setSelectedKeys([
                                    { ...value, max_date_launch: date ? dayjs(date) : null }
                                ])
                            }}
                            style={{ marginBottom: 8, width: '100%' }}
                        />
                        <Input
                            placeholder="Giá người lớn từ"
                            type="number"
                            value={value.min_price_adult}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, min_price_adult: e.target.value }
                                ])
                            }
                            onPressEnter={confirm as any}
                            style={{ marginBottom: 8 }}
                        />

                        <Input
                            placeholder="Giá người lớn đến"
                            type="number"
                            value={value.max_price_adult}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, max_price_adult: e.target.value }
                                ])
                            }
                            onPressEnter={confirm as any}
                            style={{ marginBottom: 8 }}
                        />
                        <Input
                            placeholder="Giá trẻ em từ"
                            type="number"
                            value={value.min_price_child}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, min_price_child: e.target.value }
                                ])
                            }
                            onPressEnter={confirm as any}
                            style={{ marginBottom: 8 }}
                        />

                        <Input
                            placeholder="Giá trẻ em đến"
                            type="number"
                            value={value.max_price_child}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, max_price_child: e.target.value }
                                ])
                            }
                            onPressEnter={confirm as any}
                            style={{ marginBottom: 8 }}
                        />
                        <Input
                            placeholder="Sức chứa tối đa từ"
                            type="number"
                            value={value.min_max_participants}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, min_max_participants: e.target.value }
                                ])
                            }
                            onPressEnter={confirm as any}
                            style={{ marginBottom: 8 }}
                        />

                        <Input
                            placeholder="Sức chứa tối đa đến"
                            type="number"
                            value={value.max_max_participants}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, max_max_participants: e.target.value }
                                ])
                            }
                            onPressEnter={confirm as any}
                            style={{ marginBottom: 8 }}
                        />
                        <Input
                            placeholder="Còn lại từ"
                            type="number"
                            value={value.min_participants_available}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, min_participants_available: e.target.value }
                                ])
                            }
                            onPressEnter={confirm as any}
                            style={{ marginBottom: 8 }}
                        />

                        <Input
                            placeholder="Còn lại đến"
                            type="number"
                            value={value.max_participants_available}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, max_participants_available: e.target.value }
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
            title: "Tên hoạt động",
            dataIndex: 'activity',
            render: (_text, record, _index, _action) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        <img
                            src={getImage(record?.activity_package?.activity?.thumbnail)}
                            className="w-[70px] h-[50px] object-cover"
                        />
                        <div>
                            <p>{record?.activity_package?.activity?.name}</p>
                            <p className="font-semibold">Gói: <span className="text-blue-500">{record?.activity_package?.name}</span></p>
                        </div>
                    </div>
                )
            },
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {

                const value: any = selectedKeys[0] || {};

                return (
                    <div style={{ padding: 12, width: 280 }}>
                        <Select
                            placeholder="Hoạt động"
                            allowClear
                            value={value.activity_id}
                            onChange={async (val: any) => {
                                setSelectedKeys([
                                    { ...value, activity_id: val }
                                ])
                                if (val) {
                                    await handleGetActivityPackage(`current=1&pageSize=1000&activity_id=${val}`)
                                }
                                else {
                                    if (user.role === ROLE.ADMIN || user.role === ROLE.MARKETING_MANAGER) {
                                        await handleGetActivityPackage(`current=1&pageSize=1000`)
                                    }
                                    else if (user.role === ROLE.EVENT_ORGANIZER) {
                                        await handleGetActivityPackage(`current=1&pageSize=1000&event_organizer_id=${user.id}`)
                                    }

                                }
                            }}
                            options={activities.map((item: any) => ({
                                label: <div className="flex items-center gap-[10px]">
                                    <img
                                        src={getImage(item?.images?.[0]?.image)}
                                        className="w-[70px] h-[50px] object-cover"
                                    />
                                    <div>
                                        <p>{item?.name}</p>
                                    </div>
                                </div>,
                                value: item.id,
                            }))}
                            style={{ width: "100%", marginBottom: 8, height: 60 }}
                        />
                        <Select
                            placeholder="Gói của hoạt động"
                            allowClear
                            value={value.activity_package_id}
                            onChange={(val: any) =>
                                setSelectedKeys([
                                    { ...value, activity_package_id: val }
                                ])
                            }
                            options={activitiesPackage.map((item: any) => ({
                                label: <div className="flex items-center gap-[10px]">
                                    <div>
                                        <p>{item?.name}</p>
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
            hideInSearch: true
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

        if (_filter?.detail?.[0]?.min_date_launch) {
            temp += `&min_date_launch=${dayjs(_filter.detail[0].min_date_launch).format("YYYY-MM-DD")}`
        }
        if (_filter?.detail?.[0]?.max_date_launch) {
            temp += `&max_date_launch=${dayjs(_filter.detail[0].max_date_launch).format("YYYY-MM-DD")}`
        }
        if (_filter?.detail?.[0]?.min_price_adult) {
            temp += `&min_price_adult=${_filter?.detail?.[0]?.min_price_adult}`
        }
        if (_filter?.detail?.[0]?.max_price_adult) {
            temp += `&max_price_adult=${_filter?.detail?.[0]?.max_price_adult}`
        }
        if (_filter?.detail?.[0]?.min_price_child) {
            temp += `&min_price_child=${_filter?.detail?.[0]?.min_price_child}`
        }
        if (_filter?.detail?.[0]?.max_price_child) {
            temp += `&max_price_child=${_filter?.detail?.[0]?.max_price_child}`
        }
        if (_filter?.detail?.[0]?.min_max_participants) {
            temp += `&min_max_participants=${_filter?.detail?.[0]?.min_max_participants}`
        }
        if (_filter?.detail?.[0]?.max_max_participants) {
            temp += `&max_max_participants=${_filter?.detail?.[0]?.max_max_participants}`
        }
        if (_filter?.detail?.[0]?.min_participants_available) {
            temp += `&min_participants_available=${_filter?.detail?.[0]?.min_participants_available}`
        }
        if (_filter?.detail?.[0]?.max_participants_available) {
            temp += `&max_participants_available=${_filter?.detail?.[0]?.max_participants_available}`
        }

        if (_filter?.activity?.[0]?.activity_id) {
            temp += `&activity_id=${_filter?.activity?.[0]?.activity_id}`
        }
        if (_filter?.activity?.[0]?.activity_package_id) {
            temp += `&activity_package_id=${_filter?.activity?.[0]?.activity_package_id}`
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
                rowSelection={canDelete ? {
                    onChange: (_, selectedRows) => {
                        setSelectedRows(selectedRows);
                    }
                } : false}
                handleDelete={canDelete ? handleDeleteMultipleRow : undefined}
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
            <ModalActivityDate
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
            <ModalActivityDateDetail
                activityDate={dataInit}
                isModalOpen={isModalDetailOpen}
                setIsModalOpen={setIsModalDetailOpen}
            />
        </div>
    );
}
