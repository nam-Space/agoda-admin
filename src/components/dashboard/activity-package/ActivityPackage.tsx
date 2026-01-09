/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from "react";
import { Button, Popconfirm, Select, Space } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ActionType, ProColumns } from "@ant-design/pro-components";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { callDeleteActivityPackage, callFetchActivity } from "../../../config/api";
import DataTable from "../../antd/Table";
import ModalActivityPackage from "./ModalActivityPackage";
import { fetchActivityPackage } from "@/redux/slice/activityPackageSlide";
import { getImage } from "@/utils/imageUrl";
import { ROLE } from "@/constants/role";
import { toast } from "react-toastify";
import _ from "lodash";
import { HiOutlineCursorClick } from "react-icons/hi";
import ModalActivityPackageDetail from "./ModalActivityPackageDetail";

interface IProps {
    canCreate?: boolean;
    canUpdate?: boolean;
    canDelete?: boolean;
}

export default function ActivityPackage(props: IProps) {
    const { canCreate, canUpdate, canDelete } = props
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState(null);
    const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
    const user = useAppSelector(state => state.account.user)

    const tableRef = useRef<ActionType>(null);

    const isFetching = useAppSelector(state => state.activityPackage.isFetching);
    const meta = useAppSelector(state => state.activityPackage.meta);
    const cities = useAppSelector(state => state.activityPackage.data);
    const dispatch = useAppDispatch();

    const [activities, setActivities] = useState([])

    const handleDeleteActivityPackage = async (id: number | undefined) => {
        if (id) {
            const res: any = await callDeleteActivityPackage(id);
            if (res?.isSuccess) {
                toast.success("Xóa activity package thành công", {
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

    const handleGetActivity = async (query: string) => {
        const res: any = await callFetchActivity(query)
        if (res.isSuccess) {
            setActivities(res.data)
        }
    }

    useEffect(() => {
        if (user.role === ROLE.ADMIN || user.role === ROLE.MARKETING_MANAGER) {
            handleGetActivity(`current=1&pageSize=1000`)
        }
        else if (user.role === ROLE.EVENT_ORGANIZER) {
            handleGetActivity(`current=1&pageSize=1000&event_organizer_id=${user.id}`)
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
            title: "Hoạt động",
            dataIndex: 'activity',
            render: (_text, record, _index, _action) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        <img
                            src={getImage(record?.activity?.images?.[0]?.image)}
                            className="w-[70px] h-[50px] object-cover"
                        />
                        <div>
                            <p className="leading-[20px]">{`${record?.activity?.name}`}</p>
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
                            onChange={(val: any) =>
                                setSelectedKeys([
                                    { ...value, activity_id: val }
                                ])
                            }
                            options={activities.map((item: any) => ({
                                label: <div className="flex items-center gap-[10px]">
                                    <img
                                        src={getImage(item?.images?.[0]?.image)}
                                        className="w-[70px] h-[50px] object-cover"
                                    />
                                    <div>
                                        <p className="leading-[20px]">{`${item?.name}`}</p>
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
            title: "Tên gói của hoạt động",
            dataIndex: 'name',
            sorter: true,
            render: (_text, record, _index, _action) => {
                return (
                    <div onClick={() => {
                        setDataInit(record)
                        setIsModalDetailOpen(true)
                    }} className="bg-gray-200 p-[10px] rounded-[10px] cursor-pointer hover:bg-gray-300 transition-all duration-150">
                        <div className="flex items-center gap-3">
                            <p>{record.name}</p>
                        </div>
                        <div className="mt-[10px] flex items-center justify-center gap-[5px] text-[12px] italic">
                            <HiOutlineCursorClick />
                            <span>Click để xem chi tiết</span>
                        </div>
                    </div>
                )
            },

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
                        title={"Xác nhận xóa activity package"}
                        description={"Bạn chắc chắn muốn xóa activity package"}
                        onConfirm={() => handleDeleteActivityPackage(entity.id)}
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

        },] : [])

    ];

    const buildQuery = (params: any, _sort: any, _filter: any) => {
        let temp = ""

        const clone = { ...params, currentPage: params.current, limit: params.pageSize };
        delete clone.current
        delete clone.pageSize

        temp += `current=${clone.currentPage}`
        temp += `&pageSize=${clone.limit}`

        if (_filter?.activity?.[0]?.activity_id) {
            temp += `&activity_id=${_filter?.activity?.[0]?.activity_id}`
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
                headerTitle={"Danh sách activity package"}
                rowKey="id"
                loading={isFetching}
                columns={columns}
                dataSource={cities}
                request={async (params, sort, filter): Promise<any> => {
                    const query = buildQuery(params, sort, filter);
                    dispatch(fetchActivityPackage({ query }))
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
            <ModalActivityPackage
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
            <ModalActivityPackageDetail
                activityPackage={dataInit}
                isModalOpen={isModalDetailOpen}
                setIsModalOpen={setIsModalDetailOpen}
            />
        </div>
    );
}
