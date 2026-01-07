/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from "react";
import { Button, Popconfirm, Select, Space } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ActionType, ProColumns } from "@ant-design/pro-components";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { callDeleteAirline, callFetchUser } from "../../../config/api";
import DataTable from "../../antd/Table";
import { getImage, getUserAvatar } from "@/utils/imageUrl";
import { toast } from "react-toastify";
import { fetchAirline } from "@/redux/slice/airlineSlide";
import ModalAirline from "./ModalAirline";
import { ROLE } from "@/constants/role";
import _ from "lodash";

export default function Airline() {
    const user = useAppSelector(state => state.account.user)
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState(null);

    const tableRef = useRef<ActionType>(null);

    const isFetching = useAppSelector(state => state.airline.isFetching);
    const meta = useAppSelector(state => state.airline.meta);
    const airlines = useAppSelector(state => state.airline.data);
    const dispatch = useAppDispatch();

    const [users, setUsers] = useState([])

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

    const handleGetUser = async (query: string) => {
        const res: any = await callFetchUser(query)
        if (res.isSuccess) {
            setUsers(res.data)
        }
    }

    useEffect(() => {
        handleGetUser(`current=1&pageSize=1000&role=${ROLE.FLIGHT_OPERATION_STAFF}`)
    }, [])

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const columns: ProColumns<any>[] = [
        {
            title: "ID",
            dataIndex: 'id',
            hideInSearch: true,
            sorter: true,
        },
        {
            title: 'Người vận hành chuyến bay',
            dataIndex: 'flight_operations_staff',
            render: (_text, record, _index, _action) => {
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
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {

                const value: any = selectedKeys[0] || {};

                return (
                    <div style={{ padding: 12, width: 280 }}>
                        <Select
                            placeholder="Nhân viên vận hành chuyến bay"
                            allowClear
                            value={value.flight_operations_staff_id}
                            onChange={(val: any) =>
                                setSelectedKeys([
                                    { ...value, flight_operations_staff_id: val }
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
            hideInSearch: true
        },
        {
            title: "Tên",
            dataIndex: 'name',
            sorter: true,
        },
        {
            title: "Ảnh logo",
            dataIndex: 'logo',
            render: (_text, record, _index, _action) => {
                return (
                    <img src={`${getImage(record.logo)}`} />
                )
            },
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
            render: (_text, record, _index, _action) => {
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

    const buildQuery = (params: any, _sort: any, _filter: any) => {
        let temp = ""

        const clone = { ...params, currentPage: params.current, limit: params.pageSize };
        delete clone.current
        delete clone.pageSize

        temp += `current=${clone.currentPage}`
        temp += `&pageSize=${clone.limit}`
        if (_filter?.flight_operations_staff?.[0]?.flight_operations_staff_id) {
            temp += `&flight_operations_staff_id=${_filter?.flight_operations_staff?.[0]?.flight_operations_staff_id}`
        }
        if (clone.name) {
            temp += `&name=${clone.name}`
        }
        if (clone.description) {
            temp += `&description=${clone.description}`
        }
        if (clone.code) {
            temp += `&code=${clone.code}`
        }
        if (user.role === ROLE.FLIGHT_OPERATION_STAFF) {
            temp += `&flight_operations_staff_id=${user.id}`
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
